'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HiCheck } from 'react-icons/hi2'
import { SUBSCRIPTION_PRICES } from '@/lib/constants'
import { formatKsh } from '@/lib/utils'

const PLANS = [
  { id: 'weekly', label: 'Weekly', price: SUBSCRIPTION_PRICES.weekly, period: '/week', highlight: false },
  { id: 'monthly', label: 'Monthly', price: SUBSCRIPTION_PRICES.monthly, period: '/month', highlight: true },
  { id: 'yearly', label: 'Yearly', price: SUBSCRIPTION_PRICES.yearly, period: '/year', highlight: false },
]

const PERKS = [
  'Unlimited meetings', 'Unlimited chats', 'Priority profile visibility',
  'Verified badge', 'Unlimited friend requests', 'Exclusive premium badge',
]

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Simple, honest pricing</h2>
        <p className="mt-4 text-brand-ink/60 dark:text-white/60">
          Start free with 3 meets. Go premium anytime via M-Pesa.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`card relative p-8 ${plan.highlight ? 'ring-2 ring-brand-purple scale-[1.03]' : ''}`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-bridge-gradient px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}
            <h3 className="font-display text-lg font-semibold">{plan.label}</h3>
            <p className="mt-4">
              <span className="font-display text-4xl font-extrabold">{formatKsh(plan.price)}</span>
              <span className="text-brand-ink/50 dark:text-white/50">{plan.period}</span>
            </p>
            <ul className="mt-6 space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm">
                  <HiCheck className="h-4 w-4 shrink-0 text-brand-purple" /> {perk}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/subscription"
              className={`mt-8 block text-center ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
            >
              Subscribe
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-brand-ink/50 dark:text-white/50">
        Every new member gets 3 free meets before a subscription is required.
      </p>
    </section>
  )
}
