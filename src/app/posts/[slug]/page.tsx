import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'

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
 * 글 상세 페이지
 * F002 본문 / F010-F014 / F016 TL;DR / F017 패턴 변환 / F018 연동 문서 / F019 추천
 * Phase 4 Task 013에서 본격 구현 (TL;DR + 본문 + 연동/추천 카드)
 */
export default async function PostDetail({ params }: PostDetailProps) {
  const { slug } = await params
  const postSlug = decodeURIComponent(slug)

  return (
    <Container>
      <article className="prose dark:prose-invert mx-auto py-12">
        <h1>{postSlug}</h1>
        <p>본문을 불러오는 동안 표시되는 임시 콘텐츠입니다.</p>
        {/* TL;DR 박스 (F016) — Phase 4 Task 013 */}
        {/* 본문 렌더링 (F002 + F017) — Phase 4 Task 013 */}
        {/* 연동 문서 카드 그리드 (F018) — Phase 4 Task 013 */}
        {/* 동일 분류 추천 (F019) — Phase 4 Task 013 */}
      </article>
    </Container>
  )
}
