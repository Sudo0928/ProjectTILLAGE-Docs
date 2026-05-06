# ProjectTILLAGE-Docs 개발 로드맵

Notion에 작성한 Project TILLAGE 기획서를 별도 작업 없이 자동으로 웹에 게시하되, **비기획자(아티스트/사운드 디자이너/외부 프로그래머/마케터/외부 이해관계자) 5개 페르소나가 5분 안에 게임 컨셉을 파악**할 수 있도록 진입 큐레이션과 작성 패턴 자동 변환을 제공하는 1인 개발 MVP의 단계별 실행 계획입니다. v1 골격(F001~F014)을 유지하면서 비기획자 친화 기능(F015~F019)을 통합한 정식 로드맵이며, 초기 골격 버전은 `docs/ROADMAP.archive.md`에 보존되어 있습니다.

## 개요

ProjectTILLAGE-Docs는 Notion으로 기획서를 관리하는 1인 기획자/개발자와 비기획자 동료/이해관계자를 위한 **Notion 기반 자동 발행 사이트**로 다음 19개 기능을 제공합니다.

**v1 핵심 기능 (그대로 유지)**

- **F001 글 목록 조회**: Notion DB에서 `웹 게시=발행됨` 글을 발행일 내림차순 카드 그리드로 노출
- **F002 글 상세 렌더링**: Notion 페이지 블록을 HTML로 변환해 본문 표시
- **F003 카테고리 필터링**: Notion `분류` select 옵션 17개를 카테고리 메뉴로 자동 동기화
- **F004 글 검색**: 제목/태그 부분 일치 검색 결과 페이지 제공
- **F010 반응형 레이아웃**: 모바일/태블릿/데스크톱 자연스러운 그리드
- **F011 글로벌 헤더 내비게이션**: 로고/카테고리 메뉴/검색바 공통 제공
- **F012 태그 칩 표시**: 카테고리보다 세분화된 맥락 정보
- **F013 빈/에러/로딩 상태**: 모든 목록/상세 페이지 안정적 표시
- **F014 SEO 메타데이터**: 외부 공유 미리보기 품질 확보

**v2 비기획자 친화 신규 기능**

- **F015 비기획자 진입 큐레이션**: 홈 HERO + Logline + "처음 오셨나요?"(`추천 순위` 1~3, 동률 시 `발행일` 내림차순 보조 정렬) + "관심사로 골라보기"(5개 페르소나 정적 매핑, 서로 다른 분류 묶음 보장)
- **F016 TL;DR 자동 추출**: 4단계 우선순위(`# 0. 한 줄 정의` → 첫 quote → `요약` 속성 → 본문 50자 fallback) + placeholder 패턴(`✏️ [작성 필요]`/`[TBD]`/`[작성중]`) 단계 fall-through
- **F017 작성 패턴 자동 변환**: callout(💡) → 파란 인트로 박스, 표 셀 `[확정]`/`[임시]` → 녹색/노랑 배지, `# N. 미결 사항` 섹션 → 기본 접힘 토글(🚧 "기획자 작업 중")
- **F018 연동 문서 → 추천 카드**: `# N. 연동 문서` 섹션 페이지 멘션을 카드 그리드로 변환. 비공개 멘션 숨김, 0개면 영역 자체 숨김, `unstable_cache` 메모이즈로 N+1 + Notion 3 req/s rate limit burst 방지
- **F019 읽기 메타 + 동일 분류 추천**: 글 상세에만 읽기 시간(한국어 분당 500자) 표시, 카드/상세에 `독자 수준` 칩(미설정 시 미노출), 같은 분류 글 3건 자동 추천 (LIMIT 4 후 클라이언트 후처리로 현재 페이지 ID 제외)

핵심 전략은 **Next.js 15.5.3 App Router + ISR(`revalidate = 60`)** 기반 서버 컴포넌트 우선 렌더링이며, 검색 페이지만 `dynamic = 'force-dynamic'`으로 처리합니다. 데이터 저장소는 **Notion API 단독**이며 자체 DB나 쓰기 경로는 존재하지 않습니다.

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `docs/ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입
   - 한 번에 한 Task만 작성 (1인 개발 운영 원칙)

2. **작업 생성**
   - `docs/tasks/` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-deps-and-typography.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **Notion API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP E2E 시나리오 작성)**
   - **변환 로직(F016/F017/F018) 작업 시 실제 Notion 페이지를 fetch하여 변환 결과를 검증하는 시나리오 필수 포함**
   - 예시를 위해 `docs/tasks/`의 마지막 완료된 작업 참조 (예: 현재 `006`이라면 `005`/`004`를 참고)
   - 새 작업 파일은 빈 박스(`- [ ]`)와 변경 사항 요약 미작성 상태로 시작

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **Notion API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - **F018 메모이즈 동작은 Network 탭 또는 콘솔 로그로 fetch 횟수 검증 의무**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시
   - 완료된 Task에는 `See: /docs/tasks/XXX-xxx.md` 참조 추가
   - Phase 내 모든 Task 완료 시 Phase 헤더에도 ✅ 추가

---

## 개발 단계

### Phase 0: 사전 준비 (완료) ✅

스타터킷에서 ProjectTILLAGE-Docs MVP 기준선까지의 정리 작업이 완료되었습니다.

- ✅ 데모/인증 컴포넌트 제거 (login/signup, hero/features/cta)
- ✅ 헤더/푸터/내비게이션을 ProjectTILLAGE 브랜드로 교체, `/categories` 메뉴 추가
- ✅ `src/lib/env.ts`에 Notion 환경 변수 Zod 스키마 정의 (`NOTION_TOKEN`, `NOTION_DATABASE_ID`, `NEXT_PUBLIC_SITE_URL`, 모두 optional)
- ✅ `.env.local.example` 추가 및 가이드 코멘트 정리
- ✅ shadcn/ui, ThemeProvider, Container 등 인프라 보존

미완료 항목으로 다음 두 개가 남아있으며 Phase 1에서 처리합니다.

- ✅ `@notionhq/client`, `@tailwindcss/typography` 설치 완료 → Phase 1 Task 001 See: /docs/tasks/001-deps-and-typography.md
- ✅ `src/app/layout.tsx`(RootLayout)에 Header/Footer 통합 완료 → Phase 1 Task 002 See: /docs/tasks/002-route-shell-and-layout.md

---

### Phase 1: 애플리케이션 골격 구축

라우트 구조와 빈 페이지 셸, 도메인 타입을 우선 확보하는 단계입니다. UI/데이터 작업이 병렬로 진행될 수 있도록 골격부터 완성합니다.

> ⚠️ **사용자 사전 작업 필수 (Phase 1 Task 003 시작 전)**
> Notion "기획서 모음" DB(`345bcbcfa9ea80b38ec5c777f19c3442`)에 다음 6개 속성을 사용자가 직접 추가해야 본 Phase Task 003 이후 모든 데이터 함수가 동작합니다.
>
> | 속성명    | 타입         | 옵션/비고                                         |
> | --------- | ------------ | ------------------------------------------------- |
> | 웹 게시   | select       | "발행됨"(green) / "초안"(gray) — 사이트 노출 토글 |
> | 발행일    | date         | start만 사용 — 정렬 기준                          |
> | 태그      | multi_select | 자유 추가 — 카드 칩 + 검색 매칭                   |
> | 요약      | rich_text    | 1~2 문장 — TL;DR fallback 소스                    |
> | 독자 수준 | select       | "입문" / "중급" / "심화" — 진입 큐레이션 칩       |
> | 추천 순위 | number       | 1~3 — "처음 오셨나요?" 우선순위                   |
>
> 기존 6개 속성(항목/분류/상태/작성자/최종 편집 일시/상위·하위 항목)은 손대지 않습니다. **사이트 노출 여부는 신규 `웹 게시` 속성이 단독으로 결정**하며 기존 `상태`(시작 전/진행 중/완료)는 게임 기획 작업 진행도일 뿐 사이트 노출과 무관합니다.

- ✅ **Task 001: 의존성 설치 및 타이포그래피 설정** - 완료
  - shrimp ID: `9dfbd998` (Phase 1-001 의존성 설치 및 타이포그래피 설정)
  - `@notionhq/client` 설치 (Notion 공식 SDK)
  - `@tailwindcss/typography` 설치 후 `globals.css`에 plugin 등록 + `prose` 클래스 활용 가능 상태로 만들기
  - 본 MVP는 자체 블록 매핑(Task 006)을 사용하므로 `notion-to-md` 같은 외부 변환 라이브러리는 추가하지 않음 — Phase 2에서 직접 렌더러 구현
  - `package.json` 스크립트(`check-all`/`build`)에 새 의존성이 영향 주지 않는지 확인
  - **다중 파일 동기화** (shrimp-rules.md 9.2): `package.json` / `README.md` 기술 스택 / `CLAUDE.md` 핵심 기술 스택 / `docs/PRD.md` 기술 스택 / 본 ROADMAPv2 Task 체크박스
  - **산출물**: 새 의존성이 반영된 `package.json` / `package-lock.json`, `prose` 적용 가능한 `globals.css`
  - **의존성**: 없음 (Phase 0 완료 위에서 시작)
  - **검증 기준**: `npm run check-all` 통과, `npm run build` 성공, `prose` 클래스가 임시 페이지에서 렌더링되는지 수동 확인
  - See: /docs/tasks/001-deps-and-typography.md

- ✅ **Task 002: 라우트 구조 및 빈 페이지 셸 생성** — 완료
  - shrimp ID: `b3ef441d` (Phase 1-002 라우트 셸 및 RootLayout 헤더/푸터 통합)
  - `/` 홈 페이지(이미 존재) 골격 정리 (HERO/추천/페르소나/최근 글 4개 섹션 placeholder)
  - `/categories` 카테고리 인덱스 페이지 셸 추가
  - `/categories/[slug]` 카테고리 상세 페이지 셸 추가
  - `/search` 검색 결과 페이지 셸 추가 (`?q=` 쿼리 수신, `dynamic = 'force-dynamic'` 선언)
  - `/posts/[slug]` 글 상세 페이지 셸 추가 (`generateMetadata` 자리만 정의)
  - **RootLayout 헤더/푸터 통합 (Phase 0 미완료 항목 해결)**: `src/app/layout.tsx`에서 `<Header />`/`<Footer />`/`<main>` 래핑이 모든 라우트에 적용
  - 모든 페이지에 `export const revalidate = 60` 또는 `dynamic = 'force-dynamic'` 명시 (shrimp-rules.md 5.3)
  - 각 페이지 본문은 `<Container>` 사용 (shrimp-rules.md 6.2 — `max-w-*` 직접 사용 금지)
  - **산출물**: 5개 라우트 모두 404 없이 라우팅되며 헤더/푸터가 일관되게 표시되는 상태 (M1 마일스톤 달성)
  - **의존성**: Task 001 완료
  - **검증 기준**: Playwright MCP로 5개 URL 직접 진입 → 200 응답 + 헤더/푸터 노출 확인 ✅
  - See: /docs/tasks/002-route-shell-and-layout.md

- **Task 003: 도메인 타입, Zod 스키마, 큐레이션 모듈 정의 (v2 확장)**
  - shrimp ID: `34264159` (Phase 1-003 도메인 타입 및 Zod 스키마 정의 — 신규 6개 속성 + persona-curation + site-config 포함)
  - `src/types/post.ts`에 다음 도메인 타입 정의:
    - `Post`: id / slug / title / summary? / category / tags / publishedAt / **publication**("발행됨"|"초안") / coverImage? / **readerLevel?**("입문"|"중급"|"심화"|null) / **recommendOrder?**(number|null)
    - `PostContent`: postId / blocks / coverImage? / lastEditedAt
    - `Category`: name(이모지 포함) / slug / postCount
    - `NotionBlock`: id / type / content
    - `PostCardProps = Pick<Post, ...>` 헬퍼
  - **영문 키 명명 규칙**: `Post.publication`(`status` 아님) — Notion 한글 `상태`(status 타입) 속성과의 인지 오류 방지. 매핑은 PRD "속성 매핑 표" 참조
  - `src/lib/notion/schemas.ts`에 Notion 응답 정규화 Zod 스키마 정의 — **8개 한글 속성** `항목`/`분류`/`태그`/`발행일`/`웹 게시`/`요약`/`독자 수준`/`추천 순위` 매핑. 상단 한글 주석으로 가정 property 이름 명시
  - 검색 쿼리 파라미터(`SearchParams`) 타입과 Zod 검증 스키마(`q.trim().min(1).max(200)`) 정의. 검증 실패 메시지는 한국어
  - **신규 `src/lib/site-config.ts`**: HERO Logline ("5년 안에 감염으로 죽을 주인공이 작은 섬에서 농사를 짓고 섬 사람들과 인연을 쌓아 가면서 삶의 의미를 찾아가는 게임"), 분위기 카피, 사이트 기본 메타데이터 등 정적 상수 단일 소스
  - **신규 `src/lib/notion/persona-curation.ts`**: 5개 페르소나(아티스트/사운드 디자이너/외부 프로그래머/마케터/외부) ↔ 분류 묶음 정적 매핑. PRD "페르소나별 진입 시나리오" 표를 단일 모듈로 흡수. **5개 페르소나 모두 서로 다른 분류 묶음을 가져야 함** — 매핑 테스트로 보장
  - **사용자 사전 작업 의존성**: 위 박스의 6개 Notion 속성 추가가 사전 완료되어야 함
  - **산출물**: 데이터 레이어/UI가 공유할 단일 타입 소스 + 큐레이션 정적 모듈 2개(`site-config.ts`, `persona-curation.ts`)
  - **의존성**: Task 002 완료, 사용자 Notion DB 6개 속성 추가 완료
  - **검증 기준**: `npm run typecheck` 통과, Zod 스키마 단위 테스트(임시 fixture)로 한글 속성 8개 모두 파싱 성공, persona-curation 매핑이 5개 페르소나 × 서로 다른 분류 묶음을 가지는지 단순 단언

---

### Phase 2: 데이터 레이어 (Notion 연동)

Notion API 호출, 정규화, 캐시 정책을 한 번에 정리합니다. UI보다 우선해 처리해야 더미가 아닌 실데이터 흐름을 빠르게 검증할 수 있습니다.

- **Task 004: Notion 클라이언트 및 환경 변수 가드 구현**
  - `src/lib/notion/client.ts`에 싱글톤 Notion 클라이언트 생성. 파일 상단에 `// 서버 전용 모듈 — 'use client' 파일에서 import 금지` 주석 추가 (shrimp-rules.md 5.4)
  - `NOTION_TOKEN` / `NOTION_DATABASE_ID` 미설정 시 친절한 한국어 에러 메시지를 던지는 `assertNotionEnv()` 가드 함수 추가. **빌드는 차단하지 않음** (env optional 정책)
  - 모든 데이터 접근 함수가 동일한 클라이언트를 통해 호출되도록 일원화
  - 로컬 `.env.local` 작성 가이드 보강 (`.env.local.example` 코멘트 정리)
  - **산출물**: `src/lib/notion/client.ts`, `assertNotionEnv()` 헬퍼
  - **의존성**: Task 003 완료
  - **검증 기준**: 환경 변수 미설정 시 페이지 진입 시 ErrorState 노출, 콘솔에 한국어 안내 로그, 크래시/빌드 차단 없음

- **Task 005: 글 목록/상세/카테고리/검색/추천/관련 글 6개 데이터 함수 구현 (F001/F002/F003/F004/F015/F019)**
  - `src/lib/notion/posts.ts`에 다음 6개 함수 구현 (각각 `웹 게시 === '발행됨'` 필터 필수, shrimp-rules.md 5.2):
    - `getPublishedPosts()` (F001): `발행일` 내림차순 (발행일 미설정 시 `최종 편집 일시` fallback)
    - `getPostBySlug(slug)` (F002): 페이지 메타 + `blocks.children.list` 호출 후 정규화
    - `getCategories()` (F003): 단일 query로 모든 발행 글 fetch 후 메모리에서 분류별 글 수 집계 (17개 분류 분할 query 회피로 Notion rate limit 보호)
    - `getPostsByCategory(slug)` (F003): 슬러그 매칭 + 발행일 내림차순
    - `searchPosts(query)` (F004): 제목/태그 부분 일치(소문자 정규화)
    - `getRecommendedPosts(limit)` (F015): `웹 게시 == '발행됨' AND 추천 순위 between 1 and 3` + 추천 순위 오름차순 + 동률 시 발행일 내림차순
    - `getRelatedPostsByCategory(category, currentId, limit)` (F019): `LIMIT (limit+1)` fetch 후 서버 측에서 `currentId` 제외, 최대 `limit`건 반환. **Notion API의 `does_not_equal` ID 필터 부재로 인한 클라이언트 후처리 패턴 강제**
  - 결과 타입은 `{ posts, error }` 형식으로 빈 결과/실패를 호출부가 구분 가능하게 (shrimp-rules.md 5.5)
  - `revalidate = 60` ISR 설정을 데이터 페치 함수 단위에 부여 (`fetch` 캐시 옵션 또는 `unstable_cache`)
  - Notion 페이지 ID 기반 `slug` 생성 헬퍼 작성 (`src/lib/notion/slug.ts`)
  - **Playwright MCP 테스트**: `/posts/[slug]` 라우트에 임시 페이지를 띄워 정규화 결과(제목/분류/태그/발행일/요약/독자 수준/추천 순위) 모두 노출되는지 확인. `웹 게시=초안` 글이 어떤 경로에서도 노출되지 않는지 회귀
  - **산출물**: `src/lib/notion/posts.ts`, `src/lib/notion/categories.ts`, `src/lib/notion/slug.ts`
  - **의존성**: Task 004 완료
  - **검증 기준**: 6개 함수 모두 실제 Notion DB 응답을 정규화하여 도메인 타입에 맞는 결과 반환, `초안` 페이지 노출 0건

- **Task 006: Notion 블록 → HTML 변환 + 작성 패턴 자동 변환 (F002/F016/F017/F018/F019)**
  - 지원 블록: `paragraph`, `heading_1~3`, `bulleted_list_item`, `numbered_list_item`, `image`, `code`, `quote`, `divider`, `table`+`table_row`, `toggle`, `callout`
  - 텍스트 어노테이션(볼드/이탤릭/코드/링크) 처리
  - 이미지 블록 → `next/image` 호환 컴포넌트 출력 (커버 이미지 포함)
  - 토글 블록 → 사이트에서도 접힘/펼침 유지 (기본 접힘)
  - 미지원 블록은 콘솔 경고 + 안전한 fallback 렌더링 (크래시 방지)
  - **신규 공통 유틸 `extractSectionsByHeading(blocks, predicate)`**: heading_1 패턴 매칭 → 다음 heading 직전까지 블록 그룹화 (F016/F017/F018에서 공유)
  - **F016 TL;DR 추출 유틸 `extractTldr(blocks, summary)`** (`src/lib/notion/tldr-extractor.ts`):
    - 4단계 우선순위:
      1. "# 0. 한 줄 정의" 섹션의 첫 단락 본문
      2. 페이지 최상단 첫 블록의 `type === 'quote'`
      3. Notion `요약` 속성 (rich_text)
      4. 본문 첫 단락의 앞 50자 (말줄임 처리)
    - **각 단계에서 추출 본문이 빈 문자열이거나 placeholder 패턴이면 다음 단계로 fall-through**
    - placeholder 정규식: `/^\s*(✏️\s*)?\[\s*(작성\s*필요|TBD|작성중|미작성|작성중입니다?)\s*\]\s*$/`
    - 4단계 모두 실패 시 TL;DR 박스 자체를 미렌더링
  - **F017 작성 패턴 변환**:
    - callout 블록(`block.callout.icon.emoji === '💡'`) → 파란 배경 인트로 박스 (`CalloutIntro` 컴포넌트, `not-prose` 적용)
    - 표 셀 `table_row.cells`의 rich_text plain_text에서 `[확정]`/`[임시]` 매칭 → 색상 배지 (split-replace, 녹색/노랑, shadcn `Badge` 활용)
    - `# N. 미결 사항` 섹션 → `Collapsible` 기본 접힘 + 헤더에 🚧 "기획자 작업 중" 라벨
  - **F018 연동 문서 카드 변환**:
    - `# N. 연동 문서` 섹션의 페이지 멘션 추출
    - 각 멘션 페이지의 메타(제목/분류/요약)를 별도 fetch
    - **`unstable_cache` 또는 React 19 `cache()`로 메모이즈하여 N+1 fetch + Notion 평균 3 req/s rate limit burst 방지** (PRD 비기능 요구사항 명시)
    - `웹 게시 != 발행됨`인 멘션은 카드에서 숨김 (비공개 페이지 노출 차단)
    - 노출 가능 멘션이 0개면 섹션 영역 자체 숨김
  - **F019 읽기 시간 계산 유틸 `calculateReadingTime(blocks)`** (`src/lib/notion/reading-time.ts`): 본문 블록을 평문으로 펼친 뒤 `Math.max(1, Math.round(글자수 / 500))` 분 (한국어 분당 500자, 최소 1분)
  - **Playwright MCP 테스트**: 실제 Notion 페이지로 fetch하여 ① TL;DR 4단계 모두 의도대로 동작 ② 💡 콜아웃 → 인트로 박스 ③ `[확정]`/`[임시]` → 색상 배지 ④ 미결 사항 토글 기본 접힘 ⑤ 연동 문서 카드 + 비공개 멘션 숨김 + 0개면 영역 숨김 ⑥ 읽기 시간 글 상세에만 노출 — 6개 시나리오 모두 검증
  - **산출물**: `src/lib/notion/render-blocks.tsx`, `src/lib/notion/section-utils.ts`, `src/lib/notion/tldr-extractor.ts`, `src/lib/notion/reading-time.ts`, `src/lib/notion/related-docs-fetcher.ts`(메모이즈 wrapper)
  - **의존성**: Task 005 완료
  - **검증 기준**: 위 Playwright MCP 시나리오 6건 모두 통과, F018 메모이즈 동작이 Network 탭/콘솔 로그로 fetch 횟수 검증되어 N+1 미발생

- **Task 007: 캐시 전략 통합 점검**
  - 모든 페이지가 shrimp-rules.md 5.3 표(홈/카테고리/카테고리 상세/글 상세 → ISR 60s, 검색 → dynamic)대로 구현되었는지 점검
  - F018 메모이즈 wrapper와 페이지 단위 ISR이 충돌 없이 동작하는지 확인
  - `revalidate = 60` 후 60초 이내 발행 상태 토글이 반영되는지 수동 측정
  - 검색 페이지는 `dynamic = 'force-dynamic'` 또는 `searchParams` 사용으로 매 요청 fresh 응답
  - **산출물**: 캐시 전략 점검 결과 요약 (Task 파일 변경 사항에 첨부)
  - **의존성**: Task 006 완료
  - **검증 기준**: 5개 페이지 모두 의도된 캐시 전략으로 동작, 60초 반영 측정값 첨부

---

### Phase 3: 공통 UI 컴포넌트

데이터 레이어 위에서 재사용될 컴포넌트를 한 번에 만들어 페이지 구현 속도를 끌어올립니다.

- **Task 008: 글 카드 및 상태 컴포넌트 (F010/F012/F013/F015/F018/F019 일부)**
  - `PostCard`: 제목, 분류 배지(이모지 포함), 태그 칩(F012), 발행일, 본문 요약, 호버 강조, **독자 수준 칩(F019, 미설정 시 미노출)** — **읽기 시간은 카드 미노출** (글 상세에만, 본문 fetch 비용 회피)
  - `PostCardGrid`: 데스크톱 3열 / 태블릿 2열 / 모바일 1열 반응형 그리드 (F010)
  - `EmptyState`: "아직 등록된 글이 없어요" 등 상황별 한국어 메시지 + CTA (F013)
  - `ErrorState`: Notion API 실패 시 안내 + 홈/재시도 버튼 (F013). 환경 변수 미설정 시에도 같은 컴포넌트 재사용
  - `LoadingSkeleton`: shadcn `Skeleton` 기반 카드/상세 로딩 UI (F013)
  - **신규 `RecommendCard`**(F015 "처음 오셨나요?"용): 더 큰 카드 사이즈, 추천 순위 배지, 한 줄 후킹 카피
  - **신규 `PersonaCard`**(F015 "관심사로 골라보기"용): 페르소나 이름/이모지 + 분류 묶음 칩 표시
  - **신규 `TldrBox`**(F016): 본문 상단 회색 배경 박스, `not-prose` 적용
  - **신규 `CalloutIntro`**(F017): 파란 배경 + 💡 아이콘
  - **신규 `TableCellBadge`**(F017): 녹색([확정])/노랑([임시]) shadcn `Badge` 변형
  - **신규 `MissingItemsCollapsible`**(F017): 🚧 "기획자 작업 중" 헤더 + 기본 접힘 `Collapsible`
  - **신규 `RelatedPostsSection`**(F018/F019): F018 연동 문서 카드 그리드 + F019 동일 분류 추천 3건 — 동일 그리드 컴포넌트 재사용
  - 모든 컴포넌트는 한국어 노출 문자열 사용 (shrimp-rules.md 6.5)
  - 클래스 결합은 `cn()` 헬퍼로 일원화 (shrimp-rules.md 6.3)
  - **산출물**: `src/components/posts/*` 하위에 정리된 재사용 컴포넌트군 (10여 개)
  - **의존성**: Task 003 완료(타입), Task 006 완료(F018 메모이즈 wrapper 사용 시점에 RelatedPostsSection 내부에서 호출)
  - **검증 기준**: Storybook 없이도 임시 페이지에서 더미 데이터로 각 컴포넌트가 의도대로 렌더, 한국어 노출 문자열 위반 0건

- **Task 009: 헤더 검색바 및 카테고리 메뉴 동적화 (F003/F004/F011)**
  - 헤더에 React Hook Form + Zod resolver 기반 검색 입력 폼 추가 (엔터/버튼 → `/search?q=`) (shrimp-rules.md 8)
  - 모바일 시트(`mobile-nav.tsx`)에 검색 입력 동선 추가
  - `getCategories()` 결과를 헤더 카테고리 드롭다운/탭에 주입 (서버 컴포넌트 → 클라이언트 props 전달)
  - 푸터의 카테고리 빠른 링크도 동일 데이터 소스 사용
  - **다중 파일 동기화** (shrimp-rules.md 9.1): `main-nav.tsx`(데스크톱)와 `mobile-nav.tsx`(모바일)의 `navItems` 동시 수정 필수
  - **Playwright MCP 테스트**: 검색 입력→결과 페이지 이동, 카테고리 메뉴 클릭→해당 페이지 이동 시나리오
  - **산출물**: 동적 카테고리 메뉴 + RHF 검색바 통합 헤더
  - **의존성**: Task 005 완료(`getCategories()`), Task 008 완료
  - **검증 기준**: Playwright MCP로 5개 라우트 헤더 일관성 + 검색→결과 + 카테고리→상세 동선 무오류

---

### Phase 4: 페이지별 구현

데이터 레이어와 공통 컴포넌트를 조립해 5개 페이지를 완성합니다.

- **Task 010: 홈 페이지 구현 (F001/F010/F012/F013/F015/F019)**
  - 서버 컴포넌트에서 데이터 페치 병렬: `getPublishedPosts()` + `getRecommendedPosts(3)` + `persona-curation` 정적 매핑
  - **HERO 영역 (F015)**: `src/lib/site-config.ts`의 Logline + 분위기 카피 정적 노출. 단일 상수 모듈에서만 가져오기 (페이지에 하드코딩 금지)
  - **"처음 오셨나요?" 섹션 (F015)**: `RecommendCard` 3개 자동 노출 (추천 순위 1~3, 동률 시 발행일 내림차순)
  - **"관심사로 골라보기" 섹션 (F015)**: 5개 `PersonaCard` (서로 다른 분류 묶음 보장)
  - **최근 글 카드 그리드 (F001)**: `PostCardGrid` 렌더링. 카드에 분류 배지/태그 칩(F012)/발행일/요약/독자 수준 칩(F019, 미설정 시 미노출). **읽기 시간 카드 미노출**
  - 빈/에러/로딩 상태 컴포넌트 연결 (F013)
  - 카드 클릭 시 `/posts/[slug]` 라우팅 동작 확인
  - **Playwright MCP 테스트**: 홈 → HERO/추천/페르소나/최근 글 4개 섹션 표시 → 각 카드 클릭 → 상세 동선 무오류 검증
  - **산출물**: `src/app/page.tsx` 완성
  - **의존성**: Task 005, Task 008, Task 009 완료
  - **검증 기준**: 4개 섹션 모두 노출, 모바일 1열 / 태블릿 2열 / 데스크톱 3열 반응형 확인

- **Task 011: 카테고리 인덱스 + 카테고리 상세 페이지 구현 (F001/F003/F010/F011/F012/F013/F019)**
  - **`/categories` 인덱스**: 17개 분류 카드(이모지 + 이름 + 발행 글 수). 데스크톱 4열 / 태블릿 2열 / 모바일 2열. 글 0건 분류는 흐리게 표시(클릭은 가능, 빈 상태 안내)
  - **`/categories/[slug]` 상세**: 현재 분류 강조 헤드라인 + 분류에 속한 발행 글만 `PostCardGrid`. 카드에 태그 칩(F012)/독자 수준 칩(F019, 미설정 시 미노출). **읽기 시간 카드 미노출**
  - 빈 카테고리 안내(`EmptyState`) 노출 정책 적용 ("아직 등록된 글이 없어요")
  - 글 카드 분류 배지 클릭 시 `/categories/[slug]`로 이동하도록 라우팅 연결
  - **Playwright MCP 테스트**: 헤더 카테고리 메뉴 → 인덱스 → 분류 카드 클릭 → 상세 → 카드 클릭 → 글 상세 동선 검증. 빈 분류 안내 노출 회귀
  - **산출물**: `src/app/categories/page.tsx`, `src/app/categories/[slug]/page.tsx`
  - **의존성**: Task 005, Task 008, Task 009 완료
  - **검증 기준**: 17개 분류 모두 인덱스에 카드로 노출, 슬러그 매칭으로 분류 상세 진입 시 해당 분류 글만 표시

- **Task 012: 검색 결과 페이지 구현 (F001/F004/F010/F011/F012/F013/F019)**
  - `?q=` 쿼리 파라미터 → Zod 검증 → `searchPosts()` 호출
  - "'쿼리'에 대한 N건" 한국어 헤드라인 표시
  - 결과 없음 상태에서 카테고리 인덱스 진입 유도 CTA 노출 (F013)
  - 페이지 자체는 동적 렌더링 보장 (`export const dynamic = 'force-dynamic'` 또는 `searchParams` 사용 — shrimp-rules.md 5.3)
  - 결과 카드 그리드는 홈/카테고리와 동일 `PostCardGrid` 재사용. 독자 수준 칩(F019, 미설정 시 미노출)
  - **Playwright MCP 테스트**: 검색어 입력 → 결과 노출 / 결과 없음 상태 전환 / 매 요청 fresh 응답(캐시 미적용) 검증
  - **산출물**: `src/app/search/page.tsx`
  - **의존성**: Task 005, Task 008, Task 009 완료
  - **검증 기준**: 동적 렌더링 동작 + 결과/빈 상태 전환

- **Task 013: 글 상세 페이지 구현 (F002/F010/F011/F012/F013/F014/F016/F017/F018/F019)**
  - 슬러그로 메타+본문 조회 후 헤더(제목/발행일/분류 배지/태그 칩(F012)/**읽기 시간**(F019)/**독자 수준 칩**(F019, 미설정 시 미노출)) 렌더링
  - **TL;DR 강조 박스 (F016)**: `extractTldr(blocks, summary)` 결과를 본문 상단 `TldrBox`로 노출 (4단계 우선순위 + placeholder fall-through). 4단계 모두 실패 시 박스 미렌더링
  - **본문 렌더링 (F002 + F017)**: `render-blocks.tsx`로 Notion 블록 → HTML 변환, `prose` 적용. 변환 시 callout(💡) → `CalloutIntro`, 표 셀 `[확정]`/`[임시]` → `TableCellBadge`, `# N. 미결 사항` → `MissingItemsCollapsible` 자동 적용
  - **연동 문서 카드 그리드 (F018)**: `# N. 연동 문서` 섹션 추출 → 멘션 페이지 메타 fetch(메모이즈) → 비공개 멘션 필터링 → `RelatedPostsSection`. 노출 가능 멘션 0개면 영역 자체 숨김
  - **동일 분류 추천 3건 (F019)**: `getRelatedPostsByCategory(category, currentId, 3)` 호출 후 `PostCardGrid` 렌더. LIMIT 4 후 클라이언트 후처리로 현재 페이지 ID 제외
  - 본문 가독성: 모바일 16px 이상 / 키보드 포커스 스타일 / 명도 대비 4.5:1 이상 (shrimp-rules.md 비기능 요구사항 — Phase 5 Task 015에서 회귀 점검)
  - 본문 로딩 실패 시 `ErrorState` + 홈 이동 버튼 (F013)
  - `generateMetadata`로 글 제목/요약 기반 SEO 태그 생성 (F014)
  - OpenGraph/Twitter 카드용 절대 URL은 `NEXT_PUBLIC_SITE_URL` 사용
  - **Playwright MCP 테스트**: 카드 클릭 → TL;DR 박스 + 본문 변환(💡/배지/미결 토글) + 연동 문서 카드 + 동일 분류 추천 모두 노출 확인. 잘못된 슬러그 시 ErrorState. OG 메타 태그 head에 정상 삽입 확인. F019 동일 분류 추천에 현재 페이지 ID 미포함 검증
  - **산출물**: `src/app/posts/[slug]/page.tsx`
  - **의존성**: Task 005, Task 006, Task 008 완료
  - **검증 기준**: 6개 변환 시나리오(TL;DR 4단계/💡/배지/미결/연동/추천) + SEO 메타 + 에러 안내 모두 통과

---

### Phase 5: SEO/접근성/마무리

핵심 동선이 완성된 후, 외부 공유 품질과 비기능 요구사항을 일괄 점검합니다.

- **Task 014: SEO 메타데이터 일괄 정비 (F014)**
  - 루트 `metadata` 정리: 사이트 기본 타이틀 템플릿(`%s | ProjectTILLAGE-Docs`), OG 기본값, twitter 카드 설정
  - 홈/카테고리 인덱스/카테고리 상세/검색/글 상세 5개 페이지의 `generateMetadata` 정합성 점검
  - `robots.txt`, 기본 `sitemap.ts`(MVP 범위 내 정적 경로 — 홈/카테고리 인덱스만) 작성 검토. 동적 사이트맵은 MVP 제외
  - **산출물**: 외부 공유 시 미리보기(카카오톡/슬랙/디스코드) 정상 표시되는 메타 구조
  - **의존성**: Phase 4 완료
  - **검증 기준**: 5개 페이지 head에 의도된 메타 태그 삽입, OG 미리보기 외부 도구로 시뮬레이션 확인

- **Task 015: 접근성/가독성 점검**
  - 시맨틱 마크업(`<header>`, `<main>`, `<nav>`, `<article>`) 사용 여부 점검
  - 키보드 포커스 스타일 일관성 확인 (헤더, 카드, 링크, 토글)
  - 본문 명도 대비(라이트/다크) 4.5:1 이상 검증
  - 헤더의 검색 입력/카테고리 메뉴 대체 텍스트(`aria-label`/`aria-expanded`) 정리
  - 모바일 본문 폰트 16px 이상 확인
  - **산출물**: 접근성 점검 결과 요약 (Task 파일 변경 사항에 첨부)
  - **의존성**: Phase 4 완료
  - **검증 기준**: 키보드만으로 핵심 동선(홈→상세, 카테고리→상세, 검색→상세) 이동 가능

- **Task 016: 캐시·에러 안전성 + F016/F018 회귀 검증**
  - Notion API 실패 케이스 시뮬레이션(토큰 무효, DB 미설정) 후 ErrorState 노출 확인. 크래시/빌드 차단 없음
  - ISR 60초 동작 확인: 빌드 후 발행 상태 토글 → 60초 이내 반영 측정 (M6 마일스톤)
  - 콘솔 로깅이 사용자에게 노출되지 않는지 점검
  - **F016 TL;DR 4단계 회귀**: 4가지 fixture 페이지(`# 0. 한 줄 정의`만 있는 글, quote만 있는 글, 요약 속성만 있는 글, 셋 다 없는 글)로 4단계가 모두 의도대로 동작하는지 확인. **placeholder fall-through 누락 시 비기획자 진입 실패 — 회귀 점검 의무**
  - **F018 메모이즈 회귀**: 연동 문서 5개가 있는 글에서 동일 멘션이 중복되어도 fetch는 1회만 발생하는지 Network 탭/콘솔 로그로 확인
  - **Playwright MCP 테스트**: 에러 상태 강제 재현(잘못된 환경 변수)에서 크래시 없이 안내 노출
  - **산출물**: 캐시·에러 안전성 + F016/F018 회귀 결과 요약
  - **의존성**: Phase 4 완료
  - **검증 기준**: Notion API 실패 시 ErrorState 노출 + 60초 반영 측정값 첨부 + F016 4단계 회귀 통과 + F018 메모이즈 fetch 1회 검증

- **Task 017: 성능/품질 게이트 통과**
  - `npm run check-all` (typecheck + lint + format:check) 통과
  - `npm run build` (Turbopack) 성공
  - Lighthouse Performance 모바일/데스크톱 85점 이상 측정 (홈/카테고리 상세/글 상세 각 1회) — M8 마일스톤
  - 핵심 동선(홈→상세, 카테고리→상세, 검색→상세) Playwright MCP 회귀 테스트 1회 — M5 마일스톤
  - 외부 공유 OG 미리보기 확인 (M7 마일스톤)
  - **산출물**: 측정 결과 스크린샷/요약을 작업 파일 변경 사항에 첨부
  - **의존성**: Task 014, 015, 016 완료
  - **검증 기준**: 모든 게이트 통과 + Lighthouse 85+ 측정값 첨부

---

### Phase 6: 비기획자 정성 검증 + 배포

정성 지표(PRD 성공 지표 v2)를 직접 시연·인터뷰로 검증한 뒤 Vercel 배포를 마무리합니다.

- **Task 018: 비기획자 정성 인터뷰 (5개 페르소나 중 최소 2명 시연)** — M9 마일스톤
  - 5개 페르소나(아티스트/사운드 디자이너/외부 프로그래머/마케터/외부 이해관계자) 중 최소 2명에게 직접 시연
  - 각 페르소나에게 5분 시간 제한으로 "게임 컨셉(Logline + 핵심 시스템 1개)"을 파악할 수 있는지 관찰
  - 막히는 동선/문구/구조 메모 → Phase 4 페이지로 피드백 반영 (필요 시 추가 Task로 분리)
  - PRD 성공 지표 정성 항목 4개 직접 점검:
    1. 비기획자가 5분 안에 게임 컨셉 파악 가능한가
    2. 기획자가 새 작성 규칙을 의식하지 않고도 사이트가 친절하게 보이는가
    3. TL;DR 자동 추출이 4단계 우선순위 모두 의도대로 동작하는가
    4. `[확정]`/`[임시]` 배지, 미결 사항 토글, 연동 문서 카드가 의도대로 자동 변환되는가
  - **산출물**: 인터뷰 결과 요약 + 추후 개선 항목 리스트 (`docs/tasks/018-...md` 변경 사항)
  - **의존성**: Task 017 완료 (Lighthouse/회귀 모두 통과 후 시연)
  - **검증 기준**: 페르소나 2명 이상 인터뷰 완료 + 정성 지표 4개 모두 의도대로 동작 확인

- **Task 019: 배포 준비 및 운영 가이드**
  - Vercel 환경 변수 등록 가이드 작성 (`docs/guides/deployment.md` 신규 또는 본 Task 파일 내 정리)
  - Notion 통합 권한/데이터베이스 공유 절차 문서화 (Internal Integration 토큰 발급, DB 공유 권한 부여)
  - 60초 반영 확인 절차 및 캐시 무효화(재배포) 가이드 정리
  - 운영 중 발생 가능한 트러블슈팅 항목 짧게 정리 (Notion API 실패, 환경 변수 누락, Playwright MCP 회귀 실패 시 대응)
  - **산출물**: 배포 가이드 + 운영 트러블슈팅 항목
  - **의존성**: Task 017, 018 완료
  - **검증 기준**: Vercel 프로덕션 배포 성공 + 60초 반영 측정값 + OG 미리보기 정상

---

## 마일스톤 및 검증 지표

PRD v2의 성공 지표(정량 + 정성)를 단계별 검증 항목으로 매핑합니다.

| 마일스톤                            | 완료 기준                                                                                        | 측정 방법                                 | 관련 PRD 지표                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------ |
| **M0. 사전 준비 완료**              | Phase 0 완료 (스타터킷 정리)                                                                     | 수동 라우팅 점검                          | —                                    |
| **M1. 골격 완료**                   | 5개 라우트 모두 404 없이 라우팅 + 헤더/푸터 일관 표시                                            | Playwright MCP 회귀                       | F001~F004 진입 가능                  |
| **M2. 데이터 흐름 확립**            | Notion 발행 글 1건이 홈/상세에 노출                                                              | Playwright MCP 시나리오                   | F001/F002                            |
| **M3. 변환 로직 동작 확인**         | TL;DR 4단계 + 💡 인트로 + `[확정]`/`[임시]` 배지 + 미결 토글 + 연동 문서 카드 모두 의도대로 변환 | Playwright MCP + 실제 Notion 페이지 fetch | F016/F017/F018                       |
| **M4. 비기획자 진입 큐레이션 완성** | HERO + "처음 오셨나요?" 3건 + "관심사로 골라보기" 5장 모두 표시                                  | 수동 점검 + Playwright MCP                | F015                                 |
| **M5. 핵심 동선 무오류**            | 홈→상세, 카테고리 인덱스→상세→글 상세, 검색→상세 모두 정상                                       | Playwright MCP 회귀                       | "핵심 동선 전부 무오류 동작"         |
| **M6. 60초 반영 검증**              | Notion `웹 게시` 토글 후 60초 이내 사이트 반영                                                   | 수동 시간 측정                            | "60초 이내 사이트 반영"              |
| **M7. 외부 공유 품질**              | 글 상세 링크 OG 미리보기에 제목/요약 정상 노출                                                   | 카카오톡/슬랙/디스코드 미리보기           | "외부 공유 시 제목/요약 정상"        |
| **M8. Lighthouse 85+**              | 모바일/데스크톱 Performance 85점 이상 (홈/카테고리 상세/글 상세)                                 | Lighthouse 각 1회                         | "Lighthouse Performance 85점 이상"   |
| **M9. 비기획자 정성 검증**          | 5개 페르소나 중 최소 2명에게 5분 안에 게임 컨셉 전달 성공                                        | 직접 시연·인터뷰                          | "비기획자가 5분 안에 게임 컨셉 파악" |

---

## MVP 이후 (제외 항목)

PRD에 따라 MVP 범위에서 제외하며, 향후 우선순위만 정리합니다.

- 회원가입/로그인 등 인증 기능 (사이트는 공개 읽기 전용)
- 댓글, 좋아요, 북마크, 질문 등 사용자 상호작용
- 다크모드/폰트 크기 조절 등 사용자 설정 (현재 시스템 테마 토글 수준만 유지)
- 글 작성/편집 UI (작성은 Notion에서만)
- 다국어 지원, RSS, 사이트맵 자동화
- 조회수/방문자 분석 대시보드 (Vercel Analytics 정도만 활용)
- **용어 사전(Glossary)** — 전용 페이지 + 본문 자동 링킹 (비기획자가 가장 부담을 느끼는 부분이지만 MVP 범위 초과)
- **페이지 멘션 인라인 미니카드** — 본문 안 페이지 멘션을 호버 시 미리보기 카드로 변환 (F018에서 하단 카드 그리드로만 처리, 인라인은 후순위)
- **페르소나 코스 동적화** — 별도 큐레이션 DB로 페르소나별 추천 글 시퀀스 운영 (MVP는 정적 분류 매핑)
- **추천 알고리즘** — 태그 유사도/조회 기반 추천 (MVP는 같은 분류 단순 정렬)

---

## 1인 개발 운영 원칙

- **Phase 진입 시 한 번에 한 Task만 작성**: 작업 폭증을 막기 위해 다음 Task 파일은 직전 Task 완료 시점에 만든다.
- **데이터 레이어가 흔들리면 UI 단독 진행 금지**: Phase 2가 깨지면 Phase 4 Task는 보류한다 (shrimp-rules.md 10.5).
- **검증은 Playwright MCP 우선**: API/비즈니스 로직 변경 후 수동 클릭 대신 시나리오 1개라도 자동화한다.
- **무리한 일정 산정 금지**: Phase 단위 완료가 곧 마일스톤. 시간 박스가 아닌 체크리스트 기반으로 진행한다.
- **`.env.local`/시크릿은 절대 커밋 금지**: `.env.local.example`만 동기화한다 (shrimp-rules.md 11번 항목 #2).
- **F018 N+1 fetch 금지**: 반드시 `unstable_cache` 또는 React 19 `cache()` 메모이즈 적용 후 진행 (Notion 평균 3 req/s rate limit 보호 — PRD 비기능 요구사항 명시).
- **F019 동일 분류 추천**: LIMIT 4 후 클라이언트 후처리 패턴 강제. Notion API의 `does_not_equal` ID 필터 부재로 인한 우회 — `getRelatedPostsByCategory` 시그니처에 `currentId` 인자 필수.
- **F016 TL;DR 4단계 회귀 점검 의무**: 4단계 우선순위 + placeholder fall-through 누락 시 비기획자 진입 실패. Phase 5 Task 016에서 4가지 fixture 페이지로 회귀 점검 의무.
- **다중 파일 동기화 누락 금지** (shrimp-rules.md 9): 의존성 추가/환경 변수/MVP 범위/네비게이션 변경 시 관련 문서 일괄 갱신.
- **shrimp-rules.md 절대 금지 사항 18개 위반 금지**: 특히 `src/components/ui/*` 직접 수정, `process.env.*` 직접 사용, `'use client'`에서 `@notionhq/client` import, `웹 게시=초안` 페이지 노출, `max-w-*` 직접 사용, MVP 외 라우트 추가 금지.
