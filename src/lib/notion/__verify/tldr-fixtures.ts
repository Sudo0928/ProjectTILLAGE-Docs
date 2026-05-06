/**
 * F016 TL;DR 4단계 fall-through 검증 스크립트
 *
 * 실행: npx tsx src/lib/notion/__verify/tldr-fixtures.ts
 *
 * 주의: __verify 디렉토리는 테스트/검증 전용 — src 코드 본문 규칙(as 금지 등) 완화 허용
 */

// 경로 별칭 미지원 환경이므로 상대 경로 사용
import { extractTldr } from '../tldr-extractor'
import type { BlockObjectResponse } from '@notionhq/client'

// ─────────────────────────────────────────────────────────────────────────────
// Fixture 헬퍼 — 최소 필드만으로 BlockObjectResponse 유사 객체 생성
// ─────────────────────────────────────────────────────────────────────────────

/** paragraph 블록 fixture 생성 */
function makeParagraph(text: string, id = 'p1'): BlockObjectResponse {
  return {
    id,
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
  } as unknown as BlockObjectResponse
}

/** heading_1 블록 fixture 생성 */
function makeHeading1(text: string, id = 'h1'): BlockObjectResponse {
  return {
    id,
    type: 'heading_1',
    object: 'block',
    created_time: '',
    last_edited_time: '',
    created_by: { object: 'user', id: '' },
    last_edited_by: { object: 'user', id: '' },
    has_children: false,
    archived: false,
    in_trash: false,
    heading_1: {
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
      is_toggleable: false,
    },
  } as unknown as BlockObjectResponse
}

/** quote 블록 fixture 생성 */
function makeQuote(text: string, id = 'q1'): BlockObjectResponse {
  return {
    id,
    type: 'quote',
    object: 'block',
    created_time: '',
    last_edited_time: '',
    created_by: { object: 'user', id: '' },
    last_edited_by: { object: 'user', id: '' },
    has_children: false,
    archived: false,
    in_trash: false,
    quote: {
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
  } as unknown as BlockObjectResponse
}

// ─────────────────────────────────────────────────────────────────────────────
// 검증 헬퍼
// ─────────────────────────────────────────────────────────────────────────────

let passCount = 0
let failCount = 0

function check(
  label: string,
  actual: string | null,
  expected: string | null
): void {
  if (actual === expected) {
    console.log(`[F016 PASS] ${label}`)
    passCount++
  } else {
    console.error(
      `[F016 FAIL] ${label}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`
    )
    failCount++
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixture 1: # 0. 한 줄 정의 섹션 + 첫 단락 정상 텍스트 → 1단계 매칭
// ─────────────────────────────────────────────────────────────────────────────

const fixture1Blocks: BlockObjectResponse[] = [
  makeHeading1('0. 한 줄 정의', 'h-def'),
  makeParagraph(
    '이 문서는 게임 전투 시스템의 핵심 규칙을 정의합니다.',
    'p-def'
  ),
  makeParagraph('추가 설명 단락입니다.', 'p-extra'),
]

check(
  'fixture 1: 1단계 매칭 (# 0. 한 줄 정의 섹션 첫 단락)',
  extractTldr(fixture1Blocks, null),
  '이 문서는 게임 전투 시스템의 핵심 규칙을 정의합니다.'
)

// ─────────────────────────────────────────────────────────────────────────────
// Fixture 2: # 0. 한 줄 정의 섹션 + placeholder → 2단계 quote 매칭
// ─────────────────────────────────────────────────────────────────────────────

const fixture2Blocks: BlockObjectResponse[] = [
  makeQuote('한 줄 요약: 전투 시스템은 턴제 방식입니다.', 'q-main'),
  makeHeading1('0. 한 줄 정의', 'h-def'),
  makeParagraph('✏️ [작성 필요]', 'p-placeholder'),
]

// quote가 첫 번째 블록 — 1단계 섹션은 있지만 placeholder → 2단계로 fall-through
// NOTE: fixture2는 heading_1이 blocks[1]이므로 quote가 실제 최상단 블록
check(
  'fixture 2: 2단계 매칭 (1단계 placeholder → quote 첫 블록)',
  extractTldr(fixture2Blocks, null),
  '한 줄 요약: 전투 시스템은 턴제 방식입니다.'
)

// ─────────────────────────────────────────────────────────────────────────────
// Fixture 3: 1/2단계 모두 placeholder → 3단계 summary 매칭
// ─────────────────────────────────────────────────────────────────────────────

const fixture3Blocks: BlockObjectResponse[] = [
  makeHeading1('0. 한 줄 정의', 'h-def'),
  makeParagraph('[TBD]', 'p-tbd'),
  makeParagraph('일반 본문 단락 내용.', 'p-body'),
]
// 첫 블록이 heading_1이므로 quote 2단계 미매칭 → 3단계 summary로

check(
  'fixture 3: 3단계 매칭 (1단계 placeholder, 2단계 미해당 → summary)',
  extractTldr(fixture3Blocks, 'Notion 요약 속성에서 가져온 한 줄 요약입니다.'),
  'Notion 요약 속성에서 가져온 한 줄 요약입니다.'
)

// ─────────────────────────────────────────────────────────────────────────────
// Fixture 4: 1/2/3단계 모두 빈/placeholder → 4단계 본문 50자 매칭
// ─────────────────────────────────────────────────────────────────────────────

const longBodyText =
  '이것은 긴 본문 단락입니다. 전투 시스템의 세부 규칙과 예외 조항에 대한 설명이 여기에 포함됩니다. 매우 긴 설명.'

const fixture4Blocks: BlockObjectResponse[] = [
  makeHeading1('0. 한 줄 정의', 'h-def'),
  makeParagraph('[미작성]', 'p-missing'),
  makeParagraph(longBodyText, 'p-body'),
]

const expected4 = longBodyText.slice(0, 50) + '…'
check(
  'fixture 4: 4단계 매칭 (본문 첫 단락 50자 + 말줄임)',
  extractTldr(fixture4Blocks, null),
  expected4
)

// ─────────────────────────────────────────────────────────────────────────────
// Fixture 5: 4단계 모두 실패 → null
// ─────────────────────────────────────────────────────────────────────────────

const fixture5Blocks: BlockObjectResponse[] = [
  makeHeading1('0. 한 줄 정의', 'h-def'),
  makeParagraph('✏️ [작성 필요]', 'p-ph1'),
  // quote 없음, summary null, 본문 단락 없음
  makeHeading1('1. 개요', 'h-overview'),
]

check('fixture 5: 전체 실패 → null', extractTldr(fixture5Blocks, null), null)

// ─────────────────────────────────────────────────────────────────────────────
// 결과 출력
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n결과: ${passCount}/${passCount + failCount} PASS`)
if (failCount > 0) {
  process.exit(1)
}
