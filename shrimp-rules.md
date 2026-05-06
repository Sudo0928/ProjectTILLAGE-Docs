# Development Guidelines (ProjectTILLAGE-Docs)

> 본 문서는 **AI Coding Agent 전용 운영 규약**이다. 일반 개발 지식·튜토리얼은 포함하지 않는다.
> 기능/일정 컨텍스트는 `docs/PRD.md`, `docs/ROADMAP.md`를 참조한다.

---

## 1. 프로젝트 개요

- **본질**: Notion 기반 **공개 읽기 전용** 문서 발행 사이트 (1인 개발 MVP)
- **데이터 소스**: Notion API 단독 — 자체 DB 없음, 쓰기 경로 없음
- **렌더링 전략**: 서버 컴포넌트 + ISR(`revalidate = 60`) 기본, **검색 페이지만 동적**
- **사용자 언어**: 한국어 (`<html lang="ko">`)
- **배포**: Vercel
- **OS**: Windows 11 (`.claude/hooks/*.sh`는 Git Bash가 PATH에 있어야 동작)

---

## 2. 디렉토리 책임 분리

| 경로                          | 책임                                                                | 직접 수정 가능                                 |
| ----------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| `src/app/`                    | App Router 라우트, 페이지, 레이아웃 (서버 컴포넌트 기본)            | YES                                            |
| `src/components/ui/`          | shadcn/ui 원본 컴포넌트                                             | **NO** — `npx shadcn@latest add`로만 추가/갱신 |
| `src/components/layout/`      | `Container`, `Header`, `Footer`                                     | YES                                            |
| `src/components/navigation/`  | `MainNav`, `MobileNav` (★ 동기화 규칙 9.1 참조)                     | YES                                            |
| `src/components/providers/`   | `ThemeProvider` 등 클라이언트 프로바이더                            | YES                                            |
| `src/components/posts/`       | 글 카드/그리드/상태 (Phase 3에서 생성 예정)                         | YES                                            |
| `src/lib/notion/`             | Notion 클라이언트, 데이터 함수, 블록 렌더러 (Phase 2에서 생성 예정) | YES — **서버 전용**                            |
| `src/lib/env.ts`              | Zod 기반 환경 변수 단일 진입점                                      | YES                                            |
| `src/lib/utils.ts`            | `cn()` 헬퍼만 보유                                                  | YES                                            |
| `src/types/`                  | 도메인 타입 (Phase 1에서 생성 예정)                                 | YES                                            |
| `docs/`                       | PRD/ROADMAP/가이드 — AI 참조용                                      | YES                                            |
| `docs/tasks/`                 | Task 명세 (`XXX-description.md`)                                    | YES                                            |
| `.claude/hooks/`              | Slack 알림 훅 — exit 0 보장 필수 (10번 항목)                        | 조건부                                         |
| `.claude/settings.local.json` | Claude Code 권한 설정                                               | **NO** — Self-Modification 차단됨              |
| `.mcp.json`                   | MCP 서버 등록                                                       | YES (3절 환경 특수 사항 참조)                  |
| `shrimp_data/`                | shrimp-task-manager 영속 데이터                                     | NO — MCP 서버 자동 관리                        |

---

## 3. Path Alias 규칙

- 모든 cross-directory import는 `@/*` (= `src/*`) alias **필수**
- 동일 디렉토리 내부에서만 상대 경로(`./xxx`) 허용

```ts
// DO
import { Container } from '@/components/layout/container'
import { cn } from '@/lib/utils'

// DON'T
import { Container } from '../../components/layout/container'
import { cn } from '../../lib/utils'
```

---

## 4. 코드 포맷 — Prettier 강제 항목

`.prettierrc` 위반 시 lint-staged(Husky)가 차단한다.

| 항목          | 값      | DON'T                    | DO                         |
| ------------- | ------- | ------------------------ | -------------------------- |
| 세미콜론      | 없음    | `const x = 1;`           | `const x = 1`              |
| 따옴표        | 단일    | `import "x"`             | `import 'x'`               |
| 들여쓰기      | space 2 | tab / 4 spaces           | 2 spaces                   |
| 줄바꿈        | LF      | CRLF                     | LF                         |
| trailingComma | es5     | 함수 인자 trailing comma | 객체/배열만 trailing comma |
| arrowParens   | avoid   | `(x) => x`               | `x => x`                   |
| printWidth    | 80      | 한 줄 100자              | 80자 이내                  |

추가 강제:

- TypeScript `strict: true` — `as` 캐스팅으로 타입 오류 회피 금지
- 사용자 노출 문자열은 **한국어**

---

## 5. Notion 연동 규칙 (★ 핵심)

### 5.1 환경 변수 접근 — 단일 진입점

```ts
// DO
import { env } from '@/lib/env'
const token = env.NOTION_TOKEN

// DON'T — Zod 검증 우회
const token = process.env.NOTION_TOKEN
```

### 5.2 발행 상태 필터 — 모든 조회 함수에 필수

- **모든 글 조회 함수는 Notion property `Status === '발행됨'`로 필터링**
- `초안` 상태는 어떤 경로에서도 사용자에게 노출 금지
- 검색/카테고리 함수도 동일 필터 적용

### 5.3 캐시 전략 분기

| 페이지                              | 전략     | 코드                                                              |
| ----------------------------------- | -------- | ----------------------------------------------------------------- |
| `/` 홈                              | ISR 60s  | `export const revalidate = 60`                                    |
| `/categories`, `/categories/[slug]` | ISR 60s  | `export const revalidate = 60`                                    |
| `/posts/[slug]` 글 상세             | ISR 60s  | `export const revalidate = 60`                                    |
| `/search` 검색 결과                 | **동적** | `export const dynamic = 'force-dynamic'` 또는 `searchParams` 사용 |

### 5.4 클라이언트/서버 경계

- Notion SDK(`@notionhq/client`) import는 **서버 컴포넌트 / Route Handler / Server Action**에서만
- `'use client'` 파일 안에서 `@notionhq/client` import 금지
- `NOTION_TOKEN`을 `NEXT_PUBLIC_*` 접두사로 노출 금지

### 5.5 Notion 함수 작성 위치 및 형태

- 위치: `src/lib/notion/` 하위 (`client.ts`, `posts.ts`, `categories.ts`)
- 환경 변수 미설정 시: 친절한 한국어 에러 메시지 throw, **빌드 차단 금지** (`env.ts`가 optional로 처리)
- 응답은 `src/types/post.ts`의 `Post` / `PostContent` / `Category` 타입으로 정규화
- 결과 타입에 `{ posts, error }` 또는 명시적 fallback 포함하여 빈 결과/실패를 호출부가 구분 가능하게

---

## 6. UI 컴포넌트 작성 규칙

### 6.1 shadcn/ui 컴포넌트

- `src/components/ui/*` 파일 **직접 수정 금지**
- 추가는 반드시 `npx shadcn@latest add <name>` CLI로
- 추가 전에 **MCP 흐름**으로 검증:
  1. `mcp__shadcn__list_items_in_registries` 또는 `search_items_in_registries`
  2. `mcp__shadcn__view_items_in_registries` (사용 가능 여부/의존성 확인)
  3. `mcp__shadcn__get_add_command_for_items` (정확한 명령 획득)
- 설정(`components.json`): `style: new-york`, `baseColor: neutral`, `iconLibrary: lucide`

### 6.2 레이아웃 컨테이너

- 모든 페이지 본문은 `<Container>`로 감싼다 (`@/components/layout/container`)
- `Container.size`: `sm | md | lg | xl | full` (기본 `lg`)
- 페이지에 `max-w-*` 클래스 직접 사용 금지 — `Container` 사용

### 6.3 클래스 결합

```tsx
// DO
import { cn } from '@/lib/utils'
<div className={cn('text-sm', isActive && 'font-bold')} />

// DON'T — Tailwind merge 충돌 위험
<div className={`text-sm ${isActive ? 'font-bold' : ''}`} />
```

### 6.4 아이콘

- `lucide-react`만 사용 (`next.config.ts`의 `optimizePackageImports`로 트리쉐이킹됨)
- 다른 아이콘 라이브러리 추가 금지

### 6.5 사용자 노출 문자열

- 한국어 필수 (페이지 제목, 버튼, 에러 메시지 등 모두)
- 코드 내부 식별자(변수/함수명)는 영문 camelCase

---

## 7. 페이지 라우팅 규칙

### 7.1 MVP 라우트 표

| URL                  | 파일 위치                            | 렌더링   | 관련 PRD 기능                |
| -------------------- | ------------------------------------ | -------- | ---------------------------- |
| `/`                  | `src/app/page.tsx`                   | ISR      | F001, F010, F011, F012, F013 |
| `/categories`        | `src/app/categories/page.tsx`        | ISR      | F003, F010, F011             |
| `/categories/[slug]` | `src/app/categories/[slug]/page.tsx` | ISR      | F001, F003, F010-F013        |
| `/search`            | `src/app/search/page.tsx`            | **동적** | F001, F004, F010-F013        |
| `/posts/[slug]`      | `src/app/posts/[slug]/page.tsx`      | ISR      | F002, F010-F014              |

### 7.2 MVP 외 라우트 — **추가 금지**

PRD "MVP 이후 (제외)"에 해당하는 라우트는 어떤 경우에도 추가하지 않는다:

- `/login`, `/signup`, `/auth/*` — 인증 (사이트는 공개 읽기 전용)
- `/admin/*`, `/edit`, `/new`, `/posts/[slug]/edit` — 작성/편집 UI (작성은 Notion에서만)
- `/api/comments/*`, `/api/likes/*`, `/api/bookmarks/*` — 사용자 상호작용
- `/[locale]/*`, `/en/*`, `/ja/*` — 다국어
- `/rss.xml`, `/sitemap-dynamic.xml` (자동화 형태) — RSS / 사이트맵 자동화

추가가 필요하다고 판단되면 **PRD 갱신을 선행**한 뒤에만 진행.

### 7.3 새 라우트 추가 시 동시 수정 항목

새 공개 페이지 추가는 단일 PR에서 다음을 모두 갱신:

1. `src/app/<route>/page.tsx` 생성
2. 메뉴 노출이 필요하면 `main-nav.tsx` + `mobile-nav.tsx` 양쪽의 `navItems` 동기화 (9.1 참조)
3. `docs/ROADMAP.md` Task 체크박스 업데이트
4. PRD 범위 외 라우트라면 PRD 선행 갱신

---

## 8. Form / 검증 규칙

- 폼 처리: **React Hook Form** + Zod resolver(`@hookform/resolvers`) 조합 강제
- 검색 입력은 `Header` 내부 RHF 폼 형태로 통합 (Phase 3, Task 009)
- 검증 실패 메시지는 한국어
- Zod 스키마는 데이터 함수와 동일 위치(`src/lib/<feature>/schemas.ts` 또는 `src/types/`)에 정의

---

## 9. 다중 파일 협업 규칙 (Multi-file Coordination)

### 9.1 ★ 네비게이션 동기화 (가장 자주 누락되는 항목)

**`main-nav.tsx`(데스크톱)와 `mobile-nav.tsx`(모바일)는 동일한 `navItems` 배열을 가져야 한다.**

새 메뉴 추가/삭제/순서 변경 시 **두 파일 동시 수정 필수**. 한쪽만 수정하면 데스크톱/모바일 메뉴가 어긋난다.

| 파일                                       | 메뉴 정의 위치             |
| ------------------------------------------ | -------------------------- |
| `src/components/navigation/main-nav.tsx`   | `navItems: NavItem[]` 상수 |
| `src/components/navigation/mobile-nav.tsx` | `navItems` 상수            |

### 9.2 의존성 변경 (`package.json`)

`dependencies` 추가/제거/메이저 업그레이드 시 다음을 함께 갱신:

1. `package.json` (소스)
2. `README.md` "기술 스택" 섹션
3. `CLAUDE.md` "🛠️ 핵심 기술 스택" 섹션
4. `docs/PRD.md` "기술 스택" 섹션
5. `docs/ROADMAP.md` 해당 Phase Task에 ✅ 또는 신규 Task 추가

### 9.3 환경 변수 변경

새 환경 변수 추가/제거 시 다음을 함께 갱신:

1. `src/lib/env.ts`의 `envSchema`
2. `.env.local.example` 항목
3. `README.md` "환경 변수 설정" 표
4. `docs/PRD.md` "환경 변수" 표
5. (해당되면) `CLAUDE.md` "Notion 연동" 섹션

### 9.4 MVP 범위 변경

PRD 기능 ID(F001~F014) 추가/제거/변경 시 다음을 함께 갱신:

1. `docs/PRD.md` "기능 명세" 표
2. `docs/PRD.md` "페이지별 상세 기능" 표 (구현 기능 라인)
3. `docs/PRD.md` 정합성 검증 결과 섹션
4. `docs/ROADMAP.md` 해당 Phase Task
5. `CLAUDE.md` "MVP 범위" / "MVP 제외" 섹션
6. `README.md` "핵심 기능 (MVP)" 섹션

### 9.5 Slack 알림 훅 변경

`.claude/hooks/_lib/slack-notify.mjs` 알림 타입 추가 시:

1. `slack-notify.mjs`의 `buildBlocks` 함수에 새 type 분기 추가
2. 해당 type의 래퍼 셸(`.claude/hooks/<type>-hook.sh`) 추가 — exit 0 보장 (10번 항목)
3. 훅 등록 (`.claude/settings.local.json` `hooks` 블록) — Claude Code가 자동 추가하므로 직접 편집 금지

---

## 10. AI Agent 의사결정 기준

### 10.1 라이브러리/SDK 사용법 질의

- DO: **`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`** 순서로 최신 문서 조회 (글로벌 룰 강제)
- 만족스럽지 않으면 동일 호출에 `researchMode: true` 한 번 더
- DON'T: 학습 데이터에 의존해 추측

### 10.2 shadcn 컴포넌트 추가

- DO: 6.1의 MCP 흐름(list/search → view → get_add_command) 강제
- DON'T: 컴포넌트 이름 추측해서 `npx shadcn add` 실행 (잘못된 이름이면 무관 컴포넌트가 추가됨)

### 10.3 데이터 페치 결정 트리

```
사용자 입력에 따라 결과가 매번 달라지는가?
├─ YES → 동적 렌더링 (searchParams 또는 dynamic = 'force-dynamic')
└─ NO  → 서버 컴포넌트 + ISR (revalidate = 60)
```

### 10.4 UI 변경 검증

- DO: `npm run dev` + Playwright MCP(`mcp__playwright__*`)로 브라우저 확인
- DO: `npm run check-all` 통과 확인
- DON'T: 타입체크/린트만 보고 "완료" 보고 (UX 회귀를 놓침)

### 10.5 우선순위/중단 기준

| 상황                                 | 행동                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| Phase 2(Notion 연동)가 깨짐          | Phase 4(페이지) 작업 즉시 보류                                |
| 한 번에 여러 Task 동시 작성 요구     | 거부 — Task 1개만 작성 (ROADMAP 운영 원칙)                    |
| ESLint 오류                          | 무시 금지 — `npm run lint:fix` 시도 후 수동 수정              |
| TypeScript 오류                      | `as` 캐스팅 회피 금지 — 타입 정의를 수정                      |
| Notion API 실패                      | UI 안내 노출 + 콘솔 로깅; 크래시/빌드 차단 금지               |
| `.env.local` 미생성                  | 친절한 에러 메시지 가드; 빌드 자체는 통과 (env optional 정책) |
| 사용자가 destructive git 명령 미요청 | 절대 실행 금지 (force push, reset --hard 등)                  |

---

## 11. 절대 금지 사항 (Prohibited Actions)

| #   | 금지 행위                                                     | 이유                                                        |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | `.claude/settings.local.json` 직접 편집                       | Claude Code가 자동 관리; Self-Modification 차단됨           |
| 2   | `.env`, `.env.local` 커밋                                     | `.gitignore`에 차단되어 있으나 우회 시도 금지               |
| 3   | `git commit --no-verify`                                      | Husky pre-commit/lint-staged 우회 (사용자 명시 요청 시에만) |
| 4   | `git push --force` to `main`                                  | 메인 브랜치 강제 푸시                                       |
| 5   | `src/components/ui/*` 직접 수정                               | shadcn 업그레이드 시 충돌; CLI로만 갱신                     |
| 6   | `process.env.*` 직접 사용                                     | `@/lib/env`의 Zod 검증 회피                                 |
| 7   | `'use client'` 컴포넌트에서 `@notionhq/client` import         | 서버 토큰 노출 위험                                         |
| 8   | `NOTION_TOKEN`을 `NEXT_PUBLIC_*`로 노출                       | 보안 사고 — 즉시 키 폐기 필요                               |
| 9   | `Status=초안` Notion 페이지를 사용자에게 노출                 | PRD 위반                                                    |
| 10  | `slack-notify.mjs`의 `process.exitCode = 0` 보장 제거         | 알림 실패가 Claude 작업 흐름 차단                           |
| 11  | MVP 제외 기능(인증/댓글/작성/다국어/RSS) 라우트·컴포넌트 추가 | PRD 범위 위반 — PRD 선행 갱신 필요                          |
| 12  | 영문 사용자 노출 UI 문자열                                    | 사이트 언어는 한국어                                        |
| 13  | 페이지에 `max-w-*` 클래스 직접 사용                           | `Container` 사용 강제                                       |
| 14  | 클래스 결합에 문자열 템플릿(`` `${a} ${b}` ``)                | `cn()` 헬퍼로 일원화 (Tailwind merge 충돌)                  |
| 15  | `docs/PRD.md`/`CLAUDE.md` 미반영 신규 기능 추가               | 문서-코드 정합성 위반                                       |
| 16  | `main-nav.tsx`만 또는 `mobile-nav.tsx`만 단독 수정            | 9.1 동기화 규칙 위반                                        |
| 17  | `lucide-react` 외 아이콘 라이브러리 추가                      | 트리쉐이킹/번들 크기 정책 위반                              |
| 18  | `.claude/hooks/*.sh`을 PowerShell/CMD 문법으로 작성           | bash 의존; Git Bash 환경에서 실행됨                         |

---

## 12. 작업 흐름 통합

### 12.1 새 Task 시작 절차 (ROADMAP 워크플로우)

1. `docs/ROADMAP.md`에서 해당 Phase의 다음 미완료 Task 확인
2. `docs/tasks/XXX-description.md` 생성 (직전 완료 Task 파일을 참고)
3. 명세서 따라 코드 변경
4. **Notion API/비즈니스 로직 작업이라면 Playwright MCP 시나리오 1개 이상 작성·실행**
5. `npm run check-all` 통과 확인
6. Task 파일 체크박스 업데이트 + 변경 사항 요약 추가
7. `docs/ROADMAP.md`에 ✅ + `See: /docs/tasks/XXX-xxx.md` 참조 추가
8. 커밋 (12.2 규칙)

### 12.2 커밋 메시지 규칙

- 형식: `<이모지> <타입>: <설명>` (한국어)
- 첫 줄 72자 미만, 명령형 어조
- 주요 이모지: ✨ feat / 🐛 fix / 📝 docs / ♻️ refactor / 🔧 chore / 🎉 init / 🔥 remove
- 원자적 커밋 — 다른 관심사 섞기 금지
- **Claude 서명(`Co-Authored-By: Claude...`) 추가 금지**
- `.claude/settings.local.json` 자동 변경 라인은 unstage 처리 후 커밋

### 12.3 빌드/검증 명령

| 명령                | 용도                                               |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | 개발 서버 (Turbopack)                              |
| `npm run build`     | 프로덕션 빌드 (Turbopack)                          |
| `npm run check-all` | typecheck + lint + format:check (작업 완료 게이트) |
| `npm run lint:fix`  | ESLint 자동 수정                                   |
| `npm run format`    | Prettier 자동 포맷                                 |
| `npm run typecheck` | TypeScript noEmit 타입체크만                       |

---

## 13. 환경 특수 사항

### 13.1 Windows 11 + Bash hook 의존성

- `.claude/hooks/*.sh`는 bash로 동작 — Git Bash가 PATH에 있어야 함
- `endOfLine: lf` 강제(`.prettierrc`); CRLF 자동 변환 경고는 무시
- `.gitattributes`로 텍스트 파일 LF 정렬

### 13.2 `.mcp.json` 경로 주의

- `shrimp-task-manager`의 `args` 및 `DATA_DIR`이 macOS 형식(`/Users/duarl/...`)으로 작성됨
- Windows에서는 Node.js가 현재 드라이브(C:) 기준으로 해석하여 우연히 동작 중
- **다른 드라이브 또는 경로로 프로젝트 이동 시 깨질 수 있음** — 이동 시 `.mcp.json` 경로 재검증 필수
- 변경이 필요하면 macOS/Windows 양쪽에서 동작하는 절대 경로(`C:/...` 또는 `${workspaceFolder}` 변수)로 통일

### 13.3 활성 MCP 서버 우선순위

| MCP 서버              | 사용 시점                                  |
| --------------------- | ------------------------------------------ |
| `context7`            | 라이브러리/SDK/프레임워크 문서 조회 (10.1) |
| `shadcn`              | shadcn 컴포넌트 발견/추가 (6.1, 10.2)      |
| `playwright`          | UI/E2E 검증 (10.4)                         |
| `shrimp-task-manager` | 프로젝트 규약/Task 관리                    |
| `sequential-thinking` | 복잡한 다단계 분석 (선택적)                |

---

## 14. 갱신 정책

- 본 문서는 **AI Agent 운영 규칙 변경 시에만** 수정한다
- 코드/구조가 진화하여 규칙이 어긋나면 즉시 정정
- 일반 개발 지식·프레임워크 튜토리얼 추가 금지 — 그런 내용은 `docs/guides/*`로
- 프로젝트 기능 설명 추가 금지 — `docs/PRD.md`로
- 일정/Task 추가 금지 — `docs/ROADMAP.md`로
