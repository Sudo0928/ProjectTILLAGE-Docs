import { Container } from '@/components/layout/container'

export const revalidate = 60

/**
 * 홈 페이지
 * F001 Notion 글 목록 / F010 반응형 / F011 헤더 / F012 태그 / F013 빈/에러/로딩
 * F015 비기획자 진입 큐레이션 / F019 독자 수준 칩
 */
export default function Home() {
  return (
    <Container>
      <div className="space-y-12 py-12">
        <h1 className="text-3xl font-bold">기획서 목록</h1>
        <p className="text-muted-foreground mt-2">
          Notion에서 발행된 기획서를 확인하세요.
        </p>
        {/* HERO 영역 (F015) — Phase 4 Task 010에서 구현 */}
        {/* 처음 오셨나요 섹션 (F015) — Phase 4 Task 010에서 구현 */}
        {/* 관심사로 골라보기 섹션 (F015) — Phase 4 Task 010에서 구현 */}
        {/* 최근 글 카드 그리드 (F001) — Phase 4 Task 010에서 구현 */}
      </div>
    </Container>
  )
}
