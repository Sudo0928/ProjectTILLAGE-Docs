# Task 006 — 블록 렌더러 + 비기획자 친화 패턴 변환 (F016/F017/F018/F019)

## 개요

- Phase: 2 (데이터 레이어 — Notion 연동) — Phase 2 세 번째 Task
- shrimp ID: f4ec809a-0f60-4174-9833-f00b5ab24ec6
- 의존성: Task 005 (7종 데이터 함수) ✅

## 수락 기준

- [x] shadcn Collapsible 설치 (`src/components/ui/collapsible.tsx` 생성)
- [x] F017 3개 컴포넌트 생성 (`callout-intro.tsx` / `table-cell-badge.tsx` / `missing-items-collapsible.tsx`)
- [x] `section-utils.ts` 생성 (3개 export: extractSectionsByHeading / extractPlainText / getRichTextFromBlock)
- [x] `reading-time.ts` 생성 (calculateReadingTime — 한국어 500자/분, 최소 1분)
- [x] `tldr-extractor.ts` 생성 (extractTldr 4단계 + PLACEHOLDER_REGEX 단일 소스)
- [x] `related-docs-fetcher.ts` 생성 (getRelatedDocs + unstable_cache 메모이즈, 절대 금지 #19)
- [x] `render-blocks.tsx` 생성 (RenderBlocks 비동기 서버 컴포넌트, 12종 블록 지원, 깊이 3 제한)
- [x] `src/types/post.ts` 수정 — PostContent.summary 추가 + NotionBlock → BlockObjectResponse alias
- [x] `src/lib/notion/posts.ts` 수정 — \_getPostBySlugImpl summary 필드 포함 반환
- [x] `next.config.ts` 수정 — Notion S3 이미지 remotePatterns 추가
- [x] `src/app/posts/[slug]/page.tsx` 임시 통합 (RenderBlocks + TL;DR + 읽기시간 + 연동문서)
- [x] tsx 검증 스크립트 2종 (`tldr-fixtures.ts` 5/5 PASS / `reading-time-fixtures.ts` 5/5 PASS)
- [x] `docs/PRD.md` PostContent 표 + NotionBlock 표 갱신
- [x] `npm run check-all` 통과 (typecheck + ESLint + Prettier)
- [x] `npm run build` 통과
- [x] Playwright 시나리오 ⑤ PASS (related-docs 미노출) / ⑥ PASS (읽기 시간 1분 노출)
- [x] Grep 검증 통과 (process.env.NOTION 1건 / 'use client' 지시문 0건 / PLACEHOLDER_REGEX 단일 소스)
- [x] ROADMAP Task 006 ✅ 갱신

## 변경 사항 요약

### 신규 파일 (CREATE)

| 경로                                                 | 역할                                              |
| ---------------------------------------------------- | ------------------------------------------------- |
| `src/components/ui/collapsible.tsx`                  | shadcn Collapsible (Radix UI 기반)                |
| `src/components/posts/callout-intro.tsx`             | F017 💡 callout 인트로 박스 (서버 컴포넌트)       |
| `src/components/posts/table-cell-badge.tsx`          | F017 [확정]/[임시] 배지 (서버 컴포넌트)           |
| `src/components/posts/missing-items-collapsible.tsx` | F017 미결 사항 접힘 토글 (클라이언트 컴포넌트)    |
| `src/lib/notion/section-utils.ts`                    | heading_1 섹션 추출 + plain_text + rich_text 헬퍼 |
| `src/lib/notion/reading-time.ts`                     | F019 읽기 시간 계산 (500자/분)                    |
| `src/lib/notion/tldr-extractor.ts`                   | F016 TL;DR 4단계 추출 + PLACEHOLDER_REGEX         |
| `src/lib/notion/related-docs-fetcher.ts`             | F018 연동 문서 메타 fetch + unstable_cache        |
| `src/lib/notion/render-blocks.tsx`                   | F002+F017 블록→JSX 렌더러 (비동기 서버 컴포넌트)  |
| `src/lib/notion/__verify/tldr-fixtures.ts`           | F016 fixture 검증 스크립트 (5건)                  |
| `src/lib/notion/__verify/reading-time-fixtures.ts`   | F019 fixture 검증 스크립트 (5건)                  |

### 수정 파일 (MODIFY)

| 경로                            | 변경 내용                                                          |
| ------------------------------- | ------------------------------------------------------------------ |
| `src/types/post.ts`             | PostContent.summary 추가 / NotionBlock → BlockObjectResponse alias |
| `src/lib/notion/posts.ts`       | \_getPostBySlugImpl summary 필드 포함 / blocks 매핑 단순화         |
| `next.config.ts`                | images.remotePatterns — Notion S3 호스트 2개 추가                  |
| `src/app/posts/[slug]/page.tsx` | 임시 통합 (RenderBlocks + TL;DR + 읽기시간 + 연동문서)             |
| `docs/PRD.md`                   | PostContent 표 summary 행 추가 / NotionBlock 표 alias 명시         |
| `docs/ROADMAP.md`               | Task 006 ✅ 갱신                                                   |

## 검증 결과

| 검증 항목                           | 결과                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `npm run check-all`                 | PASS (typecheck + ESLint 0 errors + Prettier)                       |
| `npm run build`                     | PASS (`/posts/[slug]` 6.73 kB, First Load 175 kB)                   |
| tsx tldr-fixtures                   | PASS 5/5 (1단계~4단계 + null)                                       |
| tsx reading-time-fixtures           | PASS 5/5 (0/100/500/1000/5000자)                                    |
| Playwright 시나리오 ⑤               | PASS — related-docs 요소 미존재 (Test 페이지 연동 문서 없음)        |
| Playwright 시나리오 ⑥               | PASS — "읽기 시간: 약 1분" 노출 확인                                |
| TL;DR 박스                          | PASS — "Test" 텍스트 노출 (요약 속성 3단계 또는 본문 첫 단락 4단계) |
| grep process.env.NOTION             | 1건 (env.ts만)                                                      |
| grep 'use client' 지시문 in notion/ | 0건                                                                 |
| grep PLACEHOLDER_REGEX              | 1건 (tldr-extractor.ts 단일 소스)                                   |
| grep dataSources.query              | 2건 (posts.ts + client.ts만)                                        |

## 테스트 체크리스트

### 완료된 시나리오

- [x] **시나리오 ⑤**: Test 페이지 `/posts/358bcbcfa9ea80d8ac6cd1a29d39fe82` 접속 → 연동 문서 영역 미렌더링 확인
- [x] **시나리오 ⑥**: 동일 페이지 "읽기 시간: 약 1분" 노출 확인
- [x] **tsx tldr-fixtures.ts**: 5/5 PASS
- [x] **tsx reading-time-fixtures.ts**: 5/5 PASS

### 사용자 추가 작업으로 실측 가능한 시나리오

Test 페이지(Notion)에 다음 요소를 추가하면 F017 시나리오를 실측할 수 있습니다:

- **시나리오 ②**: 💡 이모지 callout 블록 추가 → CalloutIntro 렌더링 확인
- **시나리오 ③**: 표 셀에 `[확정]` / `[임시]` 텍스트 추가 → TableCellBadge 배지 확인
- **시나리오 ④**: `# N. 미결 사항` heading_1 섹션 추가 → MissingItemsCollapsible 접힘 토글 확인
- **F016 1단계**: `# 0. 한 줄 정의` heading_1 + 첫 단락 텍스트 → TL;DR 1단계 매칭 확인
- **F018**: 연동 문서 섹션(`# N. 연동 문서`) + 다른 발행 글 page mention → 연동 문서 카드 노출 확인

## INFERENCE 항목 (사용자 확정 권장)

1. **F018 cache() 미병행**: React 19 `cache()`와 `unstable_cache` 중복 적용 대신 `unstable_cache` 단독으로 결정. 빌드 단위 메모이즈로 충분하며 복잡도 최소화.

2. **NotionBlock = BlockObjectResponse alias 단순화**: 기존 `{ id, type, content }` 인터페이스 대신 SDK 타입을 직접 alias. render-blocks.tsx 등 모든 모듈이 동일 타입 사용으로 `as` 캐스팅 불필요.

3. **F017 컴포넌트 위치**: `src/components/posts/`에 본 Task에서 추가. Phase 4 Task 013 본격 UI와 동일 위치 공유.

4. **Vitest 미설치**: 프로젝트 테스트 프레임워크 미결정 상태이므로 tsx 일회성 스크립트 + Playwright MCP 혼합 검증으로 대체.

5. **toggle children 1단계만**: toggle/bulleted_list_item 자식 블록은 깊이 1~3단계까지만 fetchChildren 호출. 깊은 중첩 구조는 Phase 4 후속 Task에서 필요 시 확장.

6. **render-blocks.tsx의 `key` prop**: React 서버 컴포넌트에서 `key`는 배열 렌더링 최적화 용도가 제한적이나, 클라이언트 hydration 안정성을 위해 블록 ID 기반으로 적용.

## 다음 Task 안내

**Task 007** — 캐시 전략 통합 점검 (ISR revalidate 정책 / tags 일관성 / on-demand revalidation 준비)

사용자 명시 지시 시 별도 `plan_task` 호출로 진행.
