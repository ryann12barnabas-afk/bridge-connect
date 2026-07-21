'use client'

import { useEffect, useState } from 'react'
import { sendEmailVerification } from 'firebase/auth'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { HiOutlineEnvelopeOpen } from 'react-icons/hi2'

export default function VerifyEmailPage() {
  const { firebaseUser } = useAuth()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const resend = async () => {
    if (!firebaseUser || cooldown > 0) return
    try {
      await sendEmailVerification(firebaseUser)
      toast.success('Verification email sent.')
      setCooldown(30)
    } catch {
      toast.error('Could not send email. Try again shortly.')
    }
  }

  return (
    <AuthLayout title="Verify your email" subtitle="One last step before you start connecting.">
      <div className="card p-6 text-center">
        <HiOutlineEnvelopeOpen className="mx-auto h-10 w-10 text-brand-purple" />
        <p className="mt-4 text-sm text-brand-ink/70 dark:text-white/70">
          We&apos;ve sent a verification link to{' '}
          <span className="font-semibold">{firebaseUser?.email || 'your email'}</span>. Click it, then
          come back and log in.
        </p>
        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="btn-primary mt-6 w-full !py-2.5 text-sm"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
        </button>
        <a href="/login" className="mt-4 block text-sm font-semibold text-brand-blue">Back to login</a>
      </div>
    </AuthLayout>
  )
}
