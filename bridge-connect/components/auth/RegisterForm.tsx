'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2'
import { registerSchema, type RegisterInput } from '@/lib/validation'
import { registerUser, loginWithGoogle } from '@/lib/auth-actions'
import { INTERESTS_LIST, KENYA_COUNTIES } from '@/lib/utils'

const STEPS = ['Account', 'About You', 'Preferences'] as const

export default function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { interests: [], relationshipStatus: 'single', lookingFor: 'everyone' },
    mode: 'onBlur',
  })

  const interests = watch('interests') || []

  const fieldsByStep: (keyof RegisterInput)[][] = [
    ['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'password', 'confirmPassword'],
    ['age', 'gender', 'country', 'county', 'town', 'bio'],
    ['lookingFor', 'relationshipStatus', 'occupation', 'education', 'interests'],
  ]

  const nextStep = async () => {
    const valid = await trigger(fieldsByStep[step])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const toggleInterest = (interest: string) => {
    const current = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest]
    setValue('interests', current)
  }

  const onSubmit = async (data: RegisterInput) => {
    setSubmitting(true)
    try {
      await registerUser(data)
      toast.success('Account created! Check your email to verify.')
      router.push('/verify-email')
    } catch (err: any) {
      const message =
        err?.code === 'auth/email-already-in-use'
          ? 'That email is already registered.'
          : err?.message || 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
      toast.success('Welcome to Bridge Connect!')
      router.push('/dashboard')
    } catch {
      toast.error('Google sign-in failed. Please try again.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-bridge-gradient' : 'bg-gray-200 dark:bg-white/10'
              }`}
            />
          </div>
        ))}
      </div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-purple">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input className="input-field" placeholder="First name" {...register('firstName')} />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
                <div>
                  <input className="input-field" placeholder="Last name" {...register('lastName')} />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <input className="input-field" placeholder="Username" {...register('username')} />
                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
              </div>
              <div>
                <input className="input-field" type="email" placeholder="Email address" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <input className="input-field" placeholder="Phone number (07XXXXXXXX)" {...register('phoneNumber')} />
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
              </div>
              <div>
                <input className="input-field" type="password" placeholder="Password" {...register('password')} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <input className="input-field" type="password" placeholder="Confirm password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input className="input-field" type="number" placeholder="Age" {...register('age')} />
                  {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age.message}</p>}
                </div>
                <div>
                  <select className="input-field" {...register('gender')}>
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
                </div>
              </div>
              <div>
                <input className="input-field" placeholder="Country" defaultValue="Kenya" {...register('country')} />
                {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select className="input-field" {...register('county')}>
                    <option value="">County</option>
                    {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.county && <p className="mt-1 text-xs text-red-500">{errors.county.message}</p>}
                </div>
                <div>
                  <input className="input-field" placeholder="Town" {...register('town')} />
                  {errors.town && <p className="mt-1 text-xs text-red-500">{errors.town.message}</p>}
                </div>
              </div>
              <div>
                <textarea className="input-field" rows={3} placeholder="Short bio (optional)" {...register('bio')} />
                {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Looking for</label>
                <select className="input-field mt-1" {...register('lookingFor')}>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                  <option value="everyone">Everyone</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Relationship status</label>
                <select className="input-field mt-1" {...register('relationshipStatus')}>
                  <option value="single">Single</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="complicated">It&apos;s complicated</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input className="input-field" placeholder="Occupation" {...register('occupation')} />
                <input className="input-field" placeholder="Education" {...register('education')} />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Interests</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((interest) => (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        interests.includes(interest)
                          ? 'border-brand-purple bg-brand-purple text-white'
                          : 'border-gray-200 text-brand-ink/70 dark:border-white/10 dark:text-white/70'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary flex-1 !py-2.5 text-sm"
            >
              <HiArrowLeft /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary flex-1 !py-2.5 text-sm">
              Continue <HiArrowRight />
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-primary flex-1 !py-2.5 text-sm">
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          )}
        </div>
      </form>

      {step === 0 && (
        <>
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
        </>
      )}

      <p className="mt-6 text-center text-sm text-brand-ink/60 dark:text-white/60">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-brand-blue">Log in</a>
      </p>
    </div>
  )
}
