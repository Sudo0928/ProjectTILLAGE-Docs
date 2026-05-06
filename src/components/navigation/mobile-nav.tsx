'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { title: '홈', href: '/' },
  { title: '카테고리', href: '/categories' },
]

interface MobileNavProps {
  onClose: () => void
}

/**
 * 모바일용 네비게이션 (Sheet 안에서 렌더링)
 * F011: 반응형 환경에서 카테고리 메뉴 및 검색 진입점 제공
 */
export function MobileNav({ onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col space-y-3 pt-6">
      <div className="px-2">
        <h2 className="mb-2 px-2 text-lg font-semibold">메뉴</h2>
        <Separator className="mb-4" />
        <div className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md px-2 py-1.5 text-sm leading-none font-medium no-underline transition-colors outline-none select-none',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-accent text-accent-foreground'
                  : ''
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
