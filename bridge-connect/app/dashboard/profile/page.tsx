'use client'

import { HiOutlineShieldCheck } from 'react-icons/hi2'
import { useAuth } from '@/hooks/useAuth'
import ProfileEditForm from '@/components/dashboard/ProfileEditForm'

export default function ProfilePage() {
  const { user, profile } = useAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Your profile</h1>
        <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">
          Keep this up to date — an accurate profile gets better matches.
        </p>
      </div>

      <div className="card flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-semibold">Profile completion</p>
          <p className="text-xs text-brand-ink/50 dark:text-white/50">
            {user?.profileCompletionPercent ?? 0}% complete
          </p>
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
          <div
            className="h-full bg-bridge-gradient"
            style={{ width: `${user?.profileCompletionPercent ?? 0}%` }}
          />
        </div>
      </div>

      {profile?.isVerified && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-mist px-4 py-3 text-sm font-medium text-brand-blue dark:bg-white/5">
          <HiOutlineShieldCheck className="h-5 w-5" /> Your profile is verified
        </div>
      )}

      <div className="card p-6">
        <ProfileEditForm />
      </div>
    </div>
  )
}
