# Task 003 — 도메인 타입 / Zod 스키마 / 큐레이션 모듈

## 개요

- Phase: 1 (애플리케이션 골격 구축) — **Phase 1 마지막 Task**
- shrimp ID: 3207c9f4-d9cd-4ef3-8b02-987664410ca8
- 의존성: Task 002 (5 라우트 셸 + RootLayout 통합) ✅
- Phase 종료: 본 Task 완료 시 Phase 1 헤더 ✅

## 수락 기준

- [x] 4개 신규 파일 생성 (src/types/post.ts, src/lib/notion/schemas.ts, src/lib/site-config.ts, src/lib/notion/persona-curation.ts)
- [x] Post.publication 영문 키 사용 (Post.status 0건)
- [x] PRD 속성 매핑 표 8개 한글 속성 모두 schemas.ts에 매핑
- [x] searchParamsSchema 한국어 검증 실패 메시지 동작
- [x] personaCuration 5개 페르소나 정의 + assertDistinctPersonaCategorySets() 통과
- [x] siteConfig.hero.logline에 PRD Logline 글자 단위 일치
- [x] npm run typecheck 통과
- [x] 임시 fixture parse 성공/실패 양쪽 검증 (옵션 1 dev 콘솔 출력으로 확인)
- [x] Phase 1 헤더 ✅ + ROADMAP Task 003 ✅
- [x] page.tsx 원복 (Task 002 직후 상태와 동일)

## 변경 사항 요약

- src/types/post.ts (신규, 61줄): Post/PostContent/Category/NotionBlock/PostCardProps + searchParamsSchema
- src/lib/notion/schemas.ts (신규, 74줄): notionPagePropertiesSchema + 8 helper
- src/lib/site-config.ts (신규, 27줄): siteConfig as const
- src/lib/notion/persona-curation.ts (신규, 75줄): personaCuration + Persona + assertDistinctPersonaCategorySets
- docs/ROADMAP.md: Task 003 ✅ + Phase 1 헤더 ✅ + tasks/003 참조

## INFERENCE 항목 (사용자 확정 권장)

1. **siteConfig.hero.moodCaption** `"포스트 아포칼립스 농사+생존 — 짧은 삶 속에서 의미를 찾아가는 이야기"` 임시값 — PRD 미명시, Phase 6 Task 018 페르소나 인터뷰에서 보완 예정. `src/lib/site-config.ts` L19 수정 권장
2. **external 페르소나 emoji** `🌟` 임시값 — PRD "페르소나별 진입 시나리오" 표에 emoji 미명시. `src/lib/notion/persona-curation.ts` L47 수정 권장
3. **personaCuration[].categories 분류 이름** PRD 표 추론값 — Notion 실제 분류 select 옵션 변경 시 동기화 필수. `src/lib/notion/persona-curation.ts` 전체 categories 배열 점검 권장

## 검증 결과

- npm run typecheck: **통과**
- 임시 fixture 검증 (dev 콘솔 출력)
  - `[verify] fixture parse success: true`
  - `[verify] missing property fail (expected): true`
  - `[verify] distinct persona category sets: OK`
  - `[verify] empty q error: 검색어를 입력해주세요`
  - `[verify] long q error: 검색어는 200자를 넘을 수 없습니다`
  - `[verify] logline matches PRD: true`
- npm run check-all: **통과** (typecheck + ESLint + Prettier 모두 통과)
- npm run build: **통과** (Turbopack — 5 라우트 정상 컴파일)

## Notion DB 사전 작업 점검

Notion DB(`345bcbcfa9ea80b38ec5c777f19c3442`) 6개 신규 속성 추가 여부는 별도 MCP 조회 미수행.
Phase 2 Task 004 시작 전 사용자가 직접 확인 필요:

| 속성명    | 타입         | 추가 필수 이유                  |
| --------- | ------------ | ------------------------------- |
| 웹 게시   | select       | 사이트 노출 토글 — Phase 2 핵심 |
| 발행일    | date         | 정렬 기준                       |
| 태그      | multi_select | 카드 칩 + 검색 매칭             |
| 요약      | rich_text    | TL;DR fallback 소스             |
| 독자 수준 | select       | 큐레이션 칩                     |
| 추천 순위 | number       | "처음 오셨나요?" 우선순위       |

## 참고

- Phase 2 Task 005부터 실제 Notion DB 응답 필요 (사용자 사전 작업: 6개 속성 추가)
- NotionBlock.content는 unknown 유지 (Phase 2 Task 006에서 type별 zod 좁힘)
- assertDistinctPersonaCategorySets는 Phase 5 Task 016 회귀 검증에서도 재사용
- Prettier 자동 포맷 결과: NotionPagePropertiesParsed 타입 export가 2줄로 분리, description 필드 줄 바꿈 — 내용 변경 없음
