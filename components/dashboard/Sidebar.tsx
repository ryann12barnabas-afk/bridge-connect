'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HiOutlineHome, HiOutlineUserCircle, HiOutlineSparkles, HiOutlineUsers,
  HiOutlineChatBubbleLeftRight, HiOutlineBell, HiOutlineCog6Tooth,
  HiOutlineMapPin, HiOutlineStar, HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: HiOutlineHome },
  { href: '/dashboard/meet', label: 'Meet Someone', icon: HiOutlineSparkles },
  { href: '/dashboard/matches', label: 'Matches', icon: HiOutlineUsers },
  { href: '/dashboard/chat', label: 'Chats', icon: HiOutlineChatBubbleLeftRight },
  { href: '/dashboard/nearby', label: 'People Nearby', icon: HiOutlineMapPin },
  { href: '/dashboard/notifications', label: 'Notifications', icon: HiOutlineBell },
  { href: '/dashboard/subscription', label: 'Subscription', icon: HiOutlineStar },
  { href: '/dashboard/profile', label: 'Profile', icon: HiOutlineUserCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    await signOut()
    router.push('/')
  }

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-black/5 px-4 py-6 dark:border-white/10 lg:flex">
      <Logo />
      <nav className="mt-8 flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-bridge-gradient text-white shadow-glass'
                  : 'text-brand-ink/70 hover:bg-brand-mist dark:text-white/70 dark:hover:bg-white/5'
              }`}
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/10">
        <p className="truncate px-3 text-xs text-brand-ink/50 dark:text-white/50">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <HiOutlineArrowRightOnRectangle className="h-5 w-5" /> Sign out
        </button>
      </div>
    </aside>
  )
}
