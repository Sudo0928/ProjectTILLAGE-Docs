/**
 * F017 Table Cell Badge 컴포넌트
 *
 * Notion 표 셀 내 `[확정]` / `[임시]` 텍스트를 시각적 배지로 변환.
 * success(확정) → 초록, warning(임시) → 노랑 계열.
 *
 * 서버 컴포넌트 — JavaScript 불필요, 상호작용 없음.
 * RenderBlocks의 renderTableCell()이 [확정]/[임시] 분리 후 이 컴포넌트를 호출.
 */

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** 배지 변형 — success: 확정 상태(초록), warning: 임시 상태(노랑) */
type BadgeVariant = 'success' | 'warning'

interface TableCellBadgeProps {
  /** 배지 변형 (확정/임시 상태 구분) */
  variant: BadgeVariant
  /** 배지 내부 텍스트 또는 요소 */
  children: ReactNode
}

/** 변형별 클래스 매핑 */
const variantClassMap: Record<BadgeVariant, string> = {
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
}

/**
 * 인라인 배지 컴포넌트
 *
 * 표 셀 내 인라인 표시를 위해 `inline-flex` 사용.
 * prose 영역 내에서도 배지 스타일이 유지됨.
 */
export function TableCellBadge({ variant, children }: TableCellBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium',
        variantClassMap[variant]
      )}
    >
      {children}
    </span>
  )
}
