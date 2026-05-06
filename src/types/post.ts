import { z } from 'zod'

/**
 * 도메인 타입 단일 소스 (Phase 2 데이터 레이어와 Phase 3 공통 UI 컴포넌트가 공유)
 *
 * 한글 ↔ 영문 키 매핑: docs/PRD.md "속성 매핑 표"가 단일 진실 소스
 *
 * Post.publication 영문 키 강제 (절대 금지 사항 #22):
 *   - Notion 한글 "상태"(status 타입, 시작 전/진행 중/완료)는 게임 기획 작업 진행도 — 사이트 노출과 무관
 *   - 신규 한글 "웹 게시"(select 타입, 발행됨/초안)가 사이트 노출 토글
 *   - 영문 키를 status가 아닌 publication으로 명명하여 인지 오류 방지
 */

export type Publication = '발행됨' | '초안'
export type ReaderLevel = '입문' | '중급' | '심화'

/**
 * Notion 데이터베이스 페이지 정규화 결과 (카드 그리드/메타용)
 */
export interface Post {
  id: string // Notion 페이지 ID
  slug: string // id 기반 자동 생성 (Phase 2 Task 005에서 헬퍼 작성)
  title: string // ← 항목 (title)
  summary: string | null // ← 요약 (rich_text), 미작성 시 null
  category: string // ← 분류 (select, 17개 이모지 포함)
  tags: string[] // ← 태그 (multi_select)
  publishedAt: string // ← 발행일 (date.start) — Phase 2에서 미설정 시 lastEditedAt fallback
  publication: Publication // ← 웹 게시 (select)
  coverImage: string | null
  readerLevel: ReaderLevel | null // ← 독자 수준 (select), 미설정 시 칩 미노출 정책
  recommendOrder: number | null // ← 추천 순위 (number 1~3), F015 "처음 오셨나요?" 정렬
}

/**
 * 글 상세 본문 (Phase 2 Task 006 블록 렌더러 입력)
 */
export interface PostContent {
  postId: string // → Post.id
  blocks: NotionBlock[]
  coverImage: string | null
  lastEditedAt: string // ← 최종 편집 일시 (last_edited_time)
}

/**
 * 카테고리 인덱스/필터용 파생 모델
 */
export interface Category {
  name: string // 이모지 포함 (예: "📌 핵심 정의 문서")
  slug: string // name 기반 (Phase 2 Task 005에서 slug 헬퍼)
  postCount: number
}

/**
 * Notion 블록 변환 입력 (Phase 2 Task 006에서 type별 zod 스키마로 좁힘)
 */
export interface NotionBlock {
  id: string
  type: string // paragraph/heading_1~3/bulleted_list_item/numbered_list_item/image/code/quote/divider/table/table_row/toggle/callout 등
  content: unknown // type별 페이로드 — Phase 2에서 좁힘
}

/**
 * PostCard 컴포넌트가 사용하는 props 헬퍼 (Phase 3 Task 008)
 *   - 본문 fetch 비용 회피를 위해 카드는 readerLevel만 노출, 읽기 시간은 글 상세에서만
 */
export type PostCardProps = Pick<
  Post,
  | 'id'
  | 'slug'
  | 'title'
  | 'summary'
  | 'category'
  | 'tags'
  | 'publishedAt'
  | 'readerLevel'
>

/**
 * 검색 쿼리 파라미터 Zod 스키마 (검색 폼/쿼리 검증)
 *   - 검증 실패 메시지는 한국어 (shrimp-rules.md 8 — RHF resolver 패턴)
 */
export const searchParamsSchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, '검색어를 입력해주세요')
    .max(200, '검색어는 200자를 넘을 수 없습니다'),
})

export type SearchParams = z.infer<typeof searchParamsSchema>
