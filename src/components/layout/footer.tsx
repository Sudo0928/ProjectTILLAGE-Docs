import { Container } from './container'

/**
 * 글로벌 푸터 - 모든 페이지에서 공통 사용
 * F011: 사이트 소개 및 카테고리 빠른 링크 제공
 */
export function Footer() {
  return (
    <footer className="border-t">
      <Container>
        <div className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              ProjectTILLAGE Docs &mdash; Notion 기반 문서 발행 사이트
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
