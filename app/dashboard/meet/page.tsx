'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiOutlineXMark, HiOutlineHeart, HiOutlineMapPin, HiOutlineBriefcase, HiLockClosed, HiOutlineEyeSlash,
} from 'react-icons/hi2'
import { useAuth } from '@/hooks/useAuth'
import { findMeetCandidatesBatch } from '@/lib/meet'
import { sendLike, recordPass, getLikedUids, getPassedUids, subscribeToLikesReceived } from '@/lib/likes'
import { canSendLike, consumeDailyLike } from '@/lib/dailyLimit'
import MatchCelebrationModal from '@/components/dashboard/MatchCelebrationModal'
import type { Profile, User } from '@/types'

interface Candidate { user: User; profile: Profile; compatibilityScore: number }

export default function MeetPage() {
  const { user, profile, subscription } = useAuth()
  const router = useRouter()
  const [deck, setDeck] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [likesReceivedCount, setLikesReceivedCount] = useState(0)
  const [celebrate, setCelebrate] = useState<{ name: string; gender?: string; matchId: string } | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  const isPremium = subscription?.status === 'active'

  const loadDeck = useCallback(async () => {
    if (!user || !profile) return
    setLoading(true)
    try {
      const [likedUids, passedUids] = await Promise.all([
        getLikedUids(user.uid),
        getPassedUids(user.uid),
      ])
      const exclude = [...likedUids, ...passedUids]
      const prefs = {
        ageMin: Math.max(18, profile.age - 8),
        ageMax: profile.age + 8,
        gender: profile.lookingFor,
        interests: profile.interests,
        relationshipIntent: profile.relationshipIntent,
      }
      const candidates = await findMeetCandidatesBatch(user.uid, prefs, exclude, 20)
      setDeck(candidates)
    } catch (err) {
      console.error(err)
      toast.error('Could not load new people right now.')
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => { loadDeck() }, [loadDeck])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToLikesReceived(user.uid, (likes) => setLikesReceivedCount(likes.length))
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user) return
    setLimitReached(!canSendLike(user, isPremium))
  }, [user, isPremium])

  const handleSwipe = async (direction: 'left' | 'right', candidate: Candidate) => {
    setDeck((prev) => prev.filter((c) => c.user.uid !== candidate.user.uid))
    if (!user) return

    if (direction === 'left') {
      recordPass(user.uid, candidate.user.uid).catch(() => {})
      return
    }

    if (!canSendLike(user, isPremium)) {
      setLimitReached(true)
      toast.error("You've reached today's limit. Upgrade for unlimited likes.")
      return
    }

    try {
      const result = await sendLike(user.uid, candidate.user.uid, candidate.compatibilityScore)
      await consumeDailyLike(user.uid, user, isPremium)

      if (result.matched && result.matchId) {
        setCelebrate({ name: candidate.user.firstName, gender: candidate.profile.gender, matchId: result.matchId })
      } else {
        toast.success("Liked! We'll let you know if they like you back.")
      }
    } catch (err) {
      console.error(err)
      toast.error('Could not send that like. Please try again.')
    }
  }

  const visibleDeck = deck.slice(0, 3)

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Meet Someone</h1>
          <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">
            Swipe to find your people
          </p>
        </div>
        <Link
          href="/dashboard/likes"
          className="relative flex items-center gap-1.5 rounded-full bg-brand-mist px-3 py-2 text-xs font-semibold text-brand-blue dark:bg-white/10"
        >
          <HiOutlineHeart className="h-4 w-4" />
          {likesReceivedCount}
          {!isPremium && <HiOutlineEyeSlash className="h-3.5 w-3.5" />}
        </Link>
      </div>

      {loading && (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
          <p className="text-sm text-brand-ink/50 dark:text-white/50">Finding people for you…</p>
        </div>
      )}

      {!loading && deck.length === 0 && (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <HiOutlineHeart className="h-10 w-10 text-brand-purple" />
          <p className="font-semibold">No new people right now</p>
          <p className="text-sm text-brand-ink/60 dark:text-white/60">Check back soon, or refresh to try again.</p>
          <button onClick={loadDeck} className="btn-primary mt-2">Refresh</button>
        </div>
      )}

      {!loading && deck.length > 0 && (
        <div className="relative h-[520px]">
          <AnimatePresence>
            {visibleDeck.slice().reverse().map((candidate, i) => (
              <SwipeCard
                key={candidate.user.uid}
                candidate={candidate}
                isTop={i === visibleDeck.length - 1}
                onSwipe={(dir) => handleSwipe(dir, candidate)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && deck.length > 0 && (
        <div className="mt-6 flex justify-center gap-6">
          <button
            onClick={() => handleSwipe('left', deck[0])}
            className="grid h-14 w-14 place-items-center rounded-full bg-white text-gray-400 shadow-glass"
            aria-label="Pass"
          >
            <HiOutlineXMark className="h-6 w-6" />
          </button>
          <button
            onClick={() => handleSwipe('right', deck[0])}
            className="grid h-14 w-14 place-items-center rounded-full bg-bridge-gradient text-white shadow-glass"
            aria-label="Like"
          >
            <HiOutlineHeart className="h-6 w-6" />
          </button>
        </div>
      )}

      {limitReached && (
        <div className="card mt-6 p-5 text-center">
          <HiLockClosed className="mx-auto h-6 w-6 text-brand-purple" />
          <p className="mt-2 text-sm font-semibold">You've reached today's like limit.</p>
          <p className="mt-1 text-xs text-brand-ink/50 dark:text-white/50">It renews tomorrow morning, or upgrade now for unlimited likes.</p>
          <button onClick={() => router.push('/dashboard/subscription')} className="btn-primary mt-4 w-full !py-2.5 text-sm">
            Unlock Unlimited Connections
          </button>
        </div>
      )}

      <MatchCelebrationModal
        show={!!celebrate}
        otherName={celebrate?.name}
        otherGender={celebrate?.gender}
        matchId={celebrate?.matchId}
        onClose={() => setCelebrate(null)}
      />
    </div>
  )
}

function SwipeCard({
  candidate, isTop, onSwipe,
}: { candidate: Candidate; isTop: boolean; onSwipe: (dir: 'left' | 'right') => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const likeOpacity = useTransform(x, [20, 120], [0, 1])
  const passOpacity = useTransform(x, [-120, -20], [1, 0])

  return (
    <motion.div
      className="card absolute inset-0 overflow-hidden"
      style={{ x, rotate, zIndex: isTop ? 10 : 1 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe('right')
        else if (info.offset.x < -120) onSwipe('left')
      }}
      animate={isTop ? { scale: 1, y: 0 } : { scale: 0.96, y: 10 }}
      exit={{ x: x.get() > 0 ? 300 : -300, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-brand-blueLight to-brand-purple">
        {isTop && (
          <>
            <motion.span
              style={{ opacity: likeOpacity }}
              className="absolute left-4 top-4 rotate-[-15deg] rounded-lg border-4 border-green-400 px-3 py-1 text-lg font-extrabold text-green-400"
            >
              LIKE
            </motion.span>
            <motion.span
              style={{ opacity: passOpacity }}
              className="absolute right-4 top-4 rotate-[15deg] rounded-lg border-4 border-red-400 px-3 py-1 text-lg font-extrabold text-red-400"
            >
              PASS
            </motion.span>
          </>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {candidate.compatibilityScore}% match
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
            {candidate.profile.interests.slice(0, 5).map((i) => (
              <span key={i} className="rounded-full bg-brand-mist px-2.5 py-1 text-xs text-brand-blue dark:bg-white/10">
                {i}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
