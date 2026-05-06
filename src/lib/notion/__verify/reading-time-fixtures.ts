/**
 * F019 읽기 시간 계산 검증 스크립트
 *
 * 실행: npx tsx src/lib/notion/__verify/reading-time-fixtures.ts
 *
 * 기준: 한국어 분당 500자, 최소 1분
 * 예상값: 0자→1분, 100자→1분, 500자→1분, 1000자→2분, 5000자→10분
 */

import { calculateReadingTime } from '../reading-time'
import type { BlockObjectResponse } from '@notionhq/client'

// ─────────────────────────────────────────────────────────────────────────────
// Fixture 헬퍼
// ─────────────────────────────────────────────────────────────────────────────

/** 지정 길이의 텍스트를 가진 paragraph 블록 배열 생성 */
function makeBlocksWithLength(totalLength: number): BlockObjectResponse[] {
  if (totalLength === 0) return []

  // 한 블록당 최대 500자로 분할
  const blocks: BlockObjectResponse[] = []
  let remaining = totalLength
  let idx = 0

  while (remaining > 0) {
    const chunkSize = Math.min(remaining, 500)
    const text = '가'.repeat(chunkSize) // 한국어 글자로 채움
    blocks.push({
      id: `p${idx}`,
      type: 'paragraph',
      object: 'block',
      created_time: '',
      last_edited_time: '',
      created_by: { object: 'user', id: '' },
      last_edited_by: { object: 'user', id: '' },
      has_children: false,
      archived: false,
      in_trash: false,
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: text, link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            plain_text: text,
            href: null,
          },
        ],
        color: 'default',
      },
    } as unknown as BlockObjectResponse)
    remaining -= chunkSize
    idx++
  }

  return blocks
}

// ─────────────────────────────────────────────────────────────────────────────
// 검증 헬퍼
// ─────────────────────────────────────────────────────────────────────────────

let passCount = 0
let failCount = 0

function check(label: string, actual: number, expected: number): void {
  if (actual === expected) {
    console.log(`[F019 PASS] ${label}`)
    passCount++
  } else {
    console.error(
      `[F019 FAIL] ${label}\n  expected: ${expected}분\n  actual:   ${actual}분`
    )
    failCount++
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 검증 케이스
// ─────────────────────────────────────────────────────────────────────────────

// 0자 → 최소 1분
check('0자 → 1분', calculateReadingTime(makeBlocksWithLength(0)), 1)

// 100자 → 1분 (100/500 = 0.2 → round → 0 → max(1,0) = 1)
check('100자 → 1분', calculateReadingTime(makeBlocksWithLength(100)), 1)

// 500자 → 1분 (500/500 = 1.0 → round → 1)
check('500자 → 1분', calculateReadingTime(makeBlocksWithLength(500)), 1)

// 1000자 → 2분 (1000/500 = 2.0 → round → 2)
check('1000자 → 2분', calculateReadingTime(makeBlocksWithLength(1000)), 2)

// 5000자 → 10분 (5000/500 = 10.0 → round → 10)
check('5000자 → 10분', calculateReadingTime(makeBlocksWithLength(5000)), 10)

// ─────────────────────────────────────────────────────────────────────────────
// 결과 출력
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n결과: ${passCount}/${passCount + failCount} PASS`)
if (failCount > 0) {
  process.exit(1)
}
