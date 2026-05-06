import { Container } from '@/components/layout/container'

/**
 * 홈 페이지 - 최근 발행된 기획서 카드 목록 표시
 * F001: Notion 글 목록 조회 (Status=발행됨, 발행일 내림차순)
 * F010: 반응형 레이아웃 (데스크톱 3열 / 태블릿 2열 / 모바일 1열)
 * F012: 태그 표시
 * F013: 빈/에러/로딩 상태 처리
 */
export default function Home() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-3xl font-bold">기획서 목록</h1>
        <p className="text-muted-foreground mt-2">
          Notion에서 발행된 기획서를 확인하세요.
        </p>
      </div>
    </Container>
  )
}
