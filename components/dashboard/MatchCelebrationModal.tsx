'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Props {
  show: boolean
  otherName?: string
  otherGender?: string
  matchId?: string
  onClose: () => void
}

export default function MatchCelebrationModal({ show, otherName, otherGender, matchId, onClose }: Props) {
  const emoji = otherGender === 'female' ? '😊👩' : otherGender === 'male' ? '😊👨' : '😊'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-bridge-gradient p-6"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-full max-w-sm rounded-xl2 bg-white p-8 text-center shadow-glass"
          >
            <div className="text-6xl">{emoji}</div>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-brand-ink">It&apos;s a match!</h1>
            <p className="mt-2 text-sm text-brand-ink/60">
              You and {otherName || 'they'} liked each other. Good luck! 🍀
            </p>
            <div className="mt-8 flex flex-col gap-3">
              {matchId && (
                <Link href={`/dashboard/chat/${matchId}`} className="btn-primary w-full !py-3">
                  Say hello
                </Link>
              )}
              <button onClick={onClose} className="btn-secondary w-full !py-3">
                Keep swiping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
