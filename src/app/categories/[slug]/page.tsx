import { Container } from '@/components/layout/container'
import { getPostsByCategory } from '@/lib/notion/categories'

export const revalidate = 60

interface CategoryDetailProps {
  params: Promise<{ slug: string }>
}

/**
 * 카테고리 상세 페이지 (Phase 2-005 임시 데이터 검증용 — Phase 4 Task 011에서 본격 UI로 교체)
 *
 * F001 글 목록 / F003 카테고리 / F010-F013 / F019 독자 수준 칩
 * 본 페이지는 getPostsByCategory() 데이터 흐름 검증용 임시 본문이며, Phase 4에서
 * PostCardGrid + EmptyState로 본격 구현된다.
 */
export default async function CategoryDetail({ params }: CategoryDetailProps) {
  const { slug } = await params
  const categorySlug = decodeURIComponent(slug)
  const { posts, error } = await getPostsByCategory(categorySlug)
  const categoryName = posts[0]?.category ?? categorySlug

  return (
    <Container>
      <div className="space-y-6 py-12">
        <h1 className="text-3xl font-bold">분류: {categoryName}</h1>
        {error !== null ? (
          <p className="text-destructive">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground mt-2">아직 등록된 글이 없어요.</p>
        ) : (
          <>
            <p className="text-muted-foreground mt-2">
              본 영역은 Phase 4 Task 011에서 본격 UI로 교체될 예정입니다 (현재
              데이터 검증용 임시 출력 — {posts.length}건).
            </p>
            <ul className="list-disc space-y-2 pl-6">
              {posts.map(p => (
                <li key={p.id}>
                  <strong>{p.title}</strong> — {p.publishedAt} (분류:{' '}
                  {p.category}, 태그: {p.tags.join(', ') || '없음'}, 독자 수준:{' '}
                  {p.readerLevel ?? '미설정'})
                </li>
              ))}
            </ul>
          </>
        )}
        {/* 분류별 글 카드 그리드 (F001/F003) — Phase 4 Task 011에서 구현 */}
      </div>
    </Container>
  )
}
