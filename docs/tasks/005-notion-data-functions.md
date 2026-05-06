# Task 005 — Notion 7종 데이터 함수 구현 (F001/F002/F003/F004/F015/F019)

## 개요

- Phase: 2 (데이터 레이어 — Notion 연동) — Phase 2 두 번째 Task
- shrimp ID: 9c00c2f8-7a79-418f-a2a3-870c66edc60e
- 의존성: Task 004 (Notion 클라이언트 + env 가드) ✅
- 사전 작업: Notion DB schema 6개 신규 속성 추가 ✅ (CSV + MCP fetch 검증)

## 수락 기준

- [x] 3 신규 파일 생성 (`src/lib/notion/posts.ts` / `categories.ts` / `slug.ts`)
- [x] `src/lib/notion/client.ts` 확장 (`getNotionDataSourceId()` async 헬퍼)
- [x] 7종 함수 모두 `웹 게시 === '발행됨'` 필터 적용 (절대 금지 #9)
- [x] F019 LIMIT (limit+1) + `filter(p => p.id !== currentId).slice(0, limit)` 후처리 (절대 금지 #20)
- [x] 결과 타입 `{ posts/post/categories, error }` 일관성
- [x] Notion SDK v5 `dataSources.query` / `pages.retrieve` / `blocks.children.list` + `isFullPage`/`isFullBlock` 타입 가드 + `collectPaginatedAPI` 유틸 사용
- [x] `unstable_cache` wrapper 모든 fetch 함수에 적용 (60초 + tags)
- [x] `normalizePost` 8개 한글 속성 매핑 + 발행일 미설정 시 `last_edited_time` fallback
- [x] ROADMAP Task 005 제목 "6개" → "7개" 정정 (9.4 단순 표기 정합성)
- [x] Playwright MCP 시나리오 4건 통과 (정규화 결과 / 분류 / 빈 분류 / 잘못된 슬러그)
- [x] `npm run check-all` + `npm run build` 통과 (env optional 정책 보존)
- [x] Grep: `process.env.NOTION` 0건 (env.ts 단일 진입점), `'use client'` 0건 (서버 전용), 본 모듈 외 `database_id` 직접 사용 0건
- [x] 한국어 에러 메시지 변형 0건 (상수 단일 소스 — `ERR_FETCH_FAILED` / `ERR_POST_FETCH_FAILED`)
- [x] 사용자 데이터 0건/1건 양쪽 상태에서 graceful 처리 검증
- [x] `persona-curation.ts` 분류 이름 정합성 정정 (`'🎞️ 내러티브 기획'` → `'🎞️내러티브 기획'` Notion 실제 옵션과 일치)
- [x] docs/ROADMAP.md Task 005 ✅ + See 참조

## 변경 사항 요약

- `src/lib/notion/posts.ts` (신규, 약 270줄): 5종 함수 + `normalizePost` 헬퍼
  - `getPublishedPosts()` — F001: dataSources.query 페이지네이션 + `웹 게시 === '발행됨'` 필터 + 발행일 desc + 인메모리 fallback 보정
  - `getPostBySlug(slug)` — F002: pageIdFromSlug → pages.retrieve → 발행 상태 검증 → collectPaginatedAPI(blocks.children.list)
  - `searchPosts(query)` — F004: searchParamsSchema 검증 → getPublishedPosts → 인메모리 lowercase title/tags 부분 일치
  - `getRecommendedPosts(limit)` — F015: `웹 게시 + 추천 순위 1~3` 합성 필터 + multi-sort (추천 순위 asc, 발행일 desc)
  - `getRelatedPostsByCategory(category, currentId, limit)` — F019: `page_size: limit+1` + `filter(id !== currentId).slice(0, limit)` 후처리
  - `normalizePost(page)`: 8개 한글 속성 → Post 도메인 타입 매핑. Zod `z.enum` widening 우회 위해 `publication`/`readerLevel` 명시적 리터럴 narrowing (non-null assertion 0회, `as` 캐스팅 0회)
- `src/lib/notion/categories.ts` (신규, 약 80줄): 2종 함수
  - `getCategories()` — F003: getPublishedPosts 위에서 Map 집계 + postCount desc + 이름 asc(ko locale)
  - `getPostsByCategory(slug)` — F003: slugFromCategoryName 직접 매칭 (reflect_task 보강 — 중복 fetch 제거)
- `src/lib/notion/slug.ts` (신규, 약 80줄): 4종 헬퍼
  - `slugFromPageId(id)`: 32자 hex (하이픈 제거)
  - `pageIdFromSlug(slug)`: 8-4-4-4-12 형식 복원, 길이 32 ≠ 시 한국어 throw
  - `slugFromCategoryName(name)`: 이모지(`\p{Extended_Pictographic}`) + variation selector + 공백/슬래시 정규화, 한글 유지
  - `categoryNameFromSlug(slug, names[])`: 인메모리 역매칭
- `src/lib/notion/client.ts` (수정): `getNotionDataSourceId()` async 헬퍼 추가. v5 환경에서는 env 값을 data source ID로 사용하는 것이 권장이므로 단순 pass-through + 모듈 단위 캐시. `cachedDataSourceId` 모듈 비공개 변수 추가
- `src/lib/notion/persona-curation.ts` (수정 1줄): `'🎞️ 내러티브 기획'` → `'🎞️내러티브 기획'` (Notion 실제 옵션 글자 단위 일치)
- `src/app/posts/[slug]/page.tsx` / `categories/[slug]/page.tsx` / `search/page.tsx` (임시 본문 업데이트): 데이터 함수 호출 + 결과 평문 출력 (Phase 4 본격 UI 대기 마커)
- `.env.local`: `NOTION_DATABASE_ID` 정정 (사용자 변경 후 view ID로 입력된 것을 확인하여 올바른 data source ID `345bcbcf-a9ea-8188-8034-000b3bd975ec`로 정정)
- `docs/ROADMAP.md`: Task 005 ✅ + shrimp ID + See 참조 + 제목 "6개" → "7개" 정정 + 변경 사항 요약

## 검증 결과

- npm run check-all: **통과** (typecheck + ESLint + Prettier 모두 통과)
- npm run build (Turbopack): **통과** — `.env.local` 인지 후 5 라우트 + /\_not-found 정상 컴파일. First Load JS 167 kB
- Grep:
  - `process.env.NOTION`: 1건 — `src/lib/env.ts` 단일 진입점만 (정상 ✅)
  - `'use client'` in `src/lib/notion/`: 0건 ✅
  - `database_id`: 2건 — 모두 `client.ts` 내부 (JSDoc 예시 + `databases.retrieve` 호출 1건이지만 v5 patch 후 미사용)

## 테스트 체크리스트 (Playwright MCP 시나리오)

shrimp-rules.md 12.1 단계 4: Notion API/비즈니스 로직 작업이므로 Playwright MCP 시나리오 의무.
dev 서버(포트 3008)에서 실측 결과:

- [x] **시나리오 (a) 검색 부분 일치**: `/search?q=test` → "'test'에 대한 검색 결과 1건" + "Test — 📌 핵심 정의 문서 (태그: Test)" 정상 노출
- [x] **시나리오 (b) 분류별 글**: `/categories/핵심-정의-문서` → "분류: 📌 핵심 정의 문서" + 1건 (제목/발행일/분류/태그/독자 수준 모두 매핑) — slugFromCategoryName 한글 슬러그 정상
- [x] **시나리오 (c) 빈 분류 graceful 처리**: `/categories/test-category` → "아직 등록된 글이 없어요" 표시 (에러 없음)
- [x] **시나리오 (d) 잘못된 슬러그 404 효과**: `/posts/abc` → "발행된 글을 찾을 수 없습니다." (pageIdFromSlug throw → catch → null 반환)
- [x] **dev 서버 logs**: 정상 동작 시점 Notion API 에러 0건, env 정정 후 모든 호출 200 OK
- [ ] **회귀 시나리오 (잘못된 env)**: 사용자가 view ID 입력했을 때 Notion API가 `object_not_found` 반환 → ERR_FETCH_FAILED 노출 (graceful 처리) — env 잘못 설정 시 동작 검증 완료

## INFERENCE 항목

1. **분류 슬러그 정책 — 채택**: 이모지 + variation selector + 공백/슬래시를 하이픈으로, 한글 유지 (`'📌 핵심 정의 문서'` → `'핵심-정의-문서'`). 사용자 확정 권장 — `src/lib/notion/slug.ts` slugFromCategoryName 본문
2. **분류 정렬 — 채택**: postCount desc → 이름 asc(ko locale). 사용자 선호 미확인 — `src/lib/notion/categories.ts` getCategories sort
3. **`getNotionDataSourceId()` 단순화**: v5 환경에서는 env 값이 곧 data source ID로 사용되는 것이 권장. databases.retrieve 우회 변환 패턴은 미도입(env 잘못 설정 시 사용자가 직접 정정). 사용자 확정 권장 — `src/lib/notion/client.ts:90~110`

## 참고

### Notion DB 사용자 환경 점검

- DB ID(URL): `345bcbcfa9ea80b38ec5c777f19c3442`
- **Data Source ID** (env에 저장): `345bcbcf-a9ea-8188-8034-000b3bd975ec` (MCP `notion-fetch`로 검증)
- View ID(잘못된 값 참고): `345bcbcfa9ea8179ba1a000c67ecc15c` — 한 번 env에 잘못 입력된 적 있어 `object_not_found` 반환 사례 발견. v5 환경에서 `NOTION_DATABASE_ID`는 data source ID여야 함
- 17개 분류 select 옵션 모두 등록 ✅ (`📌 핵심 정의 문서` ~ `📊 데이터/분석 기획`)
- 발행 글: 1건 ("Test", 📌 핵심 정의 문서, 태그: ["Test"], 독자 수준: 입문, 발행일: 2026-05-07)

### 핵심 결정

- **`isFullPage` 사용**: 분석 단계의 `isFullPageOrDataSource`는 데이터 소스 query 결과에 부정확 → reflect_task에서 `isFullPage`로 정정
- **`getPostsByCategory` 직접 매칭**: 분석 단계의 categoryNameFromSlug 분리 호출 대신 `slugFromCategoryName(p.category) === slug` 직접 필터로 중복 fetch 제거 (reflect_task 보강)
- **`unstable_cache` 60초 + 페이지 ISR 60초**: 같은 만료 주기로 충돌 없음
- **Zod `z.enum` generic widening 우회**: `publication`/`readerLevel`을 명시적 리터럴 narrowing으로 처리 → schemas.ts(Phase 1-003) 수정 회피
- **`server-only` npm 미도입**: ROADMAP 미명시, 9.2 동기화 부담으로 본 Task에서도 미도입(주석 + 서버 컴포넌트 호출 한정으로 방어)

### Phase 2 진행 상황

- Task 004: ✅ 완료 (Notion 클라이언트 + env 가드)
- Task 005: ✅ 완료 (본 Task — 7종 데이터 함수)
- Task 006: 미시작 (블록 → HTML 변환 + F016/F017/F018)
- Task 007: 미시작 (캐시 전략 통합 점검)

본 Task 완료로 Phase 4 페이지가 호출할 데이터 인터페이스 확립. Task 006이 본 모듈 위에서 변환 로직을 추가하면 데이터 레이어 완성.
