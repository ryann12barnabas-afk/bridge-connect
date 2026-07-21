'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiOutlineSparkles, HiOutlineXMark, HiOutlineHeart, HiOutlineMapPin,
  HiOutlineBriefcase, HiLockClosed,
} from 'react-icons/hi2'
import { useAuth } from '@/hooks/useAuth'
import {
  findMeetCandidate, createMeetRequest, consumeFreeMeet, hasMeetsAvailable,
} from '@/lib/meet'
import type { Profile, User, MeetPreferences } from '@/types'

export default function MeetPage() {
  const { user, profile, subscription } = useAuth()
  const router = useRouter()
  const [candidate, setCandidate] = useState<{ user: User; profile: Profile; score: number } | null>(null)
  const [seenUids, setSeenUids] = useState<string[]>([])
  const [searching, setSearching] = useState(false)
  const [connected, setConnected] = useState(false)

  const isPremium = subscription?.status === 'active'
  const freeMeetsLeft = user?.freeMeetsRemaining ?? 0
  const canMeet = isPremium || freeMeetsLeft > 0

  const handleFindMatch = async () => {
    if (!user || !profile) return
    if (!canMeet) {
      toast.error('You\'ve used all your free meetings.')
      return
    }

    setSearching(true)
    setConnected(false)
    try {
      const prefs: MeetPreferences = {
        ageMin: Math.max(18, profile.age - 8),
        ageMax: profile.age + 8,
        gender: profile.lookingFor,
        county: undefined, // search all counties by default for a bigger pool
        interests: profile.interests,
        relationshipIntent: profile.relationshipIntent,
      }
      const result = await findMeetCandidate(user.uid, prefs, seenUids)
      if (!result) {
        toast('No new matches nearby right now — try again shortly.', { icon: '🔍' })
        setCandidate(null)
      } else {
        setCandidate({ user: result.user, profile: result.profile, score: result.compatibilityScore })
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong finding a match.')
    } finally {
      setSearching(false)
    }
  }

  const handlePass = () => {
    if (!candidate) return
    setSeenUids((prev) => [...prev, candidate.user.uid])
    setCandidate(null)
  }

  const handleConnect = async () => {
    if (!candidate || !user) return
    try {
      await createMeetRequest(user.uid, candidate.user.uid, candidate.score)
      if (!isPremium) {
        await consumeFreeMeet(user.uid)
      }
      setConnected(true)
      toast.success('Request sent! We\'ll notify you if they accept.')
    } catch (err) {
      console.error(err)
      toast.error('Could not send request. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold">Meet Someone</h1>
        <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">
          {isPremium ? 'Unlimited meetings with Premium' : `${freeMeetsLeft} free meets remaining`}
        </p>
      </div>

      {!canMeet && (
        <div className="card p-6 text-center">
          <HiLockClosed className="mx-auto h-10 w-10 text-brand-purple" />
          <p className="mt-4 font-semibold">You have used all your free meetings.</p>
          <p className="mt-2 text-sm text-brand-ink/60 dark:text-white/60">
            Unlock unlimited connections for just KSh 300 per week.
          </p>
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className="btn-primary mt-6 w-full"
          >
            Unlock Unlimited Connections
          </button>
        </div>
      )}

      {canMeet && !candidate && !connected && (
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-bridge-gradient text-white">
            <HiOutlineSparkles className="h-8 w-8" />
          </span>
          <p className="text-sm text-brand-ink/60 dark:text-white/60">
            Tap below and we&apos;ll find someone compatible with you right now.
          </p>
          <button onClick={handleFindMatch} disabled={searching} className="btn-primary w-full">
            {searching ? 'Finding your match…' : 'Meet Someone'}
          </button>
        </div>
      )}

      {connected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <HiOutlineHeart className="mx-auto h-12 w-12 text-brand-purple" />
          <p className="mt-4 font-display font-semibold">Request sent to {candidate?.profile ? '' : ''}!</p>
          <p className="mt-2 text-sm text-brand-ink/60 dark:text-white/60">
            You&apos;ll get a notification the moment they respond. Meanwhile, keep exploring.
          </p>
          <button onClick={() => { setCandidate(null); setConnected(false) }} className="btn-secondary mt-6 w-full">
            Find someone else
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {candidate && !connected && (
          <motion.div
            key={candidate.user.uid}
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -100, rotate: -8 }}
            className="card overflow-hidden"
          >
            <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-brand-blueLight to-brand-purple">
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {candidate.score}% match
              </span>
            </div>
            <div className="p-5">
              <p className="font-display text-lg font-bold">
                {candidate.user.firstName}, {candidate.profile.age}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-brand-ink/60 dark:text-white/60">
                <HiOutlineMapPin className="h-4 w-4" /> {candidate.profile.town}, {candidate.profile.county}
              </p>
              {candidate.profile.occupation && (
                <p className="mt-1 flex items-center gap-1 text-sm text-brand-ink/60 dark:text-white/60">
                  <HiOutlineBriefcase className="h-4 w-4" /> {candidate.profile.occupation}
                </p>
              )}
              {candidate.profile.bio && (
                <p className="mt-3 text-sm text-brand-ink/70 dark:text-white/70">{candidate.profile.bio}</p>
              )}
              {candidate.profile.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {candidate.profile.interests.slice(0, 6).map((i) => (
                    <span key={i} className="rounded-full bg-brand-mist px-2.5 py-1 text-xs text-brand-blue dark:bg-white/10">
                      {i}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button onClick={handlePass} className="btn-secondary flex-1 !py-3">
                  <HiOutlineXMark className="h-5 w-5" /> Pass
                </button>
                <button onClick={handleConnect} className="btn-primary flex-1 !py-3">
                  <HiOutlineHeart className="h-5 w-5" /> Connect
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
