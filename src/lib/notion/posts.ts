// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import { unstable_cache } from 'next/cache'
import {
  collectPaginatedAPI,
  isFullBlock,
  isFullPage,
  type PageObjectResponse,
} from '@notionhq/client'

import { getNotionClient, getNotionDataSourceId } from '@/lib/notion/client'
import { notionPagePropertiesSchema } from '@/lib/notion/schemas'
import { pageIdFromSlug, slugFromPageId } from '@/lib/notion/slug'
import type {
  NotionBlock,
  Post,
  PostContent,
  Publication,
  ReaderLevel,
} from '@/types/post'
import { searchParamsSchema } from '@/types/post'

/**
 * Notion 글 데이터 함수 — F001 / F002 / F004 / F015 / F019 핵심 5종
 *
 * 핵심 정책:
 *   - 모든 query에 `웹 게시 === '발행됨'` 필터 강제 (절대 금지 #9, shrimp-rules.md 5.2)
 *   - F019 동일 분류 추천은 LIMIT (limit+1) + currentId 후처리 강제 (절대 금지 #20, shrimp-rules.md 5.6)
 *   - Notion v5 SDK: `dataSources.query({ data_source_id })` 사용 (databases.query 아님)
 *   - 결과 타입 `{ posts/post, error }` 형식 — 호출 측 ErrorState 분기 (5.5)
 *   - 한국어 에러 메시지 변형 금지 (ErrorState UI 부분 매칭 일관성)
 *   - `unstable_cache` wrapper로 60초 ISR 메모이즈
 */

/** 결과 타입 — 호출 측이 빈 결과/실패를 구분 가능 */
export type PostsResult = { posts: Post[]; error: string | null }
export type PostResult = { post: PostContent | null; error: string | null }

/** 한국어 에러 메시지 — ErrorState 부분 매칭 일관성 (변형 금지) */
const ERR_FETCH_FAILED =
  '글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
const ERR_POST_FETCH_FAILED =
  '글 본문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'

/**
 * Notion PageObjectResponse → Post 도메인 타입 정규화
 *
 * 8개 한글 속성 → 영문 키 매핑 (PRD "속성 매핑 표"):
 *   항목→title / 분류→category / 태그→tags / 발행일→publishedAt(미설정 시 last_edited_time fallback)
 *   웹 게시→publication / 요약→summary / 독자 수준→readerLevel / 추천 순위→recommendOrder
 */
function normalizePost(page: PageObjectResponse): Post {
  const props = notionPagePropertiesSchema.parse(page.properties)

  const titleText = props.항목.title.map(t => t.plain_text).join('')
  const summaryText = props.요약.rich_text
    .map(t => t.plain_text)
    .join('')
    .trim()

  const coverImage =
    page.cover?.type === 'external'
      ? page.cover.external.url
      : page.cover?.type === 'file'
        ? page.cover.file.url
        : null

  // Zod z.enum이 generic widening으로 string 추론되는 경우를 대비한 명시적 리터럴 narrowing
  const publicationName = props['웹 게시'].select?.name
  const publication: Publication =
    publicationName === '발행됨' ? '발행됨' : '초안'

  const readerLevelName = props['독자 수준'].select?.name
  const readerLevel: ReaderLevel | null =
    readerLevelName === '입문' ||
    readerLevelName === '중급' ||
    readerLevelName === '심화'
      ? readerLevelName
      : null

  return {
    id: page.id,
    slug: slugFromPageId(page.id),
    title: titleText,
    summary: summaryText.length > 0 ? summaryText : null,
    category: props.분류.select?.name ?? '',
    tags: props.태그.multi_select.map(t => t.name),
    publishedAt: props.발행일.date?.start ?? page.last_edited_time,
    publication,
    coverImage,
    readerLevel,
    recommendOrder: props['추천 순위'].number,
  }
}

/**
 * F001: 발행 글 전체 조회
 *
 * - 페이지네이션: page_size 100 + start_cursor + has_more 루프
 * - 정렬: Notion query에서 `발행일 desc` 단일 정렬 후, 인메모리에서 fallback 보정
 * - 발행일 미설정 글은 normalizePost가 last_edited_time을 publishedAt에 채워주므로 정렬 자연 동작
 */
async function _getPublishedPostsImpl(): Promise<PostsResult> {
  try {
    const notion = getNotionClient()
    const dataSourceId = await getNotionDataSourceId()
    const allPages: PageObjectResponse[] = []
    let cursor: string | undefined = undefined
    do {
      const res = await notion.dataSources.query({
        data_source_id: dataSourceId,
        filter: { property: '웹 게시', select: { equals: '발행됨' } },
        sorts: [{ property: '발행일', direction: 'descending' }],
        page_size: 100,
        start_cursor: cursor,
      })
      for (const r of res.results) {
        if (isFullPage(r)) {
          allPages.push(r)
        }
      }
      cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined
    } while (cursor !== undefined)

    const posts = allPages.map(normalizePost)
    posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    return { posts, error: null }
  } catch (e) {
    console.error('[getPublishedPosts]', e)
    return { posts: [], error: ERR_FETCH_FAILED }
  }
}

export const getPublishedPosts = unstable_cache(
  _getPublishedPostsImpl,
  ['getPublishedPosts'],
  { revalidate: 60, tags: ['posts'] }
)

/**
 * F002: 글 상세 조회 (slug → page ID + blocks)
 *
 * - slug 형식 오류 또는 발행 상태 미일치 시 `{ post: null, error: null }` 반환 (404 효과)
 * - 블록은 `collectPaginatedAPI(notion.blocks.children.list, ...)`로 자동 페이지네이션
 * - 발행 상태 검증 — 절대 금지 #9
 */
async function _getPostBySlugImpl(slug: string): Promise<PostResult> {
  try {
    const notion = getNotionClient()
    let pageId: string
    try {
      pageId = pageIdFromSlug(slug)
    } catch {
      return { post: null, error: null }
    }

    const page = await notion.pages.retrieve({ page_id: pageId })
    if (!isFullPage(page)) {
      return { post: null, error: null }
    }

    const props = notionPagePropertiesSchema.parse(page.properties)
    if (props['웹 게시'].select?.name !== '발행됨') {
      return { post: null, error: null }
    }

    const rawBlocks = await collectPaginatedAPI(notion.blocks.children.list, {
      block_id: pageId,
    })

    const blocks: NotionBlock[] = rawBlocks.filter(isFullBlock).map(b => ({
      id: b.id,
      type: b.type,
      content: b,
    }))

    const coverImage =
      page.cover?.type === 'external'
        ? page.cover.external.url
        : page.cover?.type === 'file'
          ? page.cover.file.url
          : null

    return {
      post: {
        postId: page.id,
        blocks,
        coverImage,
        lastEditedAt: page.last_edited_time,
      },
      error: null,
    }
  } catch (e) {
    console.error('[getPostBySlug]', e)
    return { post: null, error: ERR_POST_FETCH_FAILED }
  }
}

export const getPostBySlug = unstable_cache(
  _getPostBySlugImpl,
  ['getPostBySlug'],
  { revalidate: 60, tags: ['posts', 'post-content'] }
)

/**
 * F004: 검색 (제목/태그 부분 일치, 소문자 정규화)
 *
 * - Notion API의 title contains() filter는 태그 부분 일치 미지원이므로 인메모리 필터로 우회
 * - searchParamsSchema로 q 검증 (q.trim().min(1).max(200), 한국어 검증 메시지)
 * - getPublishedPosts() 위에서 합성 (캐시 재사용)
 */
export async function searchPosts(query: string): Promise<PostsResult> {
  const parsed = searchParamsSchema.safeParse({ q: query })
  if (!parsed.success) {
    return {
      posts: [],
      error: parsed.error.issues[0]?.message ?? '검색어가 올바르지 않습니다.',
    }
  }
  const { posts, error } = await getPublishedPosts()
  if (error !== null) {
    return { posts: [], error }
  }
  const q = parsed.data.q.toLowerCase()
  const filtered = posts.filter(
    p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
  )
  return { posts: filtered, error: null }
}

/**
 * F015: 추천 글 (추천 순위 1~3, asc + 발행일 desc tie-break)
 *
 * - filter: 웹 게시=발행됨 AND 추천 순위 in [1, 3]
 * - sorts: 추천 순위 asc → 발행일 desc (multi-sort)
 */
async function _getRecommendedPostsImpl(limit: number): Promise<PostsResult> {
  try {
    const notion = getNotionClient()
    const dataSourceId = await getNotionDataSourceId()
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          { property: '웹 게시', select: { equals: '발행됨' } },
          {
            property: '추천 순위',
            number: { greater_than_or_equal_to: 1 },
          },
          {
            property: '추천 순위',
            number: { less_than_or_equal_to: 3 },
          },
        ],
      },
      sorts: [
        { property: '추천 순위', direction: 'ascending' },
        { property: '발행일', direction: 'descending' },
      ],
      page_size: limit,
    })
    const posts = res.results.filter(isFullPage).map(normalizePost)
    return { posts, error: null }
  } catch (e) {
    console.error('[getRecommendedPosts]', e)
    return { posts: [], error: ERR_FETCH_FAILED }
  }
}

export const getRecommendedPosts = unstable_cache(
  _getRecommendedPostsImpl,
  ['getRecommendedPosts'],
  { revalidate: 60, tags: ['posts', 'recommended'] }
)

/**
 * F019: 동일 분류 추천 — LIMIT (limit+1) + currentId 후처리 (절대 금지 #20)
 *
 * Notion API의 `does_not_equal` ID 필터 부재로 인한 우회 패턴 강제.
 * page_size: limit+1로 fetch 후 .filter(p => p.id !== currentId).slice(0, limit)
 */
async function _getRelatedPostsByCategoryImpl(
  category: string,
  currentId: string,
  limit: number
): Promise<PostsResult> {
  try {
    const notion = getNotionClient()
    const dataSourceId = await getNotionDataSourceId()
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          { property: '웹 게시', select: { equals: '발행됨' } },
          { property: '분류', select: { equals: category } },
        ],
      },
      sorts: [{ property: '발행일', direction: 'descending' }],
      page_size: limit + 1,
    })
    const all = res.results.filter(isFullPage).map(normalizePost)
    const filtered = all.filter(p => p.id !== currentId).slice(0, limit)
    return { posts: filtered, error: null }
  } catch (e) {
    console.error('[getRelatedPostsByCategory]', e)
    return { posts: [], error: ERR_FETCH_FAILED }
  }
}

export const getRelatedPostsByCategory = unstable_cache(
  _getRelatedPostsByCategoryImpl,
  ['getRelatedPostsByCategory'],
  { revalidate: 60, tags: ['posts', 'related'] }
)
