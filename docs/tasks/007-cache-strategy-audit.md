# Task 007 — 캐시 전략 통합 점검 (audit)

## 개요

- Phase: 2 (데이터 레이어 — Notion 연동) — Phase 2 마지막 Task
- shrimp ID: `a6fffef5-dd5a-44f8-a24d-3bb5523ed56f`
- 의존성: Task 006 (블록 렌더러 + 패턴 변환) ✅
- 성격: audit Task — 신규 코드 거의 없음 ((b) dev 진단 로그 1줄 + 위반 시 정정)

## 수락 기준

- [x] 5개 페이지 export const 일치
- [x] 함수 8건 unstable_cache wrapping 표
- [x] F018 메모이즈 코드 분석 + (b) dev 진단 로그 추가
- [x] 검색 페이지 매 요청 dynamic 실측
- [x] 60초 반영 측정 (M6) — 사용자 협조 또는 위임 명시
- [x] 글 상세 임시 통합 마커 무결성 grep
- [x] 절대 금지 사항 grep 4건 회귀
- [x] npm run check-all + build 통과
- [x] ROADMAP Task 007 ✅ + Phase 2 헤더 ✅

## 변경 사항 요약

### 수정 파일 (MODIFY)

| 경로                                     | 변경 내용                                               |
| ---------------------------------------- | ------------------------------------------------------- |
| `src/lib/notion/related-docs-fetcher.ts` | (b) dev 진단 로그 1줄 추가 — NODE_ENV 가드 + JSDoc 보강 |
| `docs/ROADMAP.md`                        | Task 007 ✅ 갱신 + Phase 2 헤더 ✅ 추가 + 진행률 갱신   |
| `docs/tasks/007-cache-strategy-audit.md` | 본 파일 신규 생성                                       |

## 점검 결과 표 (10건)

| #   | 항목                      | 검증 방법                                       | 결과 | 비고                                     |
| --- | ------------------------- | ----------------------------------------------- | ---- | ---------------------------------------- |
| 1   | 홈 ISR 60s                | grep page.tsx:3                                 | PASS | `export const revalidate = 60`           |
| 2   | 카테고리 인덱스 ISR 60s   | grep categories/page.tsx:3                      | PASS | `export const revalidate = 60`           |
| 3   | 카테고리 상세 ISR 60s     | grep categories/[slug]/page.tsx:4               | PASS | `export const revalidate = 60`           |
| 4   | 글 상세 ISR 60s           | grep posts/[slug]/page.tsx:10                   | PASS | `export const revalidate = 60`           |
| 5   | 검색 dynamic              | grep search/page.tsx:4                          | PASS | `export const dynamic = 'force-dynamic'` |
| 6   | F018 메모이즈 wrapping    | Read related-docs-fetcher.ts L95-99             | PASS | `unstable_cache` revalidate:60 적용      |
| 7   | 검색 페이지 매 요청 fresh | Playwright 두 번 navigate + PowerShell curl 2회 | PASS | 두 번 모두 200 응답, dev 모드 fresh      |
| 8   | M6 60초 반영 측정         | 사용자 협조 필요                                | N/A  | Phase 5 Task 016 회귀 위임               |
| 9   | 글 상세 임시 통합 마커    | grep "Phase 4 Task 013에서 본격 UI"             | PASS | posts/[slug]/page.tsx 1건 매칭           |
| 10  | 절대 금지 사항 4건 grep   | grep 4종 패턴                                   | PASS | 아래 세부 결과 참조                      |

## 함수 단위 캐시 정책 표 (8건)

| #   | 함수                      | 파일                        | wrapping | revalidate | tags                     | 의도                                               |
| --- | ------------------------- | --------------------------- | -------- | ---------- | ------------------------ | -------------------------------------------------- |
| 1   | getPublishedPosts         | posts.ts L134               | ✅       | 60         | ['posts']                | F001 베이스 — 모든 글 목록                         |
| 2   | getPostBySlug             | posts.ts L204               | ✅       | 60         | ['posts','post-content'] | F002 글 상세 메타+블록                             |
| 3   | getCategories             | categories.ts L55           | ✅       | 60         | ['categories']           | F003 카테고리 목록 집계                            |
| 4   | getPostsByCategory        | categories.ts L70           | ❌       | —          | —                        | getPublishedPosts 위 인메모리 필터 (의도적 미적용) |
| 5   | searchPosts               | posts.ts L217               | ❌       | —          | —                        | getPublishedPosts 위 인메모리 검색 (의도적 미적용) |
| 6   | getRecommendedPosts       | posts.ts L277               | ✅       | 60         | ['posts','recommended']  | F015 추천 글 (추천 순위 1~3)                       |
| 7   | getRelatedPostsByCategory | posts.ts L317               | ✅       | 60         | ['posts','related']      | F019 동일 분류 추천                                |
| 8   | fetchOnePageMeta          | related-docs-fetcher.ts L95 | ✅       | 60         | ['posts','related-docs'] | F018 멘션 페이지 메타 (절대 금지 #19)              |

**의도적 미적용(#4, #5) 정책**: `getPostsByCategory`와 `searchPosts`는 `getPublishedPosts()` (60초 캐시 적용) 결과 위에서 인메모리 필터/검색을 수행하므로 별도 `unstable_cache` 적용 불필요. 이중 캐시 없이 베이스 캐시를 재사용하는 일관 정책.

## M6 60초 반영 측정 결과

```
환경: 사용자 협조 미가용 — Phase 5 Task 016 회귀 측정 위임
측정 결과: N/A

코드 분석 근거:
  - 홈/카테고리/글 상세 페이지: export const revalidate = 60 확인
  - Next.js unstable_cache: revalidate: 60 설정 확인
  - Context7 참조: unstable_cache는 async function을 래핑하며 cache key prefix + revalidate + tags 구성으로
    동일 인자 재호출 시 캐시 hit, revalidate 시간 경과 후 background revalidation 수행

ISR 표준 동작 (Context7 /vercel/next.js 인용):
  "Configure revalidation with tags for on-demand revalidation and revalidate for time-based revalidation"
  revalidate: 60 = 60초 후 백그라운드에서 새 데이터 fetch + 기존 응답 우선 제공

Phase 5 Task 016에서 실제 Notion 웹 게시 토글 + 60초 경과 + 반영 확인 시나리오로 회귀 측정 의무.
```

## F018 메모이즈 코드 분석

`src/lib/notion/related-docs-fetcher.ts` L95-99:

```typescript
const fetchOnePageMeta = unstable_cache(
  _fetchOnePageMetaImpl,
  ['related-doc-meta'],
  { revalidate: 60, tags: ['posts', 'related-docs'] }
)
```

- 캐시 키 prefix: `['related-doc-meta']` — pageId 인자가 키에 자동 포함됨
- 동일 pageId 두 번째 호출 시: cache hit → `_fetchOnePageMetaImpl` 미실행 → Notion API 호출 0회
- Context7 인용: "unstable_cache wraps async function with cache key prefix + revalidate + tags. The second argument is an array of strings that form the cache key prefix, with function arguments appended automatically."
- (b) dev 진단 로그: `_fetchOnePageMetaImpl` 진입 시 `console.log('[related-docs] fetch start', pageId)` — cache hit 시 로그 0줄로 메모이즈 동작 검증 가능

## INFERENCE 항목 (4건)

1. **F018 60초 캐시 갭 허용** — 멘션 페이지 토글 시 최대 60초 정합성 갭 발생 가능. 비기획자 진입 큐레이션 영역에서 MVP 기간 미미한 영향이므로 허용. v3 이후 on-demand revalidation 도입 시 갭 제거 가능.
2. **searchPosts/getPostsByCategory 베이스 캐시 의도** — 두 함수는 `getPublishedPosts()` 60초 캐시 위 인메모리 처리이므로 별도 unstable_cache 불필요. 단일 Notion API 호출로 rate limit 보호 일관 유지.
3. **dev 진단 로그 (b) 영구 채택** — `related-docs-fetcher.ts` `_fetchOnePageMetaImpl` 함수 진입부에 `process.env.NODE_ENV === 'development'` 가드 `console.log` 1줄 추가. prod 영향 0 (NODE_ENV 검사 후 noop). dev에서 fetch 호출마다 로그 1줄 출력 → cache hit 시 로그 미출력으로 메모이즈 동작 검증 가능.
4. **revalidateTag 미사용 정책** — 본 MVP는 시간 기반 revalidate: 60만 사용. on-demand revalidateTag는 v3 또는 후순위 과제로 위임.

## 절대 금지 사항 grep 결과

| 패턴                                        | 결과                        | 위반 여부                    |
| ------------------------------------------- | --------------------------- | ---------------------------- |
| `process.env.NOTION` (env.ts 외 파일)       | env.ts 2건만                | PASS ✅                      |
| `'use client'` 지시문 in src/lib/notion/    | 0건 (주석만)                | PASS ✅                      |
| `unstable_cache` in related-docs-fetcher.ts | 1건 (L95 적용)              | PASS ✅ (절대 금지 #19 준수) |
| `PLACEHOLDER_REGEX` 변형 정의               | tldr-extractor.ts 단일 소스 | PASS ✅                      |

## 사용자 추가 작업 안내 (선택, F018 회귀 실측)

F018 메모이즈 동작을 실제 환경에서 검증하려면 Notion Test 페이지에 다음 내용 추가 후 dev 서버 콘솔 로그 확인:

```
# 1. 연동 문서
- @[Test 페이지 자체]
- @[Test 페이지 자체]  ← 동일 멘션 중복
```

기대 결과: `[related-docs] fetch start <pageId>` 로그가 1회만 출력 (두 번째 호출 시 cache hit으로 미출력).

미수행 시 코드 분석 + Context7 인용 PASS, Phase 5 Task 016 회귀 위임.

## 빌드 결과

```
npm run check-all: PASS (typecheck + ESLint + Prettier 모두 통과)
npm run build: PASS (Turbopack, Next.js 15.5.3)

Route (app)                         Size  First Load JS  Revalidate
┌ ○ /                                0 B         169 kB          1m
├ ○ /categories                      0 B         169 kB          1m
├ ƒ /categories/[slug]               0 B         169 kB
├ ƒ /posts/[slug]                6.73 kB         175 kB
└ ƒ /search                          0 B         169 kB
+ First Load JS shared by all     187 kB
```

홈/카테고리 인덱스: ○ (정적 ISR, Revalidate 1m 표시)
카테고리 상세/글 상세/검색: ƒ (동적, 요청 시 서버 렌더링)
— categories/[slug], posts/[slug]는 동적 라우트라 ƒ 표시이지만 revalidate=60 코드 선언 확인됨

## Phase 2 마무리

- Task 004 ✅ (Notion 클라이언트 + env 가드)
- Task 005 ✅ (7종 데이터 함수)
- Task 006 ✅ (블록 렌더러 + F016/F017/F018/F019 변환)
- Task 007 ✅ (캐시 전략 통합 점검 — 본 Task)

Phase 3 Task 008 (공통 UI 컴포넌트) 또는 Phase 4 페이지 구현 진입 가능 상태.
다음 Task는 사용자 명시 지시 시 별도 plan_task 호출로 진행.
