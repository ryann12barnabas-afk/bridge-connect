'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineUsers, HiOutlineChatBubbleLeftRight, HiOutlineStar,
} from 'react-icons/hi2'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardOverview() {
  const { user, profile, subscription } = useAuth()
  const isPremium = subscription?.status === 'active'

  const STATS = [
    { label: 'Profile completion', value: `${user?.profileCompletionPercent ?? 0}%` },
    { label: 'Free meets left', value: isPremium ? '∞' : user?.freeMeetsRemaining ?? 0 },
    { label: 'Membership', value: isPremium ? 'Premium' : 'Free' },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden bg-bridge-gradient p-8 text-white"
      >
        <h1 className="font-display text-2xl font-bold">
          Welcome back, {user?.firstName || 'friend'} 👋
        </h1>
        <p className="mt-2 max-w-md text-white/80">
          {profile?.bio ? profile.bio : 'Finish setting up your profile to start getting better matches.'}
        </p>
        <Link href="/dashboard/meet" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-blue">
          Meet Someone
        </Link>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs font-medium text-brand-ink/50 dark:text-white/50">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/dashboard/meet', label: 'Meet Someone', icon: HiOutlineSparkles },
          { href: '/dashboard/matches', label: 'Your Matches', icon: HiOutlineUsers },
          { href: '/dashboard/chat', label: 'Chats', icon: HiOutlineChatBubbleLeftRight },
          { href: '/dashboard/subscription', label: 'Go Premium', icon: HiOutlineStar },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card flex items-center gap-3 p-5 transition-transform hover:-translate-y-0.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-bridge-gradient text-white">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
