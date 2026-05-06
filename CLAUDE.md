# 🤖 Claude Code 개발 지침

**ProjectTILLAGE-Docs**는 Notion에 작성한 기획서를 자동으로 웹에 게시하는 Notion 기반 문서 발행 사이트입니다.

📋 상세 프로젝트 요구사항은 @/docs/PRD.md 참조
🗺️ 개발 로드맵은 @/docs/ROADMAP.md 참조

## 🛠️ 핵심 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style) + @tailwindcss/typography
- **Notion 연동**: @notionhq/client + 자체 블록 렌더러
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI + Lucide Icons
- **Development**: ESLint + Prettier + Husky + lint-staged

## 📌 프로젝트 특성 및 주의사항

### Notion 연동

- 모든 콘텐츠는 Notion API를 통해 조회합니다. DB에 직접 데이터를 쓰지 않습니다.
- `NOTION_TOKEN`, `NOTION_DATABASE_ID` 환경 변수가 없으면 Notion 관련 기능이 동작하지 않습니다.
- 로컬 개발 시 반드시 `.env.local` 파일을 생성하세요 (`.env.local.example` 참조).
- Notion 속성 `웹 게시 = 발행됨`인 페이지만 노출됩니다. `초안` 또는 미설정 글은 API 필터로 제외됩니다.
- 기존 한글 속성 `상태`(시작 전/진행 중/완료)는 게임 기획 작업 진행도이며 사이트 노출과 무관합니다. 사이트 노출은 신규 `웹 게시` 속성이 단독으로 결정합니다.
- 도메인 영문 키 매핑은 `docs/PRD.md` "속성 매핑 표"를 참조 — 특히 `웹 게시 → publication`(영문 키 `status` 아님, Notion `상태` 속성과 인지 오류 방지).

### 렌더링 전략

- 글 목록(홈/카테고리 인덱스/카테고리 상세) 및 글 상세 페이지: 서버 컴포넌트 + ISR (`revalidate: 60`)
- 검색 결과 페이지: 동적 처리 (`dynamic = 'force-dynamic'`)
- F018 멘션 페이지 메타 fetch는 빌드 단위로 `unstable_cache`/React 19 `cache()`로 메모이즈 (Notion rate limit burst 방지)

### MVP 범위 (현재 구현 대상)

**핵심 기능 (v1)**

- F001: Notion 글 목록 조회 (홈/카테고리/검색)
- F002: 글 상세 페이지 (Notion 블록 → HTML 렌더링)
- F003: 카테고리 필터링 (분류 인덱스 + 분류 상세)
- F004: 글 검색 (제목/태그 부분 일치)
- F010-F014: 반응형/헤더/태그/에러상태/SEO

**비기획자 친화 기능 (v2 추가)**

- F015: 비기획자 진입 큐레이션 (HERO + 처음 오셨나요? + 관심사로 골라보기)
- F016: TL;DR 자동 추출 (`# 0. 한 줄 정의` → 첫 quote → `요약` 속성 → 본문 50자, placeholder fall-through)
- F017: 작성 패턴 자동 변환 (callout → 인트로 박스, [확정]/[임시] → 배지, 미결 사항 → 접힘 토글)
- F018: 연동 문서 → 추천 카드 (비공개 멘션 숨김, 0개면 영역 숨김)
- F019: 읽기 메타 + 동일 분류 추천 (글 상세에만 읽기 시간, LIMIT 4 후 클라이언트 후처리)

### MVP 제외 기능 (구현하지 않습니다)

- 인증(로그인/회원가입) — 사이트는 공개 읽기 전용
- 댓글, 좋아요, 북마크, 질문
- 글 작성/편집 UI (Notion에서만)
- 다국어, RSS, 사이트맵 자동화
- 용어 사전(Glossary), 페이지 멘션 인라인 미니카드, 페르소나 코스 동적화, 추천 알고리즘

## 📚 개발 가이드

- **📋 프로젝트 요구사항**: `@/docs/PRD.md`
- **🗺️ 개발 로드맵**: `@/docs/ROADMAP.md`
- **📁 프로젝트 구조**: `@/docs/guides/project-structure.md`
- **🎨 스타일링 가이드**: `@/docs/guides/styling-guide.md`
- **🧩 컴포넌트 패턴**: `@/docs/guides/component-patterns.md`
- **⚡ Next.js 15.5.3 전문 가이드**: `@/docs/guides/nextjs-15.md`
- **📝 폼 처리 완전 가이드**: `@/docs/guides/forms-react-hook-form.md`

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run check-all   # 모든 검사 통합 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인
```

💡 **상세 규칙은 위 개발 가이드 문서들을 참조하세요**
