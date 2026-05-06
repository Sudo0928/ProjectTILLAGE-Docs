import { Container } from '@/components/layout/container'

export const revalidate = 60

interface CategoryDetailProps {
  params: Promise<{ slug: string }>
}

/**
 * 카테고리 상세 페이지
 * F001 글 목록 / F003 카테고리 / F010-F013 / F019 독자 수준 칩
 * Phase 4 Task 011에서 분류별 글 카드 그리드 구현
 */
export default async function CategoryDetail({ params }: CategoryDetailProps) {
  const { slug } = await params
  const categoryName = decodeURIComponent(slug)

  return (
    <Container>
      <div className="space-y-6 py-12">
        <h1 className="text-3xl font-bold">분류: {categoryName}</h1>
        <p className="text-muted-foreground mt-2">
          이 분류에 속한 발행 글 목록을 표시합니다.
        </p>
        {/* 분류별 글 카드 그리드 (F001/F003) — Phase 4 Task 011에서 구현 */}
      </div>
    </Container>
  )
}
