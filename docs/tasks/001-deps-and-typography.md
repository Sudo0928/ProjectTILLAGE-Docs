# Task 001 — 의존성 설치 및 타이포그래피 설정

## 개요

- Phase: 1 (애플리케이션 골격 구축)
- shrimp ID: b7367d70-e9de-4f91-9bf1-55534b8a5c07
- 의존성: 없음 (Phase 0 완료 위에서 시작)

## 수락 기준

- [x] `@notionhq/client` / `@tailwindcss/typography` 설치 완료
- [x] `globals.css`에 typography plugin 등록
- [x] `npm run check-all` 통과
- [x] `npm run build` (Turbopack) 성공
- [x] 5개 문서 동기화 완료 (`package.json` / `README.md` / `CLAUDE.md` / `docs/PRD.md` / `docs/ROADMAP.md`)
- [ ] `prose` 클래스 동작 검증 — Task 002 셸 페이지에서 후속 검증 (옵션 B deferral)

## 변경 사항 요약

- `@notionhq/client@^5.20.0`: Notion 공식 SDK (Phase 2 Task 004부터 활용), dependencies에 추가
- `@tailwindcss/typography@^0.5.19`: prose 유틸 활성화 (Phase 2 Task 006 블록 렌더러에서 활용), devDependencies에 추가
- `src/app/globals.css` 3행: `@plugin '@tailwindcss/typography';` 디렉티브 추가 (`@import 'tw-animate-css';` 다음, `@custom-variant dark` 이전)
- `CLAUDE.md` "🛠️ 핵심 기술 스택": Styling 항목에 `+ @tailwindcss/typography` 추가
- `docs/ROADMAP.md`: Phase 0 미완료 항목 ❌ → ✅ 변경, Task 001 항목에 ✅ 및 `See:` 참조 추가
- `README.md`, `docs/PRD.md`: 이미 두 의존성이 정확히 명시되어 있어 변경 없음

## 검증 결과

- `npm run check-all`: 통과 (typecheck 오류 없음, lint 오류 없음, Prettier 포맷 일치)
  - 참고: check-all 최초 실행 시 50개 파일이 Prettier 미적용 상태였음 (본 Task 이전부터 존재하던 누적). `npm run format`으로 일괄 수정 후 통과
- `npm run build`: 통과 (Turbopack, 컴파일 1452ms, 정적 페이지 5/5 생성, CSS 청크 16.3kB)
- `prose` 임시 검증: 옵션 B — deferral. Task 002 라우트 셸 작업에서 `<article className="prose dark:prose-invert">` 임시 마크업을 포함한 셸 페이지 생성 시 함께 검증

## 참고

- TailwindCSS v4 typography plugin 등록 문법은 context7 MCP `/tailwindlabs/tailwindcss-typography`로 검증 (FACT 확립)
  - 정확한 문법: `@plugin '@tailwindcss/typography';` (CSS 파일 내 `@import 'tailwindcss';` 다음에 위치)
  - 출처: tailwindlabs/tailwindcss-typography README.md "Basic v4 Plugin Setup with @plugin"
- `notion-to-md` 등 외부 변환 라이브러리는 추가하지 않음 (자체 블록 매핑은 Phase 2 Task 006)
- Prettier 포맷 이슈: 스타터킷 초기화 이후 50개 파일에 누적된 포맷 미적용 상태를 본 Task에서 일괄 정리함
