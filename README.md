# ProjectTILLAGE Docs

Notion에 작성한 기획서를 별도 작업 없이 자동으로 웹에 게시하는 Notion 기반 문서 발행 사이트입니다.

## 프로젝트 개요

- **목적**: Notion DB에서 Status=`발행됨` 페이지를 자동으로 읽어 웹에 게시
- **사용자**: 기획서를 Notion으로 관리하고 외부에 공유하고 싶은 1인 기획자/개발자 및 동료/이해관계자
- **배포**: Vercel

## 주요 페이지

| 페이지    | URL 패턴             | 설명                                                                    |
| --------- | -------------------- | ----------------------------------------------------------------------- |
| 홈        | `/`                  | 최근 발행된 기획서 카드 그리드 (데스크톱 3열 / 태블릿 2열 / 모바일 1열) |
| 카테고리  | `/categories/[slug]` | 선택한 카테고리에 속한 기획서 목록                                      |
| 검색 결과 | `/search?q=...`      | 제목/태그 키워드 매칭 결과                                              |
| 글 상세   | `/posts/[id]`        | Notion 블록을 HTML로 변환한 본문                                        |

## 핵심 기능 (MVP)

- **F001** Notion 글 목록 조회 — Status=발행됨 필터, 발행일 내림차순
- **F002** 글 상세 렌더링 — Notion 블록(텍스트/이미지/리스트/코드/인용/구분선) → HTML
- **F003** 카테고리 필터링 — Notion select 옵션 자동 동기화
- **F004** 글 검색 — 제목/태그 부분 일치 키워드 검색
- **F010–F014** 반응형 레이아웃, 글로벌 헤더, 태그 표시, 에러/빈/로딩 상태, SEO 메타데이터

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

- [PRD — 상세 요구사항](./docs/PRD.md)
- [ROADMAP — 개발 계획](./docs/ROADMAP.md)
- [CLAUDE.md — 개발 지침](./CLAUDE.md)
