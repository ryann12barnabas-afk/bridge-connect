'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlinePhone, HiOutlinePhoneXMark } from 'react-icons/hi2'
import type { VideoCallSession } from '@/types'

interface Props {
  session: VideoCallSession | null
  callerName?: string
  onAccept: () => void
  onDecline: () => void
}

export default function IncomingCallModal({ session, callerName, onAccept, onDecline }: Props) {
  return (
    <AnimatePresence>
      {session && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] grid place-items-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="card w-full max-w-sm p-8 text-center"
          >
            <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-bridge-gradient" />
            <p className="mt-4 font-display text-lg font-bold">{callerName || 'Someone'} is calling…</p>
            <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">Incoming video call</p>

            <div className="mt-8 flex justify-center gap-6">
              <button
                onClick={onDecline}
                className="grid h-14 w-14 place-items-center rounded-full bg-red-500 text-white"
                aria-label="Decline call"
              >
                <HiOutlinePhoneXMark className="h-6 w-6" />
              </button>
              <button
                onClick={onAccept}
                className="grid h-14 w-14 place-items-center rounded-full bg-green-500 text-white"
                aria-label="Accept call"
              >
                <HiOutlinePhone className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
