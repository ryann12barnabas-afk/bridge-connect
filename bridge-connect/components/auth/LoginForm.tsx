'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import { loginSchema, type LoginInput } from '@/lib/validation'
import { loginWithEmail, loginWithGoogle } from '@/lib/auth-actions'

async function establishSession(user: { getIdToken: () => Promise<string> }) {
  const idToken = await user.getIdToken()
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
}

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const redirectAfterLogin = () => {
    const redirect = params.get('redirect') || '/dashboard'
    router.push(redirect)
  }

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true)
    try {
      const user = await loginWithEmail(data.email, data.password)
      await establishSession(user)
      toast.success('Welcome back!')
      redirectAfterLogin()
    } catch (err: any) {
      const message =
        err?.code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : 'Login failed. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const user = await loginWithGoogle()
      await establishSession(user)
      toast.success('Welcome back!')
      redirectAfterLogin()
    } catch {
      toast.error('Google sign-in failed.')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input className="input-field" type="email" placeholder="Email address" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="relative">
          <input
            className="input-field pr-10"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/40"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <HiEyeSlash /> : <HiEye />}
          </button>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="flex justify-end">
          <a href="/forgot-password" className="text-sm font-medium text-brand-blue">Forgot password?</a>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-brand-ink/40 dark:text-white/40">
        <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" /> OR <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
      </div>
      <button
        onClick={handleGoogle}
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
      >
        <FcGoogle className="h-5 w-5" /> Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-brand-ink/60 dark:text-white/60">
        New to Bridge Connect?{' '}
        <a href="/register" className="font-semibold text-brand-blue">Create an account</a>
      </p>
    </div>
  )
}
