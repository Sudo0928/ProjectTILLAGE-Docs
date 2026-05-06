# Task 002 — 5개 라우트 셸 및 RootLayout 헤더/푸터 통합

## 개요

- Phase: 1 (애플리케이션 골격 구축)
- shrimp ID: b3ef441d-2e15-4c1f-9284-15179377a350
- 의존성: Task 001 (의존성 설치 및 타이포그래피 설정) ✅
- 마일스톤: M1 (5 라우트 + 헤더/푸터 일관)

## 수락 기준

- [x] src/app/layout.tsx에 Header/Footer/main 통합 + sticky footer 패턴
- [x] 5개 라우트 셸 모두 생성: /, /categories, /categories/[slug], /search, /posts/[slug]
- [x] /search만 dynamic = 'force-dynamic', 나머지 4개는 revalidate = 60
- [x] /posts/[slug]에 generateMetadata 자리 정의
- [x] Next.js 15 async params 패턴 적용 (params/searchParams await)
- [x] 모든 페이지 본문 Container 래핑 (max-w-\* 직접 사용 0건)
- [x] Playwright MCP로 5 라우트 200 응답 + 헤더/푸터 일관 + 콘솔 에러 0건
- [x] prose 시각 검증 (Task 001 deferral 해소) — /posts/[slug] 셸에서 확인
- [x] npm run check-all + build 통과
- [x] M1 마일스톤 충족

## 변경 사항 요약

- `src/app/layout.tsx`: Header/Footer/main 통합, body에 `flex min-h-screen flex-col` sticky footer 패턴 클래스 추가
- `src/app/page.tsx`: revalidate=60 추가 + 4개 섹션 placeholder 코멘트 보강 (space-y-12)
- `src/app/categories/page.tsx` (신규): ISR 카테고리 인덱스 셸 (revalidate=60)
- `src/app/categories/[slug]/page.tsx` (신규): ISR 카테고리 상세 셸 (Next.js 15 async params)
- `src/app/search/page.tsx` (신규): 동적 검색 결과 셸 (searchParams Promise, force-dynamic)
- `src/app/posts/[slug]/page.tsx` (신규): ISR 글 상세 셸 + generateMetadata + prose 시각 검증
- `.prettierignore`: `.playwright-mcp/` 및 `shrimp_data/` 제외 항목 추가

## 검증 결과

### npm run check-all

```
typecheck: 통과 (tsc --noEmit)
lint: 통과 (eslint .)
format:check: 통과 (All matched files use Prettier code style!)
```

### npm run build (Turbopack)

```
Route (app)                         Size  First Load JS  Revalidate  Expire
┌ ○ /                                0 B         167 kB          1m      1y
├ ○ /_not-found                      0 B         167 kB
├ ○ /categories                      0 B         167 kB          1m      1y
├ ƒ /categories/[slug]               0 B         167 kB
├ ƒ /posts/[slug]                    0 B         167 kB
└ ƒ /search                          0 B         167 kB
```

- `/` — ISR 60s (revalidate=60) ✅
- `/categories` — ISR 60s (revalidate=60) ✅
- `/categories/[slug]` — Dynamic (ƒ): generateStaticParams 미정의 동적 라우트이므로 정상. Phase 4 Task 011에서 generateStaticParams 구현 후 ISR 전환 예정
- `/posts/[slug]` — Dynamic (ƒ): 동일한 이유. Phase 4 Task 013에서 전환 예정
- `/search` — Dynamic (ƒ): force-dynamic 선언 ✅

### Playwright MCP 검증 결과 (5 URL)

| URL                                        | h1 텍스트                                       | 헤더 | 푸터 | 콘솔 에러 |
| ------------------------------------------ | ----------------------------------------------- | ---- | ---- | --------- |
| http://localhost:3006/                     | "기획서 목록"                                   | ✅   | ✅   | 0건       |
| http://localhost:3006/categories           | "분류 인덱스"                                   | ✅   | ✅   | 0건       |
| http://localhost:3006/categories/test-slug | "분류: test-slug"                               | ✅   | ✅   | 0건       |
| http://localhost:3006/search?q=hello       | "검색 결과" + "'hello'에 대한 검색 결과입니다." | ✅   | ✅   | 0건       |
| http://localhost:3006/posts/test-slug      | title="test-slug", article>h1                   | ✅   | ✅   | 0건       |

### prose 시각 검증 (Task 001 옵션 B 완료)

- `/posts/test-slug` 셸의 `<article className="prose dark:prose-invert mx-auto py-12">` 적용 확인
- h1 "test-slug": prose 대형 헤딩 스타일(굵은 폰트, 큰 폰트 사이즈) 시각 확인
- paragraph: prose 행간/컬러 스타일 시각 확인
- article이 Container(max-w-7xl) 내부에서 mx-auto로 가운데 정렬, 가독 폭으로 좁혀짐 확인
- Task 001에서 deferral한 prose 렌더링 검증 완료

## 참고

- `main-nav.tsx` / `mobile-nav.tsx` navItems = [홈, 카테고리] 변경 없음 (검색바 + 동적 카테고리는 Phase 3 Task 009)
- Header sticky-top과 페이지 Container는 별도 인스턴스 — 시각 충돌 없음
- `posts/[id]` 빈 디렉토리는 작업 전부터 존재했으며, 본 Task에서 `posts/[slug]`를 신규 생성함 (기존 빈 디렉토리 정리는 git clean으로 처리 가능)
- `.prettierignore`에 `.playwright-mcp/` 및 `shrimp_data/` 추가로 check-all 안정성 확보
