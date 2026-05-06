// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import type { BlockObjectResponse } from '@notionhq/client'

import {
  extractPlainText,
  extractSectionsByHeading,
  getRichTextFromBlock,
} from '@/lib/notion/section-utils'

/**
 * F016 placeholder 정규식 — 단일 소스 export, 변형 금지
 *
 * 다음 패턴을 placeholder로 판정:
 * - `✏️ [작성 필요]`, `[TBD]`, `[작성중]`, `[미작성]`, `[작성중입니다]` 등
 * - 선행/후행 공백, 이모지 유무 무관
 */
export const PLACEHOLDER_REGEX =
  /^\s*(✏️\s*)?\[\s*(작성\s*필요|TBD|작성중|미작성|작성중입니다?)\s*\]\s*$/

/** heading_1 `# 0. 한 줄 정의` 매칭 정규식 */
const ONE_LINE_DEFINITION_REGEX = /^\s*0\.\s*한\s*줄\s*정의\s*$/

/**
 * 텍스트가 비어있거나 placeholder인지 확인
 *
 * @param text - 검사할 문자열
 * @returns 빈 문자열이거나 placeholder 패턴에 매칭되면 true
 */
function isEmptyOrPlaceholder(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.length === 0 || PLACEHOLDER_REGEX.test(trimmed)
}

/**
 * 블록에서 plain_text 추출 (rich_text 없는 타입은 빈 문자열)
 *
 * @param block - 대상 블록
 * @returns plain_text 결합 문자열
 */
function getBlockPlainText(block: BlockObjectResponse): string {
  const richText = getRichTextFromBlock(block)
  if (richText === null) return ''
  return extractPlainText(richText)
}

/**
 * F016 TL;DR 4단계 우선순위 추출 + placeholder fall-through
 *
 * 1단계: `# 0. 한 줄 정의` 섹션의 첫 paragraph plain_text
 *   → 빈 값이거나 placeholder이면 2단계로
 * 2단계: 페이지 최상단 첫 블록 type === 'quote'의 plain_text
 *   → 빈 값이거나 placeholder이면 3단계로
 * 3단계: Notion `요약` 속성 (summary 파라미터)
 *   → 빈 값이거나 placeholder이면 4단계로
 * 4단계: 본문 첫 단락 plain_text 앞 50자 + "…"
 *   → 빈 값이거나 placeholder이면 null 반환
 *
 * null 반환 시 TL;DR 박스 미렌더링 (절대 금지 #21 — fall-through 누락 금지).
 *
 * @param blocks - 글 상세의 전체 블록 배열
 * @param summary - Notion 요약 속성 텍스트 (없으면 null)
 * @returns TL;DR 문자열 또는 null
 */
export function extractTldr(
  blocks: BlockObjectResponse[],
  summary: string | null
): string | null {
  // ── 1단계: `# 0. 한 줄 정의` 섹션의 첫 단락 ──────────────────────
  const definitionSections = extractSectionsByHeading(blocks, headingText =>
    ONE_LINE_DEFINITION_REGEX.test(headingText)
  )

  if (definitionSections.length > 0) {
    const sectionBlocks = definitionSections[0]
    // 섹션 내 첫 paragraph 블록 찾기
    const firstParagraph = sectionBlocks.find(b => b.type === 'paragraph')
    if (firstParagraph !== undefined) {
      const text = getBlockPlainText(firstParagraph)
      if (!isEmptyOrPlaceholder(text)) {
        return text.trim()
      }
    }
  }

  // ── 2단계: 페이지 최상단 첫 블록이 quote인 경우 ───────────────────
  if (blocks.length > 0) {
    const firstBlock = blocks[0]
    if (firstBlock.type === 'quote') {
      const text = getBlockPlainText(firstBlock)
      if (!isEmptyOrPlaceholder(text)) {
        return text.trim()
      }
    }
  }

  // ── 3단계: Notion 요약 속성 ────────────────────────────────────────
  if (summary !== null && !isEmptyOrPlaceholder(summary)) {
    return summary.trim()
  }

  // ── 4단계: 본문 첫 단락 50자 (placeholder가 아닌 첫 paragraph 탐색) ──
  for (const block of blocks) {
    if (block.type !== 'paragraph') continue
    const text = getBlockPlainText(block)
    if (!isEmptyOrPlaceholder(text)) {
      const trimmed = text.trim()
      if (trimmed.length > 50) {
        return trimmed.slice(0, 50) + '…'
      }
      return trimmed
    }
  }

  // 모든 단계 실패 → null (TL;DR 박스 미렌더링)
  return null
}
