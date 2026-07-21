'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineVideoCamera, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bridge-radial pt-16 pb-24">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-blueLight/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full bg-brand-purple/30 blur-3xl animate-float [animation-delay:1.5s]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 text-xs font-semibold text-brand-purple shadow-glass backdrop-blur dark:bg-white/10">
            <HiOutlineSparkles /> Real people. Real connections.
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Connecting Hearts.
            <br />
            <span className="bg-bridge-gradient bg-clip-text text-transparent">Building Friendships.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-brand-ink/70 dark:text-white/70">
            Bridge Connect helps you meet new friends, find someone special, and talk face-to-face
            with video calls — all in one premium, safe space built for genuine connection.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary">Join Now</Link>
            <Link href="/dashboard/meet" className="btn-secondary">Meet Someone</Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-brand-ink/60 dark:text-white/60">
            <div className="flex items-center gap-2"><HiOutlineChatBubbleLeftRight className="text-brand-blue" /> Realtime chat</div>
            <div className="flex items-center gap-2"><HiOutlineVideoCamera className="text-brand-purple" /> Video calls</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="card animate-float p-6">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-blueLight to-brand-purple" />
            <div className="mt-4">
              <p className="font-display text-lg font-bold">Amara, 26</p>
              <p className="text-sm text-brand-ink/60 dark:text-white/60">Nairobi · Dating · Loves music & travel</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="btn-secondary flex-1 !py-2 text-sm">Pass</button>
              <button className="btn-primary flex-1 !py-2 text-sm">Connect</button>
            </div>
          </div>
          <div className="card absolute -bottom-6 -left-8 w-40 -rotate-6 p-3 shadow-glass hidden sm:block">
            <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue" />
            <p className="mt-2 text-xs font-semibold">New match! 🎉</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
