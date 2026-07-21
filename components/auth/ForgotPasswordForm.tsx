'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { forgotPasswordSchema } from '@/lib/validation'
import { resetPassword } from '@/lib/auth-actions'
import { z } from 'zod'

type FormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await resetPassword(data.email)
      setSent(true)
    } catch {
      // Avoid leaking whether an email exists — show a generic success state either way.
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold">Check your inbox</p>
        <p className="mt-2 text-sm text-brand-ink/60 dark:text-white/60">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <a href="/login" className="btn-secondary mt-6 inline-flex">Back to login</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input className="input-field" type="email" placeholder="Email address" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
        {submitting ? 'Sending…' : 'Send reset link'}
      </button>
      <p className="text-center text-sm text-brand-ink/60 dark:text-white/60">
        Remembered it? <a href="/login" className="font-semibold text-brand-blue">Log in</a>
      </p>
    </form>
  )
}
