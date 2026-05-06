import { Container } from '@/components/layout/container'

export const dynamic = 'force-dynamic'

interface SearchProps {
  searchParams: Promise<{ q?: string }>
}

/**
 * 검색 결과 페이지 (동적 렌더링)
 * F001 글 목록 / F004 검색 / F010-F013 / F019 독자 수준 칩
 * Phase 4 Task 012에서 검색 결과 카드 그리드 구현
 */
export default async function Search({ searchParams }: SearchProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  return (
    <Container>
      <div className="space-y-6 py-12">
        <h1 className="text-3xl font-bold">검색 결과</h1>
        <p className="text-muted-foreground mt-2">
          {query
            ? `'${query}'에 대한 검색 결과입니다.`
            : '검색어를 입력해주세요.'}
        </p>
        {/* 검색 결과 카드 그리드 (F004) — Phase 4 Task 012에서 구현 */}
      </div>
    </Container>
  )
}
