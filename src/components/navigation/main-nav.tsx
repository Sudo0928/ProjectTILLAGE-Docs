'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
}

/**
 * 데스크톱용 메인 네비게이션
 * F011: 카테고리 메뉴 제공 (카테고리 페이지가 구현되면 동적 항목으로 교체 예정)
 */
const navItems: NavItem[] = [
  { title: '홈', href: '/' },
  { title: '카테고리', href: '/categories' },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'hover:text-primary text-sm font-medium transition-colors',
            pathname === item.href || pathname.startsWith(item.href + '/')
              ? 'text-foreground'
              : 'text-foreground/60'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
