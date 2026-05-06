import type { Metadata } from 'next'

import { Container } from '@/components/layout/container'
import { getPostBySlug } from '@/lib/notion/posts'
import { extractTldr } from '@/lib/notion/tldr-extractor'
import { calculateReadingTime } from '@/lib/notion/reading-time'
import { getRelatedDocs } from '@/lib/notion/related-docs-fetcher'
import { RenderBlocks } from '@/lib/notion/render-blocks'

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
 * 글 상세 페이지 (Phase 2-006 변환 검증용 임시 통합 — Phase 4 Task 013에서 본격 UI로 교체)
 *
 * F002 본문 / F010-F014 / F016 TL;DR / F017 패턴 변환 / F018 연동 문서 / F019 추천
 * 본 페이지는 Phase 2-006 블록 렌더러 + 패턴 변환 데이터 흐름 검증용 임시 본문이며,
 * Phase 4 Task 013에서 TL;DR + 본문 + 연동/추천 카드로 본격 구현된다.
 */
export default async function PostDetail({ params }: PostDetailProps) {
  const { slug } = await params
  const postSlug = decodeURIComponent(slug)
  const { post, error } = await getPostBySlug(postSlug)

  if (error !== null) {
    return (
      <Container>
        <p className="text-destructive">{error}</p>
      </Container>
    )
  }

  if (post === null) {
    return (
      <Container>
        <p>발행된 글을 찾을 수 없습니다.</p>
      </Container>
    )
  }

  // F016 TL;DR 추출 (4단계 fall-through)
  const tldr = extractTldr(post.blocks, post.summary)
  // F019 읽기 시간 계산 (한국어 500자/분)
  const readingMins = calculateReadingTime(post.blocks)
  // F018 연동 문서 메타 fetch (unstable_cache 메모이즈)
  const relatedDocs = await getRelatedDocs(post.blocks)

  return (
    <Container>
      <article className="prose dark:prose-invert mx-auto py-12">
        <p className="text-muted-foreground text-sm">
          본 영역은 Phase 4 Task 013에서 본격 UI로 교체될 예정입니다 (현재 변환
          검증용 임시 통합).
        </p>

        {/* F019 읽기 시간 */}
        <p className="text-muted-foreground text-sm" data-testid="reading-time">
          읽기 시간: 약 {readingMins}분
        </p>

        {/* F016 TL;DR 박스 */}
        {tldr !== null && (
          <div
            className="not-prose bg-muted my-6 rounded-md border p-4"
            data-testid="tldr-box"
          >
            <p className="mb-1 font-semibold">TL;DR</p>
            <p className="text-sm">{tldr}</p>
          </div>
        )}

        {/* F002 + F017 본문 렌더링 */}
        <RenderBlocks blocks={post.blocks} />

        {/* F018 연동 문서 카드 (0개면 영역 자체 미렌더링) */}
        {relatedDocs.length > 0 && (
          <section className="not-prose mt-12" data-testid="related-docs">
            <h2 className="mb-4 text-xl font-semibold">연동 문서</h2>
            <ul className="grid gap-2">
              {relatedDocs.map(d => (
                <li key={d.pageId}>
                  <a href={`/posts/${d.slug}`} className="hover:underline">
                    {d.title}
                  </a>
                  {d.summary !== null && (
                    <p className="text-muted-foreground text-sm">{d.summary}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 동일 분류 추천 (F019) — Phase 4 Task 013 */}
      </article>
    </Container>
  )
}
