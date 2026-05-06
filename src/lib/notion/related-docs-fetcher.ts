// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import { isFullPage } from '@notionhq/client'
import { unstable_cache } from 'next/cache'

import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client'

import { getNotionClient } from '@/lib/notion/client'
import { notionPagePropertiesSchema } from '@/lib/notion/schemas'
import { extractSectionsByHeading } from '@/lib/notion/section-utils'
import { slugFromPageId } from '@/lib/notion/slug'

/**
 * F018 연동 문서 카드 메타 타입
 *
 * 비공개(초안/미발행) 페이지는 포함되지 않으며, 멘션 fetch 실패 시 graceful 제외.
 */
export interface RelatedDocMeta {
  /** Notion 페이지 ID */
  pageId: string
  /** URL 슬러그 (slugFromPageId 결과, 32자 hex) */
  slug: string
  /** 글 제목 (Notion 항목 속성) */
  title: string
  /** 분류 이름 (이모지 포함, 없으면 빈 문자열) */
  category: string
  /** 요약 텍스트 (없으면 null) */
  summary: string | null
}

/** `# N. 연동 문서` 섹션 heading_1 매칭 정규식 */
const RELATED_DOCS_REGEX = /^\s*\d+\.\s*연동\s*문서\s*$/

/**
 * 단일 페이지 메타 fetch 구현체 (unstable_cache 래핑 전 원본)
 *
 * 발행 상태(웹 게시 === '발행됨') 검증 포함 (절대 금지 #9).
 * 권한 부족 / 404 / 초안 페이지는 null 반환 (graceful 처리).
 * 동일 pageId 반복 호출 시 캐시 hit으로 fetch 호출 0회 — dev 로그로 검증 가능.
 *
 * @param pageId - 조회할 Notion 페이지 ID
 * @returns 발행된 페이지 메타 또는 null
 */
async function _fetchOnePageMetaImpl(
  pageId: string
): Promise<RelatedDocMeta | null> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[related-docs] fetch start', pageId)
  }
  try {
    const notion = getNotionClient()
    const page = await notion.pages.retrieve({ page_id: pageId })

    if (!isFullPage(page)) {
      return null
    }

    const props = notionPagePropertiesSchema.parse(page.properties)

    // 발행 상태 검증 — 절대 금지 #9: 초안/미발행 페이지 노출 금지
    if (props['웹 게시'].select?.name !== '발행됨') {
      return null
    }

    const title = props.항목.title.map(t => t.plain_text).join('')
    // schemas.ts의 richTextProp은 { plain_text: string }[] 형태이므로 직접 join
    const summaryText = props.요약.rich_text
      .map(t => t.plain_text)
      .join('')
      .trim()
    const summary: string | null = summaryText.length > 0 ? summaryText : null
    const category = props.분류.select?.name ?? ''

    return {
      pageId,
      slug: slugFromPageId(pageId),
      title,
      category,
      summary,
    }
  } catch (e) {
    // 권한 부족 / 존재하지 않는 페이지 / 초안 — graceful 처리
    if (process.env.NODE_ENV === 'development') {
      console.warn('[related-docs] fetch fail', pageId, e)
    }
    return null
  }
}

/**
 * 단일 페이지 메타 fetch (빌드 단위 메모이즈)
 *
 * unstable_cache로 래핑 — 동일 pageId 반복 호출 시 캐시 재사용 (절대 금지 #19).
 * revalidate: 60초, tags: ['posts', 'related-docs'].
 */
const fetchOnePageMeta = unstable_cache(
  _fetchOnePageMetaImpl,
  ['related-doc-meta'],
  { revalidate: 60, tags: ['posts', 'related-docs'] }
)

/**
 * F018: 블록 배열에서 연동 문서 메타 목록 추출
 *
 * 처리 순서:
 * 1) `# N. 연동 문서` heading_1 섹션 블록 추출
 * 2) 각 블록의 rich_text 순회 → type === 'mention' && mention.type === 'page' 페이지 ID 수집
 * 3) Set으로 중복 pageId 제거
 * 4) Promise.all로 병렬 메타 fetch
 * 5) null(비공개/실패) 제거 후 반환
 *
 * 빈 결과 시 연동 문서 영역 자체가 미렌더링됨 (page.tsx에서 length > 0 조건 분기).
 *
 * @param blocks - 글 상세 전체 블록 배열
 * @returns 발행된 연동 문서 메타 목록 (비어있을 수 있음)
 */
export async function getRelatedDocs(
  blocks: BlockObjectResponse[]
): Promise<RelatedDocMeta[]> {
  // 1) 연동 문서 섹션 블록 추출
  const sections = extractSectionsByHeading(blocks, headingText =>
    RELATED_DOCS_REGEX.test(headingText)
  )

  if (sections.length === 0) {
    return []
  }

  // 2) 모든 섹션 블록에서 page mention ID 수집
  const mentionedPageIds: string[] = []

  for (const sectionBlocks of sections) {
    for (const block of sectionBlocks) {
      // 블록 rich_text 추출 — table_row는 flat() 처리됨
      const richTextItems = getRichTextWithMentions(block)
      for (const item of richTextItems) {
        if (item.type === 'mention' && item.mention.type === 'page') {
          mentionedPageIds.push(item.mention.page.id)
        }
      }
    }
  }

  // 3) 중복 제거
  const uniqueIds = [...new Set(mentionedPageIds)]

  if (uniqueIds.length === 0) {
    return []
  }

  // 4) 병렬 메타 fetch (절대 금지 #19 — unstable_cache로 메모이즈됨)
  const results = await Promise.all(uniqueIds.map(id => fetchOnePageMeta(id)))

  // 5) null 제거 (비공개/실패 페이지)
  return results.filter((m): m is RelatedDocMeta => m !== null)
}

/**
 * 블록에서 mention을 포함한 rich_text 항목 추출
 *
 * page mention은 paragraph/bulleted_list_item 등 다양한 블록에 등장.
 * getRichTextFromBlock과 달리 RichTextItemResponse 전체를 반환 (mention 타입 보존).
 *
 * @param block - 대상 블록
 * @returns RichTextItemResponse 배열 (mention 포함, 없으면 빈 배열)
 */
function getRichTextWithMentions(
  block: BlockObjectResponse
): RichTextItemResponse[] {
  switch (block.type) {
    case 'paragraph':
      return block.paragraph.rich_text
    case 'heading_1':
      return block.heading_1.rich_text
    case 'heading_2':
      return block.heading_2.rich_text
    case 'heading_3':
      return block.heading_3.rich_text
    case 'bulleted_list_item':
      return block.bulleted_list_item.rich_text
    case 'numbered_list_item':
      return block.numbered_list_item.rich_text
    case 'quote':
      return block.quote.rich_text
    case 'callout':
      return block.callout.rich_text
    case 'toggle':
      return block.toggle.rich_text
    default:
      return []
  }
}
