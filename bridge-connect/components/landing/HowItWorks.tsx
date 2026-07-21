'use client'

import { motion } from 'framer-motion'

const STEPS = [
  { title: 'Create your profile', desc: 'Tell us about yourself, your interests, and what you\'re looking for.' },
  { title: 'Tap Meet Someone', desc: 'We instantly match you with a compatible person nearby.' },
  { title: 'Chat or go video', desc: 'Break the ice by chat, then move to a video call when you\'re ready.' },
  { title: 'Build the connection', desc: 'Keep chatting, meet more people, and build genuine relationships.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-brand-mist px-6 py-24 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mt-4 text-brand-ink/60 dark:text-white/60">Four simple steps to your next connection.</p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <span className="font-display text-4xl font-extrabold text-brand-blue/20 dark:text-white/10">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-display font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-brand-ink/60 dark:text-white/60">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
