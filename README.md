# ProjectTILLAGE Docs

Notion에 작성한 기획서를 별도 작업 없이 자동으로 웹에 게시하는 Notion 기반 문서 발행 사이트입니다.

## 프로젝트 개요

- **목적**: Notion DB에서 `웹 게시=발행됨` 페이지를 자동으로 읽어 웹에 게시. 비기획자(아티스트/사운드/외부 개발자/마케터/투자자)도 5분 안에 게임 컨셉을 파악할 수 있도록 작성 패턴을 자동 변환·큐레이션.
- **사용자**: 기획서를 Notion으로 관리하는 1인 기획자/개발자 + 비기획자 5개 페르소나(아티스트/사운드/외부 프로그래머/마케터/외부)
- **배포**: Vercel

## 주요 페이지

| 페이지          | URL 패턴             | 렌더링  | 설명                                                              |
| --------------- | -------------------- | ------- | ----------------------------------------------------------------- |
| 홈              | `/`                  | ISR 60s | HERO + 처음 오셨나요? + 관심사로 골라보기 + 최근 글 카드 그리드   |
| 카테고리 인덱스 | `/categories`        | ISR 60s | 17개 분류 카드(이모지 + 이름 + 글 수)                             |
| 카테고리 상세   | `/categories/[slug]` | ISR 60s | 선택한 분류에 속한 기획서 목록                                    |
| 검색 결과       | `/search?q=...`      | 동적    | 제목/태그 키워드 매칭 결과                                        |
| 글 상세         | `/posts/[slug]`      | ISR 60s | Notion 블록 → HTML + TL;DR + 작성 패턴 자동 변환 + 연동 문서 카드 |

## 핵심 기능 (MVP)

**v1 — 핵심 발행 기능**

- **F001** Notion 글 목록 조회 — `웹 게시=발행됨` 필터, 발행일 내림차순
- **F002** 글 상세 렌더링 — Notion 블록(텍스트/이미지/리스트/코드/인용/구분선/표/토글/콜아웃) → HTML
- **F003** 카테고리 필터링 — Notion `분류` select 옵션 자동 동기화 (17개 분류)
- **F004** 글 검색 — 제목/태그 부분 일치 키워드 검색
- **F010–F014** 반응형 레이아웃, 글로벌 헤더, 태그 표시, 에러/빈/로딩 상태, SEO 메타데이터

**v2 — 비기획자 친화 기능**

- **F015** 비기획자 진입 큐레이션 — HERO Logline + "처음 오셨나요?"(`추천 순위` 1~3) + "관심사로 골라보기"(페르소나별 정적)
- **F016** TL;DR 자동 추출 — `# 0. 한 줄 정의` → 첫 quote 블록 → `요약` 속성 → 본문 50자 fallback (placeholder fall-through 포함)
- **F017** 작성 패턴 자동 변환 — callout 블록(💡) → 인트로 박스, 표 셀 `[확정]/[임시]` → 색상 배지, `# N. 미결 사항` 섹션 → 접힘 토글
- **F018** 연동 문서 → 추천 카드 — `# N. 연동 문서` 섹션의 페이지 멘션을 카드 그리드로 변환 (비공개 멘션은 숨김, 0개면 영역 숨김)
- **F019** 읽기 메타 + 동일 분류 추천 — 글 상세에만 읽기 시간 표시(분당 500자), 독자 수준 칩, 같은 분류 글 3건 자동 추천

## 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style) + @tailwindcss/typography
- **Notion 연동**: @notionhq/client + 자체 블록 렌더러
- **Forms**: React Hook Form + Zod
- **배포**: Vercel

## 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 만들고 실제 값을 입력하세요.

```bash
cp .env.local.example .env.local
```

| 변수명                 | 설명                      | 획득 방법                                                          |
| ---------------------- | ------------------------- | ------------------------------------------------------------------ |
| `NOTION_TOKEN`         | Notion Integration Secret | [notion.so/my-integrations](https://www.notion.so/my-integrations) |
| `NOTION_DATABASE_ID`   | 기획서 데이터베이스 ID    | Notion DB 페이지 URL에서 추출                                      |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL (SEO용)   | 로컬: `http://localhost:3000`                                      |

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 편집 후 실제 값 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

```bash
# 프로덕션 빌드
npm run build

# 코드 품질 검사 (타입체크 + 린트 + 포맷)
npm run check-all
```

## 개발 상태

- 기본 프로젝트 구조 설정 완료
- Notion 연동 및 페이지별 기능 구현 진행 예정

자세한 개발 계획은 [docs/ROADMAP.md](./docs/ROADMAP.md)를 참고하세요.

## 문서

- [PRD — 상세 요구사항](./docs/PRD.md) (현행)
- [PRD.archive — 초기 골격 버전](./docs/PRD.archive.md) (참조용)
- [ROADMAP — 개발 계획](./docs/ROADMAP.md) (현행)
- [ROADMAP.archive — 초기 골격 계획](./docs/ROADMAP.archive.md) (참조용)
- [CLAUDE.md — 개발 지침](./CLAUDE.md)
