'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { HiCheck, HiOutlineShieldCheck } from 'react-icons/hi2'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { SUBSCRIPTION_PRICES } from '@/lib/constants'
import { formatKsh } from '@/lib/utils'
import { mpesaPhoneSchema } from '@/lib/validation'
import type { SubscriptionPlan, Payment } from '@/types'

const PLANS: { id: SubscriptionPlan; label: string; period: string }[] = [
  { id: 'weekly', label: 'Weekly', period: '7 days' },
  { id: 'monthly', label: 'Monthly', period: '30 days' },
  { id: 'yearly', label: 'Yearly', period: '365 days' },
]

const PERKS = [
  'Unlimited meetings', 'Unlimited chats', 'Video calling', 'Priority profile visibility',
  'Verified badge', 'Unlimited friend requests',
]

export default function SubscriptionPage() {
  const { user, firebaseUser, subscription } = useAuth()
  const [plan, setPlan] = useState<SubscriptionPlan>('weekly')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<Payment['status'] | null>(null)

  const isPremium = subscription?.status === 'active'

  useEffect(() => {
    if (!pendingPaymentId) return
    const unsub = onSnapshot(doc(db, 'payments', pendingPaymentId), (snap) => {
      if (!snap.exists()) return
      const payment = snap.data() as Payment
      setPaymentStatus(payment.status)
      if (payment.status === 'success') {
        toast.success('Payment received! Premium is now active.')
        setPendingPaymentId(null)
      } else if (payment.status === 'failed') {
        toast.error('Payment was not completed. Please try again.')
        setPendingPaymentId(null)
      }
    })
    return () => unsub()
  }, [pendingPaymentId])

  const handleSubscribe = async () => {
    const parsed = mpesaPhoneSchema.safeParse({ phoneNumber, plan })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Enter a valid phone number.')
      return
    }
    if (!firebaseUser) return

    setSubmitting(true)
    try {
      const idToken = await firebaseUser.getIdToken()
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ phoneNumber, plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment could not be started')

      toast.success(data.message || 'Check your phone to complete payment.')
      setPendingPaymentId(data.paymentId)
      setPaymentStatus('pending')
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isPremium) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card p-8 text-center">
          <HiOutlineShieldCheck className="mx-auto h-12 w-12 text-brand-purple" />
          <h1 className="mt-4 font-display text-xl font-bold">You&apos;re Premium</h1>
          <p className="mt-2 text-sm text-brand-ink/60 dark:text-white/60">
            Plan: <span className="font-semibold capitalize">{subscription?.plan}</span>
            <br />
            Expires: {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold">Go Premium</h1>
      <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">
        Unlock unlimited meetings, chats, and video calls with M-Pesa.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`card p-4 text-center transition-transform ${plan === p.id ? 'ring-2 ring-brand-purple' : ''}`}
          >
            <p className="text-xs font-medium text-brand-ink/50 dark:text-white/50">{p.label}</p>
            <p className="mt-1 font-display font-bold">{formatKsh(SUBSCRIPTION_PRICES[p.id])}</p>
            <p className="text-[10px] text-brand-ink/40 dark:text-white/40">{p.period}</p>
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-2">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-2 text-sm">
            <HiCheck className="h-4 w-4 text-brand-purple" /> {perk}
          </li>
        ))}
      </ul>

      <div className="card mt-6 p-6">
        <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">M-Pesa phone number</label>
        <input
          className="input-field mt-2"
          placeholder="07XXXXXXXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button
          onClick={handleSubscribe}
          disabled={submitting || paymentStatus === 'pending'}
          className="btn-primary mt-4 w-full"
        >
          {paymentStatus === 'pending'
            ? 'Waiting for M-Pesa confirmation…'
            : submitting
            ? 'Starting payment…'
            : `Pay ${formatKsh(SUBSCRIPTION_PRICES[plan])} with M-Pesa`}
        </button>
        {paymentStatus === 'pending' && (
          <p className="mt-3 text-center text-xs text-brand-ink/50 dark:text-white/50">
            Enter your M-Pesa PIN on your phone to confirm the payment.
          </p>
        )}
      </div>
    </div>
  )
}
