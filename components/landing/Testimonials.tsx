'use client'

import { motion } from 'framer-motion'
import { HiStar } from 'react-icons/hi2'

const TESTIMONIALS = [
  { name: 'Wanjiru, 27', text: 'I matched with someone on Meet and we video-called the same evening. Six months later we\'re still together.' },
  { name: 'Otieno, 31', text: 'The free meets let me try it out before paying anything. Upgrading was an easy decision after that.' },
  { name: 'Achieng, 24', text: 'Verified badges make it so much easier to trust who I\'m talking to. Feels safer than other apps I\'ve used.' },
]

export default function Testimonials() {
  return (
    <section className="bg-brand-mist px-6 py-24 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Loved by our members</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="flex gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, s) => <HiStar key={s} className="h-4 w-4" />)}
              </div>
              <p className="mt-4 text-sm text-brand-ink/70 dark:text-white/70">&ldquo;{t.text}&rdquo;</p>
              <p className="mt-4 font-display text-sm font-semibold">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
