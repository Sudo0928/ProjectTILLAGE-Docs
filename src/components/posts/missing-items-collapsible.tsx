'use client'

/**
 * F017 Missing Items Collapsible 컴포넌트
 *
 * Notion heading_1 `# N. 미결 사항` 섹션을 접힘 토글로 래핑.
 * 기획자가 아직 결론 내리지 못한 항목을 별도 영역으로 분리하여
 * 비기획자 독자에게 "작업 중인 항목"임을 명확히 표시.
 *
 * 클라이언트 컴포넌트 — Radix UI Collapsible 인터랙션 필요.
 */

import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface MissingItemsCollapsibleProps {
  /** 미결 사항 섹션 본문 (RenderBlocks 재귀 결과) */
  children: ReactNode
  /** 미결 사항 개수 (Trigger 부제목으로 표시, 생략 가능) */
  itemCount?: number
  /** 추가 클래스명 */
  className?: string
}

/**
 * 미결 사항 접힘 토글
 *
 * defaultOpen={false}로 기본 접힘 상태.
 * ChevronDown 아이콘은 열림/닫힘 상태에 따라 회전 애니메이션.
 */
export function MissingItemsCollapsible({
  children,
  itemCount,
  className,
}: MissingItemsCollapsibleProps) {
  return (
    <Collapsible
      defaultOpen={false}
      className={cn('not-prose my-6', className)}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-900 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-100 dark:hover:bg-yellow-900/40 [&[data-state=open]>svg]:rotate-180">
        <span>🚧 기획자 작업 중</span>
        {itemCount !== undefined && (
          <span className="text-xs text-yellow-700 dark:text-yellow-300">
            ({itemCount}개 항목)
          </span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 rounded-md border border-yellow-100 bg-yellow-50/50 px-4 py-3 dark:border-yellow-900 dark:bg-yellow-950/10">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
