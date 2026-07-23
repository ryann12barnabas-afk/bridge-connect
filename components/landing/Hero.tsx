'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineVideoCamera, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'

const BACKGROUND_IMAGES = [
  '/images/hero-couple-1.jpg',
  '/images/hero-friends-1.jpg',
  '/images/hero-couple-2.jpg',
  '/images/hero-friends-2.jpg',
]

const FLOATING_HEARTS = ['💕', '❤️', '💞', '💘', '💖']

export default function Hero() {
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setBgIndex((i) => (i + 1) % BACKGROUND_IMAGES.length)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative isolate overflow-hidden pt-16 pb-24">
      {/* Rotating background photos */}
      <div className="absolute inset-0 -z-20">
        <AnimatePresence>
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={BACKGROUND_IMAGES[bgIndex]}
              alt=""
              fill
              priority={bgIndex === 0}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Dark + brand-tinted overlay so text stays readable on any photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/70 via-brand-ink/60 to-brand-ink/80" />
        <div className="absolute inset-0 bg-bridge-radial opacity-60" />
      </div>

      {/* Floating heart emojis */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {FLOATING_HEARTS.map((heart, i) => (
          <span
            key={i}
            className="absolute animate-float text-2xl opacity-40 sm:text-3xl"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + i}s`,
            }}
          >
            {heart}
          </span>
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white shadow-glass backdrop-blur">
            <HiOutlineSparkles /> Real people. Real connections.
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Connecting Hearts.
            <br />
            <span className="bg-gradient-to-r from-brand-blueLight to-brand-purple bg-clip-text text-transparent">
              Building Friendships.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/80">
            Bridge Connect helps you meet new friends, find someone special, and talk face-to-face
            with video calls — all in one premium, safe space built for genuine connection.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary">Join Now</Link>
            <Link href="/dashboard/meet" className="rounded-full border-2 border-white/60 px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-brand-ink">
              Meet Someone
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2"><HiOutlineChatBubbleLeftRight /> Realtime chat</div>
            <div className="flex items-center gap-2"><HiOutlineVideoCamera /> Video calls</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="card animate-float bg-white/95 p-6">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-blueLight to-brand-purple" />
            <div className="mt-4">
              <p className="font-display text-lg font-bold">Amara, 26</p>
              <p className="text-sm text-brand-ink/60">Nairobi · Dating · Loves music & travel</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="btn-secondary flex-1 !py-2 text-sm">Pass</button>
              <button className="btn-primary flex-1 !py-2 text-sm">Connect</button>
            </div>
          </div>
          <div className="card absolute -bottom-6 -left-8 hidden w-40 -rotate-6 bg-white/95 p-3 shadow-glass sm:block">
            <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue" />
            <p className="mt-2 text-xs font-semibold">New match! 🎉</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
            }
