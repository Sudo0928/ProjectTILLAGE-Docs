// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client'

/**
 * heading_1 블록 텍스트 추출 헬퍼
 *
 * @param block - 검사할 블록
 * @returns heading_1이면 plain_text 문자열, 아니면 null
 */
function getHeading1Text(block: BlockObjectResponse): string | null {
  if (block.type !== 'heading_1') return null
  return block.heading_1.rich_text.map(t => t.plain_text).join('')
}

/**
 * heading_1 블록 기준으로 섹션 그룹화
 *
 * predicate가 true인 heading_1을 시작점으로 다음 heading_1(또는 배열 끝)까지의
 * 블록들을 하나의 섹션으로 그룹화. heading_1 자체는 결과에 미포함.
 *
 * 사용 예: extractSectionsByHeading(blocks, t => /미결 사항/.test(t))
 *
 * @param blocks - 전체 블록 배열
 * @param predicate - heading_1 plain_text를 받아 섹션 시작 여부를 반환하는 함수
 * @returns 매칭된 섹션들의 블록 배열 목록 (섹션 개수 === predicate 매칭 heading 개수)
 */
export function extractSectionsByHeading(
  blocks: BlockObjectResponse[],
  predicate: (headingPlainText: string) => boolean
): BlockObjectResponse[][] {
  const sections: BlockObjectResponse[][] = []
  let currentSection: BlockObjectResponse[] | null = null

  for (const block of blocks) {
    const headingText = getHeading1Text(block)

    if (headingText !== null) {
      // heading_1 발견 — predicate 검사
      if (predicate(headingText)) {
        // 매칭: 새 섹션 시작 (heading_1 자체는 미포함)
        currentSection = []
        sections.push(currentSection)
      } else {
        // 비매칭 heading_1 → 현재 섹션 종료
        currentSection = null
      }
    } else if (currentSection !== null) {
      // 섹션 내부 블록 수집
      currentSection.push(block)
    }
  }

  return sections
}

/**
 * rich_text 배열 → plain_text 평문 결합
 *
 * @param richText - Notion RichTextItemResponse 배열
 * @returns 모든 항목의 plain_text를 이어붙인 문자열
 */
export function extractPlainText(richText: RichTextItemResponse[]): string {
  return richText.map(t => t.plain_text).join('')
}

/**
 * 블록에서 rich_text 배열을 type-safe하게 추출
 *
 * Notion 블록 타입별로 rich_text 위치가 다르므로 switch로 분기.
 * table_row는 cells 배열(RichTextItemResponse[][])로 구성 — 첫 셀 반환.
 * image/divider/table 등 rich_text 없는 타입은 null 반환.
 *
 * @param block - 추출 대상 블록
 * @returns rich_text 배열 또는 null (미지원 타입)
 */
export function getRichTextFromBlock(
  block: BlockObjectResponse
): RichTextItemResponse[] | null {
  switch (block.type) {
    case 'paragraph':
      return block.paragraph.rich_text
    case 'heading_1':
      return block.heading_1.rich_text
    case 'heading_2':
      return block.heading_2.rich_text
    case 'heading_3':
      return block.heading_3.rich_text
    case 'bulleted_list_item':
      return block.bulleted_list_item.rich_text
    case 'numbered_list_item':
      return block.numbered_list_item.rich_text
    case 'quote':
      return block.quote.rich_text
    case 'callout':
      return block.callout.rich_text
    case 'toggle':
      return block.toggle.rich_text
    case 'code':
      return block.code.rich_text
    case 'table_row':
      // table_row는 cells 배열 — 모든 셀의 rich_text를 평탄화
      return block.table_row.cells.flat()
    default:
      // image, divider, table, bookmark, equation, column 등
      return null
  }
}
