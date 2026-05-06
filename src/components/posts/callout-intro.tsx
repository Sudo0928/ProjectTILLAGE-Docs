/**
 * F017 Callout Intro 컴포넌트
 *
 * Notion callout 블록 중 icon.emoji === '💡'인 경우 렌더링되는 특별 인트로 박스.
 * 파란 배경 + 💡 아이콘으로 비기획자에게 "이 글의 핵심 요약"임을 시각적으로 알림.
 *
 * 서버 컴포넌트 — JavaScript 불필요, 상호작용 없음.
 */

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface CalloutIntroProps {
  /** 렌더링할 자식 요소 (RenderBlocks가 주입하는 rich_text 변환 결과) */
  children: ReactNode
  /** 추가 클래스명 */
  className?: string
}

/**
 * 인트로 콜아웃 박스
 *
 * prose 컨텍스트 내에서도 독립적인 스타일을 유지하기 위해 `not-prose` 클래스 적용.
 * 파란 배경 + 좌측 💡 아이콘 레이아웃.
 */
export function CalloutIntro({ children, className }: CalloutIntroProps) {
  return (
    <div
      className={cn(
        'not-prose my-4 flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30',
        className
      )}
    >
      {/* 좌측 아이콘 영역 */}
      <span className="shrink-0 text-lg leading-relaxed" aria-hidden="true">
        💡
      </span>
      {/* 본문 텍스트 영역 */}
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-blue-900 dark:text-blue-100">
        {children}
      </div>
    </div>
  )
}
