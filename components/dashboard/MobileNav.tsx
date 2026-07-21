'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineHome, HiOutlineSparkles, HiOutlineChatBubbleLeftRight,
  HiOutlineBell, HiOutlineUserCircle,
} from 'react-icons/hi2'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: HiOutlineHome },
  { href: '/dashboard/meet', label: 'Meet', icon: HiOutlineSparkles },
  { href: '/dashboard/chat', label: 'Chats', icon: HiOutlineChatBubbleLeftRight },
  { href: '/dashboard/notifications', label: 'Alerts', icon: HiOutlineBell },
  { href: '/dashboard/profile', label: 'Profile', icon: HiOutlineUserCircle },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-black/5 px-2 py-2 dark:border-white/10 lg:hidden">
      {NAV.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium ${
              active ? 'text-brand-purple' : 'text-brand-ink/50 dark:text-white/50'
            }`}
          >
            <item.icon className="h-6 w-6" /> {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
