'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'
import Logo from './Logo'

const STORAGE_KEY = 'bc_age_verified'

export default function AgeGate() {
  const [status, setStatus] = useState<'checking' | 'verified' | 'unverified' | 'blocked'>('checking')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (stored === 'true') {
      setStatus('verified')
    } else if (stored === 'false') {
      setStatus('blocked')
    } else {
      setStatus('unverified')
    }
  }, [])

  const handleConfirm = (isAdult: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(isAdult))
    setStatus(isAdult ? 'verified' : 'blocked')
  }

  if (status === 'checking' || status === 'verified') return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-ink p-6">
      <AnimatePresence mode="wait">
        {status === 'unverified' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm rounded-xl2 bg-white p-8 text-center shadow-glass"
          >
            <div className="flex justify-center"><Logo /></div>
            <h1 className="mt-6 font-display text-xl font-bold text-brand-ink">
              Age Verification
            </h1>
            <p className="mt-3 text-sm text-brand-ink/60">
              Bridge Connect is a platform for adults. You must be 18 years or older to continue.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => handleConfirm(true)}
                className="btn-primary w-full !py-3"
              >
                Yes, I am 18+ years
              </button>
              <button
                onClick={() => handleConfirm(false)}
                className="w-full rounded-full border-2 border-gray-200 py-3 font-semibold text-brand-ink/70"
              >
                No, I am below 18 years
              </button>
            </div>
          </motion.div>
        )}

        {status === 'blocked' && (
          <motion.div
            key="blocked"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-xl2 bg-white p-8 text-center shadow-glass"
          >
            <HiOutlineExclamationTriangle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="mt-4 font-display text-xl font-bold text-brand-ink">
              Access Restricted
            </h1>
            <p className="mt-3 text-sm text-brand-ink/60">
              Bridge Connect is only available to users 18 years and older. Please come back once
              you meet the age requirement.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  }
