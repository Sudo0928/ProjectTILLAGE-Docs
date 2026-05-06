// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import type { BlockObjectResponse } from '@notionhq/client'

import { getRichTextFromBlock } from '@/lib/notion/section-utils'

/**
 * F019: 읽기 시간 계산
 *
 * 한국어 평균 읽기 속도 분당 500자 기준.
 * 모든 블록의 plain_text 길이를 합산하여 계산.
 * table_row의 cells도 포함.
 * 최소 1분 보장 (Math.max(1, ...)).
 *
 * @param blocks - 글 상세의 전체 블록 배열
 * @returns 예상 읽기 시간 (분, 최소 1)
 */
export function calculateReadingTime(blocks: BlockObjectResponse[]): number {
  let totalLength = 0

  for (const block of blocks) {
    const richText = getRichTextFromBlock(block)
    if (richText !== null) {
      // 각 rich_text 항목의 plain_text 길이 합산
      for (const item of richText) {
        totalLength += item.plain_text.length
      }
    }

    // code 블록: caption도 포함
    if (block.type === 'code') {
      for (const item of block.code.caption) {
        totalLength += item.plain_text.length
      }
    }

    // image 블록: caption 텍스트 포함
    if (block.type === 'image') {
      for (const item of block.image.caption) {
        totalLength += item.plain_text.length
      }
    }
  }

  // 분당 500자 / 최소 1분
  return Math.max(1, Math.round(totalLength / 500))
}
