import { Container } from '@/components/layout/container'
import { searchPosts } from '@/lib/notion/posts'

export const dynamic = 'force-dynamic'

interface SearchProps {
  searchParams: Promise<{ q?: string }>
}

/**
 * 검색 결과 페이지 (동적 렌더링 — Phase 2-005 임시 데이터 검증용)
 *
 * F001 글 목록 / F004 검색 / F010-F013 / F019 독자 수준 칩
 * 본 페이지는 searchPosts() 데이터 흐름 검증용 임시 본문이며, Phase 4 Task 012에서
 * 결과 카드 그리드 + 결과 없음 안내로 본격 구현된다.
 */
export default async function Search({ searchParams }: SearchProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const result = query.length > 0 ? await searchPosts(query) : null

  return (
    <Container>
      <div className="space-y-6 py-12">
        <h1 className="text-3xl font-bold">검색 결과</h1>
        {query.length === 0 ? (
          <p className="text-muted-foreground mt-2">검색어를 입력해주세요.</p>
        ) : result?.error ? (
          <p className="text-destructive">{result.error}</p>
        ) : result?.posts.length === 0 ? (
          <p className="text-muted-foreground mt-2">
            &lsquo;{query}&rsquo;에 대한 결과가 없어요.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground mt-2">
              &lsquo;{query}&rsquo;에 대한 검색 결과 {result?.posts.length}건
              (Phase 4 Task 012에서 본격 UI로 교체)
            </p>
            <ul className="list-disc space-y-2 pl-6">
              {result?.posts.map(p => (
                <li key={p.id}>
                  <strong>{p.title}</strong> — {p.category} (태그:{' '}
                  {p.tags.join(', ') || '없음'})
                </li>
              ))}
            </ul>
          </>
        )}
        {/* 검색 결과 카드 그리드 (F004) — Phase 4 Task 012에서 구현 */}
      </div>
    </Container>
  )
}
