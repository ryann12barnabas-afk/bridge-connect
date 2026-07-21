'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteUser } from 'firebase/auth'
import toast from 'react-hot-toast'
import { HiOutlineMoon, HiOutlineSun, HiOutlineTrash } from 'react-icons/hi2'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { firebaseUser, signOut } = useAuth()
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDark((v) => !v)
  }

  const handleDeleteAccount = async () => {
    if (!firebaseUser) return
    try {
      await deleteUser(firebaseUser)
      toast.success('Account deleted.')
      router.push('/')
    } catch {
      toast.error('Please log out and log back in, then try again — this action requires a recent login.')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <div className="card flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          {dark ? <HiOutlineMoon className="h-5 w-5" /> : <HiOutlineSun className="h-5 w-5" />}
          <div>
            <p className="text-sm font-semibold">Dark mode</p>
            <p className="text-xs text-brand-ink/50 dark:text-white/50">Switch between light and dark themes</p>
          </div>
        </div>
        <button
          onClick={toggleDark}
          className={`h-7 w-12 rounded-full transition-colors ${dark ? 'bg-bridge-gradient' : 'bg-gray-200'}`}
        >
          <span className={`block h-5 w-5 translate-y-1 rounded-full bg-white transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold">Account</p>
        <p className="mt-1 text-xs text-brand-ink/50 dark:text-white/50">{firebaseUser?.email}</p>
        <button onClick={() => signOut()} className="btn-secondary mt-4 w-full !py-2.5 text-sm">
          Sign out
        </button>
      </div>

      <div className="card border-2 border-red-100 p-5 dark:border-red-500/20">
        <p className="text-sm font-semibold text-red-500">Danger zone</p>
        <p className="mt-1 text-xs text-brand-ink/50 dark:text-white/50">
          Deleting your account is permanent and removes your profile, matches, and messages.
        </p>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-red-500">
            <HiOutlineTrash /> Delete my account
          </button>
        ) : (
          <div className="mt-4 flex gap-3">
            <button onClick={() => setConfirming(false)} className="btn-secondary flex-1 !py-2 text-sm">Cancel</button>
            <button onClick={handleDeleteAccount} className="flex-1 rounded-full bg-red-500 py-2 text-sm font-semibold text-white">
              Confirm delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
