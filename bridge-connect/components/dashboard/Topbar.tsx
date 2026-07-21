'use client'

import Link from 'next/link'
import { HiOutlineSparkles } from 'react-icons/hi2'
import { useAuth } from '@/hooks/useAuth'

export default function Topbar() {
  const { user, profile, subscription } = useAuth()
  const isPremium = subscription?.status === 'active'

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10 lg:px-8">
      <div>
        <p className="font-display text-sm font-semibold">
          Hi {user?.firstName || 'there'} 👋
        </p>
        <p className="text-xs text-brand-ink/50 dark:text-white/50">
          {profile?.town ? `${profile.town}, ${profile.county}` : 'Complete your profile'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isPremium ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-bridge-gradient px-3 py-1.5 text-xs font-semibold text-white">
            <HiOutlineSparkles /> Premium
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-blue dark:bg-white/10">
            {user?.freeMeetsRemaining ?? 0} free meets left
          </span>
        )}
        <Link href="/dashboard/profile" className="h-9 w-9 overflow-hidden rounded-full bg-bridge-gradient shrink-0" />
      </div>
    </header>
  )
}
