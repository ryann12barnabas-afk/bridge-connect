'use client'

import { motion } from 'framer-motion'
import {
  HiOutlineUserGroup, HiOutlineVideoCamera, HiOutlineShieldCheck,
  HiOutlineChatBubbleLeftRight, HiOutlineSparkles, HiOutlineMapPin,
} from 'react-icons/hi2'

const FEATURES = [
  { icon: HiOutlineSparkles, title: 'Smart Meet Matching', desc: 'Our AI pairs you with people based on age, location, interests, and what you\'re looking for.' },
  { icon: HiOutlineVideoCamera, title: 'Face-to-Face Video Calls', desc: 'Skip the guessing game — hop on a secure video call once you both match.' },
  { icon: HiOutlineChatBubbleLeftRight, title: 'Realtime Chat', desc: 'Typing indicators, read receipts, and image sharing keep conversations flowing.' },
  { icon: HiOutlineShieldCheck, title: 'Verified Profiles', desc: 'Optional ID verification and moderation keep the community genuine and safe.' },
  { icon: HiOutlineMapPin, title: 'People Nearby', desc: 'Discover new members and people near your town or county.' },
  { icon: HiOutlineUserGroup, title: 'Friends or Dating', desc: 'Set your intent — friendship, dating, or networking — and we\'ll match accordingly.' },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need to connect</h2>
        <p className="mt-4 text-brand-ink/60 dark:text-white/60">
          Bridge Connect blends smart matching with genuinely useful tools for meeting people.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="card p-6 transition-transform hover:-translate-y-1"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-bridge-gradient text-white">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-brand-ink/60 dark:text-white/60">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
