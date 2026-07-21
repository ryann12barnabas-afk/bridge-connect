'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { HiBars3, HiXMark } from 'react-icons/hi2'
import Logo from '@/components/ui/Logo'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-glass' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-ink/70 transition-colors hover:text-brand-blue dark:text-white/70 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-semibold text-brand-ink/80 hover:text-brand-blue dark:text-white/80">
            Login
          </Link>
          <Link href="/register" className="btn-primary !px-5 !py-2.5 text-sm">
            Join Now
          </Link>
        </div>

        <button
          className="text-2xl md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <HiXMark /> : <HiBars3 />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden glass md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium">
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-3">
                <Link href="/login" className="btn-secondary text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Join Now</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
