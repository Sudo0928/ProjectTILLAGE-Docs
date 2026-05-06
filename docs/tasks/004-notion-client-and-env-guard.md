# Task 004 — Notion 클라이언트 / 환경 변수 가드

## 개요

- Phase: 2 (데이터 레이어 — Notion 연동) — **Phase 2 첫 Task**
- shrimp ID: 11bfc8e9-e4b8-4a3d-8b75-342b8989aff2
- 의존성: Task 003 (도메인 타입 / Zod 스키마 / 큐레이션 모듈) ✅
- 사전 작업: 사용자 사전 작업 (Notion DB 6개 신규 속성 추가) — Task 005부터 차단 의존, 본 Task 무관

## 수락 기준

- [x] src/lib/notion/client.ts 신규 생성 (첫 줄 한국어 서버 전용 경계 주석 정확 매칭)
- [x] assertNotionEnv() — env 누락 시 한국어 Error throw, 통과 시 { token, databaseId } 객체 반환 (TS strict narrowing, non-null assertion 0회)
- [x] getNotionClient() — 모듈 스코프 싱글톤 (재호출 시 동일 인스턴스 ===, 코드 검토)
- [x] getNotionDatabaseId() — assertNotionEnv() 경유 검증된 DB ID 반환
- [x] env 미설정 상태에서 npm run build 통과 (env optional 정책 회귀 — 절대 금지 #9, 10.5 표)
- [x] npm run check-all 통과 (typecheck + lint + format:check)
- [x] Grep 'process.env.NOTION' 본 파일 0건 (절대 금지 #6 비위반)
- [x] 본 파일에 'use client' 지시어 0건 (절대 금지 #7 비위반)
- [x] `NEXT_PUBLIC_NOTION_*` 노출 변수 도입 0건 (절대 금지 #8 비위반 — 1건은 주석 내 금지 문구)
- [x] Notion SDK timeoutMs / retry / notionVersion 추가 옵션 0건 (ROADMAP 명세 충실)
- [x] cachedClient 모듈 비공개 (export 안 됨) 검증
- [x] docs/ROADMAP.md Phase 2 Task 004 ✅ + See 참조 추가

## 변경 사항 요약

- src/lib/notion/client.ts (신규, 73줄): 3개 export
  - `assertNotionEnv(): { token: string; databaseId: string }` — env 누락 시 한국어 Error throw, 통과 시 narrowing된 객체 반환 (NOTION_TOKEN 검사 우선)
  - `getNotionClient(): Client` — 모듈 스코프 `let cachedClient: Client | null = null` 캐시 기반 싱글톤
  - `getNotionDatabaseId(): string` — assertNotionEnv() 경유 검증된 DB ID 반환
  - 첫 줄 한국어 서버 전용 경계 주석 (ROADMAP 명세 그대로) + JSDoc 모듈/함수 한국어 블록 4개
- docs/tasks/004-notion-client-and-env-guard.md (신규)
- docs/ROADMAP.md: Phase 2 Task 004 ✅ + See 참조 + 변경 사항 요약 추가

## 검증 결과

- npm run check-all: **통과** (typecheck + ESLint + Prettier 모두 통과)
- npm run build (Turbopack): **통과** — `.env.local` 인지 후 5개 라우트(/`, /categories`, /categories/[slug], /posts/[slug], /search) + /\_not-found 모두 정상 컴파일. First Load JS 167 kB
- env optional 정책 회귀: 모듈 import 시점에 throw 발생 0건 (assertNotionEnv는 함수 호출 시점만 검증)
- Grep 결과:
  - `process.env.NOTION`: 0건 ✅
  - `^['"]use client['"]`: 0건 ✅
  - `NEXT_PUBLIC_NOTION`: 1건 — 주석 내 금지 문구 명시(실제 변수 도입 아님)
  - `^export.*cachedClient`: 0건 ✅ (모듈 비공개)
- 싱글톤 동등성: 코드 검토로 검증 — `getNotionClient()`은 9줄의 결정론적 분기(`if (cachedClient !== null) return cachedClient`)이므로 런타임 보장. Task 005 진입 시 7종 데이터 함수가 본 모듈을 반복 호출하면서 통합 회귀로 자동 검증 예정

## INFERENCE 항목

(없음 — ROADMAP 명세를 글자 단위로 따랐고 추측 항목 없음)

## 참고

- @notionhq/client@^5.20.0 v5 생성자 시그니처 (Context7 `/makenotion/notion-sdk-js` 검증): `new Client({ auth })`. timeoutMs / retry / notionVersion 옵션은 ROADMAP 명세에 없으므로 본 Task 미사용
- 사용자 사전 작업 점검: Notion DB(`345bcbcfa9ea80b38ec5c777f19c3442`) CSV(`기획서 모음 ..._all.csv`) 헤더 확인 결과 6개 신규 속성(웹 게시/발행일/태그/요약/독자 수준/추천 순위) 컬럼이 모두 추가되어 있으나 모든 행에 값 미입력 상태. Task 005 시점에 발행 글이 0건일 가능성 — 빈 결과 처리는 Task 005에서 검증
- React 19 cache()는 서버 컴포넌트 트리 단위 범위라 Node 모듈 캐시 단위 싱글톤보다 좁아 미사용
- server-only npm 패키지는 ROADMAP 미명시 + 9.2 다중 파일 동기화 부담으로 본 Task 미도입(주석 + 서버 컴포넌트 호출 한정 + 코드 리뷰 3중 방어)
- Playwright MCP 시나리오는 본 Task 인프라성으로 skip — Task 005 통합 회귀에서 본 모듈 throw 경로 함께 검증
