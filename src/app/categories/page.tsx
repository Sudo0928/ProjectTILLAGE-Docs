import { Container } from '@/components/layout/container'

export const revalidate = 60

/**
 * 카테고리 인덱스 페이지
 * F003 카테고리 필터링 / F010 반응형 / F011 헤더 / F013 빈/에러/로딩
 * Phase 4 Task 011에서 17개 분류 카드 그리드 구현
 */
export default function CategoriesIndex() {
  return (
    <Container>
      <div className="space-y-6 py-12">
        <h1 className="text-3xl font-bold">분류 인덱스</h1>
        <p className="text-muted-foreground mt-2">
          17개 분류를 한 화면에서 둘러보세요.
        </p>
        {/* 17개 분류 카드 그리드 (F003) — Phase 4 Task 011에서 구현 */}
      </div>
    </Container>
  )
}
