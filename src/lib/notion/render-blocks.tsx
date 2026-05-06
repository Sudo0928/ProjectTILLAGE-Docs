// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import type { ReactNode } from 'react'
import Image from 'next/image'
import {
  isFullBlock,
  type BlockObjectResponse,
  type RichTextItemResponse,
} from '@notionhq/client'

import { CalloutIntro } from '@/components/posts/callout-intro'
import { TableCellBadge } from '@/components/posts/table-cell-badge'
import { MissingItemsCollapsible } from '@/components/posts/missing-items-collapsible'
import { getNotionClient } from '@/lib/notion/client'
import {
  extractSectionsByHeading,
  extractPlainText,
} from '@/lib/notion/section-utils'

/** `# N. 미결 사항` heading_1 매칭 정규식 */
const MISSING_ITEMS_REGEX = /^\s*\d+\.\s*미결\s*사항\s*$/

/** 최대 재귀 깊이 — 초과 시 fetchChildren 미호출 (무한 재귀 방지) */
const MAX_DEPTH = 3

// ─────────────────────────────────────────────────────────────────────────────
// rich_text 인라인 렌더러
// ─────────────────────────────────────────────────────────────────────────────

/**
 * rich_text 어노테이션 → JSX 인라인 변환
 *
 * bold / italic / code / strikethrough / underline + href(링크) 지원.
 * 중첩 어노테이션은 span 레이어 중첩으로 처리.
 *
 * @param items - Notion RichTextItemResponse 배열
 * @returns JSX ReactNode 배열
 */
function renderRichText(items: RichTextItemResponse[]): ReactNode[] {
  return items.map((item, index) => {
    const { annotations } = item
    const key = `rt-${index}`

    // plain_text 기본값
    let content: ReactNode = item.plain_text

    // mention 타입: page/date/user 등 — 현재 plain_text 텍스트로 표시
    // (F018 연동 문서는 별도 getRelatedDocs로 처리)

    // code 어노테이션
    if (annotations.code) {
      content = (
        <code
          key={key}
          className="bg-muted rounded px-1 py-0.5 font-mono text-sm"
        >
          {content}
        </code>
      )
      // href가 있는 경우 code는 링크 안에 포함
      if (item.href !== null) {
        return (
          <a
            key={key}
            href={item.href}
            className="text-primary underline underline-offset-4 hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {content}
          </a>
        )
      }
      return content
    }

    // 기본 어노테이션 처리 (span 래핑)
    if (
      annotations.bold ||
      annotations.italic ||
      annotations.strikethrough ||
      annotations.underline
    ) {
      const classNames: string[] = []
      if (annotations.bold) classNames.push('font-bold')
      if (annotations.italic) classNames.push('italic')
      if (annotations.strikethrough) classNames.push('line-through')
      if (annotations.underline) classNames.push('underline underline-offset-4')

      content = (
        <span key={key} className={classNames.join(' ')}>
          {content}
        </span>
      )
    }

    // href 링크
    if (item.href !== null) {
      return (
        <a
          key={key}
          href={item.href}
          className="text-primary underline underline-offset-4 hover:opacity-80"
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      )
    }

    // 어노테이션 없는 경우 key를 위해 span 사용
    if (
      !annotations.bold &&
      !annotations.italic &&
      !annotations.strikethrough &&
      !annotations.underline &&
      !annotations.code
    ) {
      return <span key={key}>{content}</span>
    }

    return content
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 표 셀 렌더러 (F017: [확정]/[임시] 배지 변환)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 표 셀 rich_text → JSX 변환 (F017 [확정]/[임시] 배지 포함)
 *
 * 셀 내 `[확정]` 텍스트는 success 배지, `[임시]` 텍스트는 warning 배지로 변환.
 * 배지 변환 후 나머지 텍스트는 renderRichText로 처리.
 *
 * @param cell - 표 셀의 RichTextItemResponse 배열
 * @returns JSX ReactNode
 */
function renderTableCell(cell: RichTextItemResponse[]): ReactNode {
  const nodes: ReactNode[] = []

  for (let i = 0; i < cell.length; i++) {
    const item = cell[i]
    const text = item.plain_text

    // [확정] 패턴
    if (text.includes('[확정]')) {
      const parts = text.split('[확정]')
      parts.forEach((part, idx) => {
        if (part.length > 0) {
          nodes.push(<span key={`pre-${i}-${idx}`}>{part}</span>)
        }
        if (idx < parts.length - 1) {
          nodes.push(
            <TableCellBadge key={`badge-확정-${i}-${idx}`} variant="success">
              확정
            </TableCellBadge>
          )
        }
      })
      continue
    }

    // [임시] 패턴
    if (text.includes('[임시]')) {
      const parts = text.split('[임시]')
      parts.forEach((part, idx) => {
        if (part.length > 0) {
          nodes.push(<span key={`pre-${i}-${idx}`}>{part}</span>)
        }
        if (idx < parts.length - 1) {
          nodes.push(
            <TableCellBadge key={`badge-임시-${i}-${idx}`} variant="warning">
              임시
            </TableCellBadge>
          )
        }
      })
      continue
    }

    // 일반 rich_text
    nodes.push(...renderRichText([item]))
  }

  return <>{nodes}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// 자식 블록 fetch (재귀 깊이 제한)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * has_children=true 블록의 자식 목록 fetch
 *
 * depth >= MAX_DEPTH이면 빈 배열 반환 (무한 재귀 방지).
 * isFullBlock 가드로 타입 안전성 확보.
 *
 * @param blockId - 부모 블록 ID
 * @param depth - 현재 재귀 깊이
 * @returns 자식 BlockObjectResponse 배열 (또는 빈 배열)
 */
async function fetchChildren(
  blockId: string,
  depth: number
): Promise<BlockObjectResponse[]> {
  if (depth >= MAX_DEPTH) {
    return []
  }

  const notion = getNotionClient()
  const children: BlockObjectResponse[] = []
  let cursor: string | undefined = undefined

  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    })
    for (const b of res.results) {
      if (isFullBlock(b)) {
        children.push(b)
      }
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined
  } while (cursor !== undefined)

  return children
}

// ─────────────────────────────────────────────────────────────────────────────
// 단일 블록 렌더러
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 단일 블록 → JSX 변환 (비동기 서버 컴포넌트 방식)
 *
 * 12종 지원:
 * paragraph / heading_1~3 / bulleted_list_item / numbered_list_item /
 * image / code / quote / divider / table / table_row / toggle / callout
 *
 * 미지원 블록은 개발 환경에서만 console.warn 후 null 반환.
 *
 * @param block - 렌더링할 블록
 * @param depth - 재귀 깊이 (fetchChildren 제한에 사용)
 * @returns JSX ReactNode 또는 null
 */
async function renderSingleBlock(
  block: BlockObjectResponse,
  depth: number
): Promise<ReactNode> {
  const id = block.id

  switch (block.type) {
    case 'paragraph':
      return <p key={id}>{renderRichText(block.paragraph.rich_text)}</p>

    case 'heading_1':
      return <h1 key={id}>{renderRichText(block.heading_1.rich_text)}</h1>

    case 'heading_2':
      return <h2 key={id}>{renderRichText(block.heading_2.rich_text)}</h2>

    case 'heading_3':
      return <h3 key={id}>{renderRichText(block.heading_3.rich_text)}</h3>

    case 'image': {
      // external URL 또는 Notion 파일 URL
      const url =
        block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url
      const altText = extractPlainText(block.image.caption)
      return (
        <Image
          key={id}
          src={url}
          alt={altText || '이미지'}
          width={1200}
          height={630}
          className="rounded-md"
        />
      )
    }

    case 'code': {
      const codeText = extractPlainText(block.code.rich_text)
      return (
        <pre key={id}>
          <code className={`language-${block.code.language}`}>{codeText}</code>
        </pre>
      )
    }

    case 'quote':
      return (
        <blockquote key={id}>
          {renderRichText(block.quote.rich_text)}
        </blockquote>
      )

    case 'divider':
      return <hr key={id} />

    case 'callout': {
      // 💡 이모지 callout → CalloutIntro 컴포넌트 (F017)
      const isLightbulb =
        block.callout.icon?.type === 'emoji' &&
        block.callout.icon.emoji === '💡'

      if (isLightbulb) {
        return (
          <CalloutIntro key={id}>
            {renderRichText(block.callout.rich_text)}
          </CalloutIntro>
        )
      }

      // 일반 callout: 아이콘 + 배경
      const iconText =
        block.callout.icon?.type === 'emoji' ? block.callout.icon.emoji : null

      return (
        <div
          key={id}
          className="not-prose bg-muted my-4 flex gap-3 rounded-md border p-4"
        >
          {iconText !== null && (
            <span
              className="shrink-0 text-lg leading-relaxed"
              aria-hidden="true"
            >
              {iconText}
            </span>
          )}
          <div className="min-w-0 flex-1 text-sm leading-relaxed">
            {renderRichText(block.callout.rich_text)}
          </div>
        </div>
      )
    }

    case 'toggle': {
      // toggle: native <details>/<summary> 사용 (클라이언트 컴포넌트 회피)
      const children = await fetchChildren(id, depth + 1)
      const childNodes = await Promise.all(
        children.map(child => renderSingleBlock(child, depth + 1))
      )
      return (
        <details key={id} className="my-2">
          <summary className="cursor-pointer font-medium">
            {renderRichText(block.toggle.rich_text)}
          </summary>
          <div className="mt-2 ml-4">{childNodes}</div>
        </details>
      )
    }

    case 'table': {
      // table: 자식 table_row fetch → 테이블 마크업
      const rows = await fetchChildren(id, depth + 1)
      return (
        <div key={id} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {rows.map((row, rowIndex) => {
                if (row.type !== 'table_row') return null
                const isHeader = block.table.has_column_header && rowIndex === 0
                return (
                  <tr key={row.id}>
                    {row.table_row.cells.map((cell, cellIndex) =>
                      isHeader ? (
                        <th
                          key={cellIndex}
                          className="border-border bg-muted border px-3 py-2 text-left font-semibold"
                        >
                          {renderTableCell(cell)}
                        </th>
                      ) : (
                        <td
                          key={cellIndex}
                          className="border-border border px-3 py-2"
                        >
                          {renderTableCell(cell)}
                        </td>
                      )
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }

    case 'table_row':
      // table_row는 table 렌더러 내부에서만 처리됨 — 단독 호출은 null 반환
      return null

    case 'bulleted_list_item': {
      const children = block.has_children
        ? await fetchChildren(id, depth + 1)
        : []
      const childNodes =
        children.length > 0
          ? await Promise.all(
              children.map(c => renderSingleBlock(c, depth + 1))
            )
          : []
      return (
        <li key={id}>
          {renderRichText(block.bulleted_list_item.rich_text)}
          {childNodes.length > 0 && <ul>{childNodes}</ul>}
        </li>
      )
    }

    case 'numbered_list_item': {
      const children = block.has_children
        ? await fetchChildren(id, depth + 1)
        : []
      const childNodes =
        children.length > 0
          ? await Promise.all(
              children.map(c => renderSingleBlock(c, depth + 1))
            )
          : []
      return (
        <li key={id}>
          {renderRichText(block.numbered_list_item.rich_text)}
          {childNodes.length > 0 && <ol>{childNodes}</ol>}
        </li>
      )
    }

    default: {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[render-blocks] unsupported block type:', block.type)
      }
      return null
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RenderBlocks 메인 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────

interface RenderBlocksProps {
  /** 렌더링할 블록 배열 */
  blocks: BlockObjectResponse[]
  /** 재귀 깊이 (기본값 0, 내부 재귀 시 자동 증가) */
  depth?: number
}

/**
 * 블록 배열 → JSX 트리 변환 메인 진입점 (비동기 서버 컴포넌트)
 *
 * 처리 순서:
 * 1) 미결 사항 섹션 식별 → MissingItemsCollapsible로 래핑
 * 2) 나머지 블록에서 연속 list_item → ul/ol 그룹화
 * 3) 단일 블록 변환 (renderSingleBlock)
 *
 * Phase 4 Task 013에서 호출하여 Notion 본문을 즉시 렌더링.
 *
 * @param blocks - 글 상세 전체 블록 배열
 * @param depth - 재귀 깊이 (기본값 0)
 */
export async function RenderBlocks({
  blocks,
  depth = 0,
}: RenderBlocksProps): Promise<ReactNode> {
  if (blocks.length === 0) {
    return null
  }

  // ── 1단계: 미결 사항 섹션 식별 ─────────────────────────────────────
  // 미결 사항 heading_1 섹션에 속하는 블록 ID Set
  const missingSections = extractSectionsByHeading(blocks, headingText =>
    MISSING_ITEMS_REGEX.test(headingText)
  )
  const missingBlockIds = new Set(
    missingSections.flatMap(section => section.map(b => b.id))
  )

  // 미결 사항 heading_1 자체 ID Set (heading을 출력에서 제외하기 위해)
  const missingHeadingIds = new Set<string>()
  for (const block of blocks) {
    if (
      block.type === 'heading_1' &&
      MISSING_ITEMS_REGEX.test(
        block.heading_1.rich_text.map(t => t.plain_text).join('')
      )
    ) {
      missingHeadingIds.add(block.id)
    }
  }

  // ── 2단계: 블록 분류 및 그룹화 ─────────────────────────────────────

  // 블록을 순차 처리하여 그룹화
  const renderTasks: Array<
    | { kind: 'single'; block: BlockObjectResponse }
    | {
        kind: 'list'
        listType: 'ul' | 'ol'
        items: BlockObjectResponse[]
        key: string
      }
    | { kind: 'missing'; sectionBlocks: BlockObjectResponse[]; key: string }
  > = []

  // 미결 사항 섹션을 MissingItemsCollapsible 단위로 병합
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]

    // 미결 사항 heading_1 → 해당 섹션 블록들을 Collapsible로 묶기
    if (missingHeadingIds.has(block.id)) {
      // 다음 heading_1 또는 끝까지가 미결 사항 섹션
      const sectionStart = i + 1
      let sectionEnd = sectionStart
      while (sectionEnd < blocks.length) {
        const next = blocks[sectionEnd]
        if (next.type === 'heading_1' && !missingHeadingIds.has(next.id)) {
          break
        }
        sectionEnd++
      }
      const sectionBlocks = blocks.slice(sectionStart, sectionEnd)
      renderTasks.push({
        kind: 'missing',
        sectionBlocks,
        key: `missing-${block.id}`,
      })
      i = sectionEnd
      continue
    }

    // 미결 사항 섹션 내 블록은 Collapsible 내부에서 처리되므로 스킵
    if (missingBlockIds.has(block.id)) {
      i++
      continue
    }

    // list item 그룹화
    if (block.type === 'bulleted_list_item') {
      const groupStart = i
      const groupBlocks: BlockObjectResponse[] = []
      while (
        i < blocks.length &&
        blocks[i].type === 'bulleted_list_item' &&
        !missingBlockIds.has(blocks[i].id)
      ) {
        groupBlocks.push(blocks[i])
        i++
      }
      renderTasks.push({
        kind: 'list',
        listType: 'ul',
        items: groupBlocks,
        key: `ul-${blocks[groupStart].id}`,
      })
      continue
    }

    if (block.type === 'numbered_list_item') {
      const groupStart = i
      const groupBlocks: BlockObjectResponse[] = []
      while (
        i < blocks.length &&
        blocks[i].type === 'numbered_list_item' &&
        !missingBlockIds.has(blocks[i].id)
      ) {
        groupBlocks.push(blocks[i])
        i++
      }
      renderTasks.push({
        kind: 'list',
        listType: 'ol',
        items: groupBlocks,
        key: `ol-${blocks[groupStart].id}`,
      })
      continue
    }

    // 단일 블록
    renderTasks.push({ kind: 'single', block })
    i++
  }

  // ── 3단계: 비동기 렌더링 ───────────────────────────────────────────
  const nodes: ReactNode[] = []

  for (const task of renderTasks) {
    if (task.kind === 'single') {
      const node = await renderSingleBlock(task.block, depth)
      if (node !== null) nodes.push(node)
    } else if (task.kind === 'list') {
      const Tag = task.listType === 'ul' ? 'ul' : 'ol'
      const listItems = await Promise.all(
        task.items.map(item => renderSingleBlock(item, depth))
      )
      nodes.push(<Tag key={task.key}>{listItems}</Tag>)
    } else if (task.kind === 'missing') {
      // 미결 사항 섹션 → MissingItemsCollapsible
      const innerNode = await RenderBlocks({
        blocks: task.sectionBlocks,
        depth: depth + 1,
      })
      nodes.push(
        <MissingItemsCollapsible
          key={task.key}
          itemCount={task.sectionBlocks.length}
        >
          {innerNode}
        </MissingItemsCollapsible>
      )
    }
  }

  return <>{nodes}</>
}
