import { z } from 'zod'

/**
 * Notion API 응답 정규화 Zod 스키마
 *
 * 단일 진실 소스: docs/PRD.md "속성 매핑 표" + "현재 존재하는 속성" / "추가해야 할 속성" 표
 * 8개 한글 속성: 항목 / 분류 / 태그 / 발행일 / 웹 게시 / 요약 / 독자 수준 / 추천 순위
 *
 * 사용자 사전 작업 의존: Notion DB(345bcbcfa9ea80b38ec5c777f19c3442)에 6개 신규 속성
 *   웹 게시(select 발행됨/초안), 발행일(date), 태그(multi_select), 요약(rich_text),
 *   독자 수준(select 입문/중급/심화), 추천 순위(number)이 추가되어 있어야 Phase 2 실제 fetch 가능
 *   본 Task는 fixture 검증으로 진행 가능
 */

/** Notion title property → plain_text 배열 */
const titleProp = z.object({
  title: z.array(z.object({ plain_text: z.string() })).default([]),
})

/** Notion rich_text property → plain_text 배열 */
const richTextProp = z.object({
  rich_text: z.array(z.object({ plain_text: z.string() })).default([]),
})

/** Notion date property → start ISO date | null */
const dateProp = z.object({
  date: z.object({ start: z.string() }).nullable(),
})

/** Notion number property → number | null */
const numberProp = z.object({
  number: z.number().nullable(),
})

/** Notion multi_select property → option name 배열 */
const multiSelectProp = z.object({
  multi_select: z.array(z.object({ name: z.string() })).default([]),
})

/**
 * Notion select property (값을 enum으로 제한)
 *   - 웹 게시("발행됨"|"초안"), 독자 수준("입문"|"중급"|"심화")처럼 PRD에 명시된 값 한정
 */
const selectPropEnum = <T extends [string, ...string[]]>(values: T) =>
  z.object({
    select: z.object({ name: z.enum(values) }).nullable(),
  })

/**
 * Notion select property (값 자유 — 분류처럼 17개+ 옵션이 자유 추가 가능한 경우)
 */
const selectPropAny = z.object({
  select: z.object({ name: z.string() }).nullable(),
})

/**
 * Notion 데이터베이스 페이지 properties 전체 스키마
 *   - 한글 키는 Notion 속성명과 글자 단위 일치 (`'웹 게시'`의 공백 포함)
 *   - 정규화 결과(Post 영문 키)는 Phase 2 Task 005 normalizePost() 함수에서 매핑
 */
export const notionPagePropertiesSchema = z.object({
  항목: titleProp,
  분류: selectPropAny,
  태그: multiSelectProp,
  발행일: dateProp,
  '웹 게시': selectPropEnum(['발행됨', '초안']),
  요약: richTextProp,
  '독자 수준': selectPropEnum(['입문', '중급', '심화']),
  '추천 순위': numberProp,
})

export type NotionPagePropertiesParsed = z.infer<
  typeof notionPagePropertiesSchema
>
