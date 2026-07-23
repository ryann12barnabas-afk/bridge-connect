'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { HiOutlineHeart, HiLockClosed } from 'react-icons/hi2'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToLikesReceived, sendLike } from '@/lib/likes'
import MatchCelebrationModal from '@/components/dashboard/MatchCelebrationModal'
import type { Like, User, Profile } from '@/types'

interface EnrichedLike extends Like {
  fromUser?: User
  fromProfile?: Profile
}

export default function LikesPage() {
  const { user, subscription } = useAuth()
  const isPremium = subscription?.status === 'active'
  const [likes, setLikes] = useState<EnrichedLike[]>([])
  const [celebrate, setCelebrate] = useState<{ name: string; gender?: string; matchId: string } | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToLikesReceived(user.uid, async (rawLikes) => {
      if (!isPremium) {
        setLikes(rawLikes)
        return
      }
      const enriched = await Promise.all(
        rawLikes.map(async (l) => {
          const [uSnap, pSnap] = await Promise.all([
            getDoc(doc(db, 'users', l.fromUid)),
            getDoc(doc(db, 'profiles', l.fromUid)),
          ])
          return {
            ...l,
            fromUser: uSnap.exists() ? (uSnap.data() as User) : undefined,
            fromProfile: pSnap.exists() ? (pSnap.data() as Profile) : undefined,
          }
        })
      )
      setLikes(enriched)
    })
    return () => unsub()
  }, [user, isPremium])

  const handleLikeBack = async (like: EnrichedLike) => {
    if (!user) return
    try {
      const result = await sendLike(user.uid, like.fromUid, 70)
      if (result.matched && result.matchId) {
        setCelebrate({ name: like.fromUser?.firstName || 'them', gender: like.fromProfile?.gender, matchId: result.matchId })
      }
    } catch {
      toast.error('Could not like back right now.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Who Liked You</h1>
      <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">
        {likes.length} {likes.length === 1 ? 'person has' : 'people have'} liked you
      </p>

      {!isPremium && likes.length > 0 && (
        <div className="card mt-6 p-8 text-center">
          <HiLockClosed className="mx-auto h-10 w-10 text-brand-purple" />
          <p className="mt-3 font-semibold">See who likes you</p>
          <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">
            Upgrade to Premium to reveal their profiles and like them back instantly.
          </p>
          <a href="/dashboard/subscription" className="btn-primary mt-4 inline-flex">Upgrade to Premium</a>
        </div>
      )}

      {!isPremium && likes.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {likes.map((l) => (
            <div key={l.id} className="card overflow-hidden">
              <div className="aspect-square w-full bg-gradient-to-br from-brand-blueLight to-brand-purple blur-md" />
              <div className="p-3 text-center text-xs text-brand-ink/40 dark:text-white/40">Premium only</div>
            </div>
          ))}
        </div>
      )}

      {isPremium && likes.length === 0 && (
        <div className="card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <HiOutlineHeart className="h-10 w-10 text-brand-purple" />
          <p className="text-sm text-brand-ink/60 dark:text-white/60">No likes yet — keep your profile fresh!</p>
        </div>
      )}

      {isPremium && likes.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {likes.map((l) => (
            <div key={l.id} className="card flex items-center gap-3 p-4">
              <div className="h-14 w-14 shrink-0 rounded-full bg-bridge-gradient" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-sm">{l.fromUser?.firstName}, {l.fromProfile?.age}</p>
                <p className="truncate text-xs text-brand-ink/50 dark:text-white/50">{l.fromProfile?.town}</p>
              </div>
              <button onClick={() => handleLikeBack(l)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bridge-gradient text-white">
                <HiOutlineHeart className="h-4 w-4" />
              </button>
            </div>
          ))}
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
