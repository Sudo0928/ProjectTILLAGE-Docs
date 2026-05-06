import type { Metadata } from 'next'

import { Container } from '@/components/layout/container'
import { getPostBySlug } from '@/lib/notion/posts'

export const revalidate = 60

interface PostDetailProps {
  params: Promise<{ slug: string }>
}

/**
 * 글 상세 페이지 메타데이터 (자리만 정의 — Phase 5 Task 014에서 본격 구현)
 */
export async function generateMetadata({
  params,
}: PostDetailProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: decodeURIComponent(slug),
  }
}

/**
 * 글 상세 페이지 (Phase 2-005 임시 데이터 검증용 — Phase 4 Task 013에서 본격 UI로 교체)
 *
 * F002 본문 / F010-F014 / F016 TL;DR / F017 패턴 변환 / F018 연동 문서 / F019 추천
 * 본 페이지는 Phase 2-005 getPostBySlug() 데이터 흐름 검증용 임시 본문이며,
 * Phase 4 Task 013에서 TL;DR + 본문 + 연동/추천 카드로 본격 구현된다.
 */
export default async function PostDetail({ params }: PostDetailProps) {
  const { slug } = await params
  const postSlug = decodeURIComponent(slug)
  const { post, error } = await getPostBySlug(postSlug)

  return (
    <Container>
      <article className="prose dark:prose-invert mx-auto py-12">
        <h1>{postSlug}</h1>
        {error !== null ? (
          <p className="text-destructive">{error}</p>
        ) : post === null ? (
          <p>발행된 글을 찾을 수 없습니다.</p>
        ) : (
          <>
            <p className="text-muted-foreground">
              본 영역은 Phase 4 Task 013에서 본격 UI로 교체될 예정입니다 (현재
              데이터 검증용 임시 출력).
            </p>
            <h2>임시 메타 정보</h2>
            <ul>
              <li>postId: {post.postId}</li>
              <li>lastEditedAt: {post.lastEditedAt}</li>
              <li>blocks 개수: {post.blocks.length}</li>
              <li>coverImage: {post.coverImage ?? '없음'}</li>
            </ul>
          </>
        )}
        {/* TL;DR 박스 (F016) — Phase 4 Task 013 */}
        {/* 본문 렌더링 (F002 + F017) — Phase 4 Task 013 */}
        {/* 연동 문서 카드 그리드 (F018) — Phase 4 Task 013 */}
        {/* 동일 분류 추천 (F019) — Phase 4 Task 013 */}
      </article>
    </Container>
  )
}
