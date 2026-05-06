// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import { unstable_cache } from 'next/cache'

import { getPublishedPosts, type PostsResult } from '@/lib/notion/posts'
import { slugFromCategoryName } from '@/lib/notion/slug'
import type { Category } from '@/types/post'

/**
 * Notion 카테고리 데이터 함수 — F003 핵심 2종
 *
 * 핵심 정책:
 *   - 단일 query (getPublishedPosts)로 모든 발행 글 fetch 후 인메모리 집계 — 17개 분류 분할 query 회피로 rate limit 보호
 *   - 결과 타입 `{ categories/posts, error }` 형식 (5.5)
 *   - 정렬: postCount desc → 이름 asc (ko locale)
 *   - getPostsByCategory는 slugFromCategoryName 직접 매칭으로 중복 fetch 제거
 */

export type CategoriesResult = {
  categories: Category[]
  error: string | null
}

/**
 * F003: 카테고리 목록 (단일 query → 인메모리 집계)
 *
 * getPublishedPosts() 결과를 받아 분류별 글 수 집계.
 * 글 수 0건 분류는 결과에 포함되지 않음 (인덱스 페이지에서 별도 정책으로 흐리게 처리 가능).
 *
 * @returns CategoriesResult — categories 배열은 postCount desc + 이름 asc 정렬
 */
async function _getCategoriesImpl(): Promise<CategoriesResult> {
  const { posts, error } = await getPublishedPosts()
  if (error !== null) {
    return { categories: [], error }
  }
  const counts = new Map<string, number>()
  for (const p of posts) {
    if (p.category.length === 0) continue
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  }
  const categories: Category[] = Array.from(counts.entries()).map(
    ([name, postCount]) => ({
      name,
      slug: slugFromCategoryName(name),
      postCount,
    })
  )
  categories.sort(
    (a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name, 'ko')
  )
  return { categories, error: null }
}

export const getCategories = unstable_cache(
  _getCategoriesImpl,
  ['getCategories'],
  { revalidate: 60, tags: ['categories'] }
)

/**
 * F003: 분류별 발행 글 (slug 직접 매칭)
 *
 * 보강 사항(reflect_task 단계): categoryNameFromSlug 분리 호출 대신, getPublishedPosts 결과에
 * 직접 slugFromCategoryName(p.category) === slug 필터를 적용하여 getCategories 중복 호출 제거.
 *
 * @param slug URL 슬러그 (예: '핵심-정의-문서')
 * @returns PostsResult — 일치 분류 글, 발행일 desc 정렬 유지
 */
export async function getPostsByCategory(slug: string): Promise<PostsResult> {
  const { posts, error } = await getPublishedPosts()
  if (error !== null) {
    return { posts: [], error }
  }
  const filtered = posts.filter(p => slugFromCategoryName(p.category) === slug)
  return { posts: filtered, error: null }
}
