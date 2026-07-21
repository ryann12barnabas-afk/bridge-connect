'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineChartBar, HiOutlineUsers, HiOutlineCreditCard, HiOutlineFlag, HiOutlineHome,
} from 'react-icons/hi2'
import Logo from '@/components/ui/Logo'

const NAV = [
  { href: '/admin', label: 'Analytics', icon: HiOutlineChartBar },
  { href: '/admin/users', label: 'Users', icon: HiOutlineUsers },
  { href: '/admin/payments', label: 'Payments', icon: HiOutlineCreditCard },
  { href: '/admin/reports', label: 'Reports', icon: HiOutlineFlag },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-black/5 px-4 py-6 dark:border-white/10 lg:flex">
      <Logo />
      <p className="mt-1 px-1 text-xs font-semibold uppercase tracking-wide text-brand-purple">Admin</p>
      <nav className="mt-6 flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-bridge-gradient text-white shadow-glass' : 'text-brand-ink/70 hover:bg-brand-mist dark:text-white/70 dark:hover:bg-white/5'
              }`}
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </Link>
          )
        })}
      </nav>
      <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-ink/60 dark:text-white/60">
        <HiOutlineHome className="h-5 w-5" /> Back to app
      </Link>
    </aside>
  )
}
