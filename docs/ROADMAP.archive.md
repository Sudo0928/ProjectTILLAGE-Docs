# ProjectTILLAGE-Docs 개발 로드맵

Notion에 작성한 기획서를 별도 작업 없이 자동으로 웹에 게시하는 1인 개발 MVP의 단계별 실행 계획입니다.

## 개요

ProjectTILLAGE-Docs는 Notion으로 문서를 관리하는 1인 기획자/개발자와 비기획자 동료/이해관계자를 위한 **Notion 기반 자동 발행 사이트**로 다음 기능을 제공합니다:

**v1 핵심 기능**

- **F001 글 목록 조회**: Notion DB에서 `웹 게시=발행됨` 글을 카드 그리드로 노출
- **F002 글 상세 렌더링**: Notion 페이지 블록을 HTML로 변환해 본문 표시
- **F003 카테고리 필터링**: Notion `분류` select 옵션을 카테고리 메뉴로 동기화 (인덱스 + 상세)
- **F004 글 검색**: 제목/태그 부분 일치 검색 결과 페이지 제공
- **F010~F014 지원 기능**: 반응형 레이아웃, 글로벌 헤더, 태그 칩, 빈/에러/로딩 상태, SEO 메타데이터

**v2 비기획자 친화 기능**

- **F015 비기획자 진입 큐레이션**: HERO + "처음 오셨나요?"(`추천 순위` 1~3) + "관심사로 골라보기"(페르소나별 정적 매핑)
- **F016 TL;DR 자동 추출**: `# 0. 한 줄 정의` → 첫 quote → `요약` 속성 → 본문 50자 fallback (placeholder fall-through)
- **F017 작성 패턴 자동 변환**: callout 블록(💡) → 인트로 박스, 표 셀 `[확정]/[임시]` → 색상 배지, `# N. 미결 사항` → 접힘 토글
- **F018 연동 문서 → 추천 카드**: `# N. 연동 문서` 섹션의 페이지 멘션을 카드 그리드로 변환 (비공개 멘션 숨김, 0개면 영역 숨김, `unstable_cache` 메모이즈)
- **F019 읽기 메타 + 동일 분류 추천**: 글 상세에만 읽기 시간(분당 500자), 독자 수준 칩, 같은 분류 글 3건 자동 추천 (LIMIT 4 후 클라이언트 후처리)

핵심 전략은 **Next.js 15.5.3 App Router + ISR(`revalidate` 60초)** 기반 서버 컴포넌트 우선 렌더링이며, 검색 페이지만 동적 처리합니다.

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - `/docs/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-deps-and-typography.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **Notion API 연동 및 비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP E2E 시나리오 작성)**
   - 예시를 위해 `/docs/tasks` 디렉토리의 마지막 완료된 작업 참조 (예: 현재 `006`이라면 `005`/`004`를 참고)
   - 새 작업 파일은 빈 박스(`- [ ]`)와 변경 사항 요약 미작성 상태로 시작

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **Notion API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
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
- ✅ `src/lib/env.ts`에 Notion 환경 변수 Zod 스키마 정의 (`NOTION_TOKEN`, `NOTION_DATABASE_ID`, `NEXT_PUBLIC_SITE_URL`)
- ✅ `.env.local.example` 추가
- ✅ shadcn/ui, theme provider, Container 등 인프라 보존

---

### Phase 1: 애플리케이션 골격 구축

라우트 구조와 빈 페이지 셸, 도메인 타입을 우선 확보하는 단계입니다. UI/데이터 작업이 병렬로 진행될 수 있도록 골격부터 완성합니다.

- **Task 001: 의존성 설치 및 타이포그래피 설정** - 우선순위
  - `@notionhq/client` 설치 (Notion 공식 SDK)
  - `@tailwindcss/typography` 설치 및 `globals.css`/`prose` 클래스 설정
  - 블록 변환 유틸 후보(`notion-to-md` 또는 자체 매핑) 선택 및 설치
  - `package.json` 스크립트(`check-all`)에 새 의존성 영향 없는지 확인
  - 산출물: 새 의존성이 반영된 `package.json` / `package-lock.json`, `prose` 적용 가능한 `globals.css`

- **Task 002: 라우트 구조 및 빈 페이지 셸 생성**
  - `/` 홈 페이지(이미 존재) 골격 정리
  - `/categories` 카테고리 인덱스 페이지 셸 추가
  - `/categories/[slug]` 카테고리 상세 페이지 셸 추가
  - `/search` 검색 결과 페이지 셸 추가 (`?q=` 쿼리 수신)
  - `/posts/[slug]` 글 상세 페이지 셸 추가
  - 공통 레이아웃에 헤더/푸터가 모든 라우트에 적용되는지 검증
  - 산출물: 모든 페이지가 404 없이 빈 화면이라도 라우팅되는 상태

- **Task 003: 도메인 타입, Zod 스키마, 큐레이션 모듈 정의 (v2 확장)**
  - `src/types/post.ts` 에 `Post`(id/slug/title/summary?/category/tags/publishedAt/**publication**/coverImage?/**readerLevel?**/**recommendOrder?**), `PostContent`, `Category`, `NotionBlock`, `PostCardProps = Pick<Post, ...>` 정의
  - **영문 키 명명 규칙**: `Post.publication`(`status` 아님 — Notion 한글 `상태` status 타입 속성과의 인지 오류 방지)
  - `src/lib/notion/schemas.ts` 에 Notion 응답 정규화 Zod 스키마 정의 — **한글 속성** `항목`/`분류`/`태그`/`발행일`/`웹 게시`/`요약`/`독자 수준`/`추천 순위` 매핑. 상단 한글 주석으로 가정 property 이름 명시
  - 검색 쿼리 파라미터(`SearchParams`) 타입과 Zod 검증 스키마(`q.trim().min(1).max(200)`) 정의
  - **신규 `src/lib/site-config.ts`**: HERO Logline, 사이트 기본 메타데이터 등 정적 상수 단일 소스
  - **신규 `src/lib/notion/persona-curation.ts`**: 5개 페르소나(아티스트/사운드/외부 프로그래머/마케터/외부) ↔ 분류 묶음 정적 매핑 (서로 다른 분류 묶음 보장 — PRD 페르소나별 진입 시나리오 표 참조)
  - **사용자 사전 작업 의존성**: Notion DB에 6개 속성(`웹 게시`/`발행일`/`태그`/`요약`/`독자 수준`/`추천 순위`)이 추가되어 있어야 함. Phase 1 시작 전 사용자가 Notion에서 직접 추가
  - 산출물: 데이터 레이어/UI가 공유할 단일 타입 소스 + 큐레이션 정적 모듈 2개

---

### Phase 2: 데이터 레이어 (Notion 연동)

Notion API 호출, 정규화, 캐시 정책을 한 번에 정리합니다. UI보다 우선해 처리해야 더미가 아닌 실데이터 흐름을 빠르게 검증할 수 있습니다.

- **Task 004: Notion 클라이언트 및 환경 변수 가드 구현**
  - `src/lib/notion/client.ts` 에 싱글톤 Notion 클라이언트 생성 (서버 전용 모듈 표시)
  - `NOTION_TOKEN` / `NOTION_DATABASE_ID` 미설정 시 친절한 에러 메시지를 던지는 가드 함수 추가
  - 모든 데이터 접근 함수가 동일한 클라이언트를 통해 호출되도록 일원화
  - 로컬 `.env.local` 작성 가이드 보강 (`.env.local.example` 코멘트 정리)
  - 산출물: 어디서든 호출 가능한 안전한 Notion 클라이언트 모듈

- **Task 005: 글 목록/상세 조회 함수 구현 (F001/F002/F015/F019)**
  - `getPublishedPosts()` 구현: `웹 게시 === '발행됨'` 필터 + `발행일` 내림차순 정렬 (`발행일` 미설정 시 `최종 편집 일시` fallback)
  - `getPostBySlug(slug)` 구현: 페이지 메타와 `blocks.children.list` 호출 후 정규화
  - `getCategories()` 구현: 단일 query로 모든 발행 글 fetch 후 메모리에서 분류별 글 수 집계 (17개 분류 분할 query 회피)
  - **신규 `getRecommendedPosts(limit)`**: F015 "처음 오셨나요?" — `웹 게시 == '발행됨' AND 추천 순위 between 1 and 3` + 추천 순위 오름차순 + 동률 시 발행일 내림차순
  - **신규 `getRelatedPostsByCategory(category, currentId, limit)`**: F019 동일 분류 추천 — `LIMIT (limit+1)` fetch 후 서버 측에서 `currentId` 제외, 최대 `limit`건 반환
  - `revalidate = 60` ISR 설정을 데이터 페치 함수 단위에 부여 (`fetch` 캐시 옵션 또는 `unstable_cache`)
  - Notion 페이지 ID 기반 `slug` 생성 헬퍼 작성
  - **Playwright MCP 테스트**: `/posts/[slug]` 라우트에 임시 페이지를 띄워 정규화 결과 노출 확인

- **Task 006: Notion 블록 → HTML 변환 + 작성 패턴 자동 변환 (F002/F016/F017/F018/F019)**
  - 지원 블록: `paragraph`, `heading_1~3`, `bulleted_list_item`, `numbered_list_item`, `image`, `code`, `quote`, `divider`, `table`+`table_row`, `toggle`, `callout`
  - 텍스트 어노테이션(볼드/이탤릭/코드/링크) 처리
  - 이미지 블록 → `next/image` 호환 컴포넌트 출력 (커버 이미지 포함)
  - 토글 블록 → 사이트에서도 접힘/펼침 유지 (기본 접힘)
  - 미지원 블록은 콘솔 경고 + 안전한 fallback 렌더링
  - **신규 공통 유틸 `extractSectionsByHeading(blocks, predicate)`**: heading_1 패턴 매칭 → 다음 heading 직전까지 블록 그룹화 (F016/F017/F018에서 공유)
  - **F016 TL;DR 추출 유틸 `extractTldr(blocks, summary)`**: 4단계 우선순위(`# 0. 한 줄 정의` → 첫 quote → `요약` 속성 → 본문 50자), 각 단계에서 placeholder(`✏️ [작성 필요]`/`[TBD]`/`[작성중]`) 패턴이면 다음 단계로 fall-through
  - **F017 작성 패턴 변환**: ① callout 블록(`block.callout.icon.emoji === '💡'`) → 파란 인트로 박스 ② `table_row.cells`의 rich_text plain_text에서 `[확정]`/`[임시]` 매칭 → 색상 배지(split-replace, `Badge` 컴포넌트는 `not-prose`/shadcn 활용) ③ `# N. 미결 사항` 섹션 → `Collapsible` 기본 접힘
  - **F018 연동 문서 카드 변환**: `# N. 연동 문서` 섹션의 페이지 멘션을 추출. 각 멘션 페이지의 메타(제목/분류/요약)를 별도 fetch — **`unstable_cache` 또는 React 19 `cache()`로 메모이즈하여 N+1 + Notion 3 req/s rate limit burst 방지**. `웹 게시 != 발행됨`인 멘션은 카드에서 숨김. 노출 가능 멘션 0개면 섹션 영역 자체 숨김
  - **F019 읽기 시간 계산 유틸 `calculateReadingTime(blocks)`**: 본문 블록을 평문으로 펼친 뒤 글자 수 ÷ 500 (한국어 분당, 최소 1분)
  - 산출물: `src/lib/notion/render-blocks.tsx` + `src/lib/notion/section-utils.ts` + `src/lib/notion/tldr-extractor.ts` + `src/lib/notion/reading-time.ts`

- **Task 007: 카테고리/검색 데이터 함수 구현 (F003/F004)**
  - `getPostsByCategory(slug)` 구현: 카테고리 슬러그 매칭 + 발행일 내림차순
  - `searchPosts(query)` 구현: 제목/태그 부분 일치(소문자 정규화)
  - 카테고리/검색 결과의 캐시 전략 결정 (카테고리는 ISR, 검색은 동적 처리)
  - 빈 결과/에러를 호출부가 구분할 수 있도록 결과 타입 정리(`{ posts, error }`)
  - **Playwright MCP 테스트**: 카테고리 슬러그 변경 및 검색어 입력 시 결과 차이 확인

---

### Phase 3: 공통 UI 컴포넌트

데이터 레이어 위에서 재사용될 컴포넌트를 한 번에 만들어 페이지 구현 속도를 끌어올립니다.

- **Task 008: 글 카드 및 상태 컴포넌트 (F010/F012/F013/F019 일부)**
  - `PostCard`: 제목, 분류 배지(이모지 포함), 태그 칩, 발행일, 본문 요약, 호버 강조, **독자 수준 칩(F019, 미설정 시 미노출)** — **읽기 시간은 카드 미노출**(글 상세에만)
  - `PostCardGrid`: 데스크톱 3열 / 태블릿 2열 / 모바일 1열 반응형 그리드
  - `EmptyState`: "아직 등록된 글이 없어요" 등 상황별 메시지 + CTA
  - `ErrorState`: Notion API 실패 시 안내 + 홈/재시도 버튼
  - `LoadingSkeleton`: shadcn `Skeleton` 기반 카드/상세 로딩 UI
  - **신규 `RecommendCard`**(F015 "처음 오셨나요?"용): 더 큰 카드 사이즈, 추천 순위 배지
  - **신규 `PersonaCard`**(F015 "관심사로 골라보기"용): 페르소나 이름/이모지 + 분류 묶음 표시
  - 산출물: `src/components/posts/*` 하위에 정리된 재사용 컴포넌트군

- **Task 009: 헤더 검색바 및 카테고리 메뉴 동적화 (F003/F004/F011)**
  - 헤더에 RHF 기반 검색 입력 폼 추가 (엔터/버튼 → `/search?q=`)
  - 모바일 시트에 검색 입력 동선 추가
  - `getCategories()` 결과를 헤더 카테고리 드롭다운/탭에 주입 (서버 컴포넌트 → 클라이언트 props 전달)
  - 푸터의 카테고리 빠른 링크도 동일 데이터 소스 사용
  - **Playwright MCP 테스트**: 검색 입력→결과 페이지 이동, 카테고리 메뉴 클릭→해당 페이지 이동 시나리오

---

### Phase 4: 페이지별 구현

데이터 레이어와 공통 컴포넌트를 조립해 4개 페이지를 완성합니다.

- **Task 010: 홈 페이지 구현 (F001/F010/F012/F013/F015/F019)**
  - 서버 컴포넌트에서 데이터 페치 4종 병렬: `getPublishedPosts()` + `getRecommendedPosts(3)` + `persona-curation` 정적 매핑
  - **HERO 영역 (F015)**: `src/lib/site-config.ts`의 Logline + 분위기 카피 정적 노출
  - **처음 오셨나요? 섹션 (F015)**: `RecommendCard` 3개 자동 노출 (추천 순위 1~3)
  - **관심사로 골라보기 섹션 (F015)**: 5개 `PersonaCard` (서로 다른 분류 묶음 보장)
  - **최근 글 카드 그리드 (F001)**: `PostCardGrid` 렌더링
  - 빈/에러/로딩 상태 컴포넌트 연결
  - 카드 클릭 시 `/posts/[slug]` 라우팅 동작 확인
  - **Playwright MCP 테스트**: 홈 → HERO/추천/페르소나/최근 글 4개 섹션 표시 → 각 카드 클릭 → 상세 동선 무오류 검증

- **Task 011: 카테고리 페이지 구현 (F001/F003/F010/F012/F013)**
  - `/categories` 인덱스: 카테고리 카드/리스트 + 글 수 표시
  - `/categories/[slug]`: 선택 카테고리 강조 탭 + `PostCardGrid`
  - 빈 카테고리 안내(`EmptyState`) 노출 정책 적용
  - 글 카드 카테고리 배지 클릭 시 동일 페이지로 이동하도록 라우팅 연결
  - **Playwright MCP 테스트**: 카테고리 메뉴 → 카테고리 상세 → 글 상세 동선 검증

- **Task 012: 검색 결과 페이지 구현 (F001/F004/F010/F012/F013)**
  - `?q=` 쿼리 파라미터 → `searchPosts()` 호출
  - "'쿼리'에 대한 N건" 헤드라인 표시
  - 결과 없음 상태에서 카테고리 탐색 유도 CTA 노출
  - 페이지 자체는 동적 렌더링(`dynamic = 'force-dynamic'` 또는 `searchParams` 사용) 보장
  - **Playwright MCP 테스트**: 검색어 입력 → 결과 노출 / 결과 없음 상태 전환 검증

- **Task 013: 글 상세 페이지 구현 (F002/F010/F012/F013/F014/F016/F017/F018/F019)**
  - 슬러그로 메타+본문 조회 후 헤더(제목/발행일/분류 배지/태그/**읽기 시간**(F019)/**독자 수준 칩**(F019, 미설정 시 미노출)) 렌더링
  - **TL;DR 강조 박스 (F016)**: `extractTldr(blocks, summary)` 결과를 본문 상단에 회색 배경 박스로 노출 (4단계 우선순위 + placeholder fall-through)
  - **본문 렌더링 (F002 + F017)**: `render-blocks.tsx`로 Notion 블록 → HTML 변환, `prose` 적용. 변환 시 callout(💡) → 인트로 박스, `[확정]/[임시]` → 배지, `# N. 미결 사항` → 접힘 토글 자동 적용
  - **연동 문서 카드 그리드 (F018)**: `# N. 연동 문서` 섹션 추출 → 멘션 페이지 메타 fetch(메모이즈) → 비공개 멘션 필터링 → 카드 그리드. 노출 가능 멘션 0개면 영역 자체 숨김
  - **동일 분류 추천 3건 (F019)**: `getRelatedPostsByCategory(category, currentId, 3)` 호출 후 `PostCardGrid` 렌더
  - 본문 가독성: 모바일 16px 이상 / 키보드 포커스 스타일 / 명도 대비 확보
  - 본문 로딩 실패 시 `ErrorState` + 홈 이동 버튼
  - `generateMetadata`로 글 제목/요약 기반 SEO 태그 생성 (F014)
  - OpenGraph/Twitter 카드용 절대 URL은 `NEXT_PUBLIC_SITE_URL` 사용
  - **Playwright MCP 테스트**: 카드 클릭 → TL;DR 박스 + 본문 변환(💡/배지/미결 토글) + 연동 문서 카드 + 동일 분류 추천 모두 노출 확인. 잘못된 슬러그 시 에러 UI. OG 메타 태그 확인

---

### Phase 5: SEO/접근성/마무리

핵심 동선이 완성된 후, 외부 공유 품질과 비기능 요구사항을 일괄 점검합니다.

- **Task 014: SEO 메타데이터 일괄 정비 (F014)**
  - 루트 `metadata` 정리: 사이트 기본 타이틀 템플릿, OG 기본값, twitter 카드 설정
  - 홈/카테고리/검색/상세 각 페이지의 `generateMetadata` 정합성 점검
  - `robots.txt`, 기본 `sitemap.ts`(MVP 범위 내 정적 경로) 작성 검토
  - 산출물: 외부 공유 시 미리보기 정상 표시되는 메타 구조

- **Task 015: 접근성/가독성 점검**
  - 시맨틱 마크업(`header`, `main`, `nav`, `article`) 사용 여부 점검
  - 키보드 포커스 스타일 일관성 확인 (헤더, 카드, 링크)
  - 본문 명도 대비(라이트/다크) 4.5:1 이상 검증
  - 헤더의 검색 입력/카테고리 메뉴 대체 텍스트(`aria-*`) 정리

- **Task 016: 캐시·에러 안전성 검증**
  - Notion API 실패 케이스 시뮬레이션(토큰 무효, DB 미설정) 후 UI 동작 확인
  - ISR 60초 동작 확인: 빌드 후 발행 상태 토글 → 60초 이내 반영 측정
  - 콘솔 로깅이 사용자에게 노출되지 않는지 점검
  - **Playwright MCP 테스트**: 에러 상태 강제 재현(잘못된 환경 변수)에서 크래시 없이 안내 노출

- **Task 017: 성능/품질 게이트 통과**
  - `npm run check-all` (typecheck + lint + format) 통과
  - `npm run build` (Turbopack) 성공
  - Lighthouse Performance 모바일/데스크톱 85점 이상 측정 (홈/카테고리/상세)
  - 핵심 동선(홈→상세, 카테고리→상세, 검색→상세) Playwright MCP 회귀 테스트 1회
  - 산출물: 측정 결과 스크린샷/요약을 작업 파일 변경 사항에 첨부

- **Task 018: 배포 준비 및 운영 가이드**
  - Vercel 환경 변수 등록 가이드 작성 (`docs/guides/deployment.md` 가능)
  - Notion 통합 권한/데이터베이스 공유 절차 문서화
  - 60초 반영 확인 절차 및 캐시 무효화(재배포) 가이드 정리
  - 운영 중 발생 가능한 트러블슈팅 항목 짧게 정리

---

## 마일스톤 및 검증 지표

PRD의 성공 지표를 단계별 검증 항목으로 매핑합니다.

| 마일스톤                 | 완료 기준                                           | 측정 방법                           | 관련 PRD 지표                      |
| ------------------------ | --------------------------------------------------- | ----------------------------------- | ---------------------------------- |
| **M1. 골격 완료**        | 모든 페이지가 404 없이 라우팅 + 헤더/푸터 일관 표시 | 수동 라우팅 점검                    | 사용자 여정 1~3 가능               |
| **M2. 데이터 흐름 확립** | Notion 발행 글 1건이 홈/상세에 노출                 | Playwright MCP 시나리오             | F001/F002                          |
| **M3. 핵심 동선 무오류** | 홈→상세, 카테고리→상세, 검색→상세 모두 정상         | Playwright MCP 회귀                 | "핵심 동선 전부 무오류 동작"       |
| **M4. 60초 반영 검증**   | Notion 글 토글 후 60초 이내 사이트 반영             | 수동 시간 측정                      | "60초 이내 사이트 반영"            |
| **M5. 외부 공유 품질**   | 글 상세 링크의 OG 미리보기에 제목/요약 정상 노출    | 카카오톡/슬랙/디스코드 미리보기     | "외부 공유 시 제목/요약 정상"      |
| **M6. Lighthouse 85+**   | 모바일/데스크톱 Performance 85점 이상               | Lighthouse(홈/카테고리/상세 각 1회) | "Lighthouse Performance 85점 이상" |

---

## MVP 이후 (제외 항목)

PRD에 따라 MVP 범위에서 제외하며, 향후 우선순위만 정리합니다.

- 회원가입/로그인 등 인증 기능 (사이트는 공개 읽기 전용)
- 댓글, 좋아요, 북마크 등 사용자 상호작용
- 다크모드/폰트 크기 조절 등 사용자 설정 (현재 시스템 테마 토글 수준만 유지)
- 글 작성/편집 UI (작성은 Notion에서만)
- 다국어 지원, RSS, 사이트맵 자동화
- 조회수/방문자 분석 대시보드 (Vercel Analytics 정도만 활용)

---

## 1인 개발 운영 원칙

- **Phase 진입 시 한 번에 한 Task만 작성**: 작업 폭증을 막기 위해 다음 Task 파일은 직전 Task 완료 시점에 만든다.
- **데이터 레이어가 흔들리면 UI 단독 진행 금지**: Phase 2가 깨지면 Phase 4 Task는 보류한다.
- **검증은 Playwright MCP 우선**: API/비즈니스 로직 변경 후 수동 클릭 대신 시나리오 1개라도 자동화한다.
- **무리한 일정 산정 금지**: Phase 단위 완료가 곧 마일스톤. 시간 박스가 아닌 체크리스트 기반으로 진행한다.
- **`.env.local`/시크릿은 절대 커밋 금지**: `.env.local.example`만 동기화한다.
