'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronDown } from 'react-icons/hi2'

const FAQS = [
  { q: 'Is Bridge Connect free?', a: 'Yes — every new member gets 3 free meets. After that, a subscription unlocks unlimited meets and chats.' },
  { q: 'How does M-Pesa payment work?', a: 'Enter your phone number, confirm the STK push prompt on your phone, and your premium features activate instantly.' },
  { q: 'Can I meet people via video call?', a: 'Yes — once you match with someone, you can start a secure video call directly from your chat.' },
  { q: 'Is my information safe?', a: 'We use Firebase security rules, encrypted connections, and never share your data with third parties.' },
  { q: 'Can I cancel my subscription?', a: 'Subscriptions simply expire after their period ends — there\'s no auto lock-in beyond what you choose to renew.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
      <div className="mt-10 space-y-3">
        {FAQS.map((item, i) => (
          <div key={item.q} className="card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left font-medium"
              aria-expanded={open === i}
            >
              {item.q}
              <HiChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-4 text-sm text-brand-ink/60 dark:text-white/60">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
