'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { respondToMeetRequest } from '@/lib/meet'
import type { Match, User, Profile } from '@/types'
import toast from 'react-hot-toast'
import { HiOutlineUsers, HiCheck, HiXMark } from 'react-icons/hi2'

interface EnrichedMatch extends Match {
  otherUser?: User
  otherProfile?: Profile
}

export default function MatchesPage() {
  const { user } = useAuth()
  const [incoming, setIncoming] = useState<EnrichedMatch[]>([])
  const [accepted, setAccepted] = useState<EnrichedMatch[]>([])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'matches'), where('users', 'array-contains', user.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match))
      const enrich = async (m: Match): Promise<EnrichedMatch> => {
        const otherUid = m.users.find((u) => u !== user.uid)!
        const [uSnap, pSnap] = await Promise.all([
          getDoc(doc(db, 'users', otherUid)),
          getDoc(doc(db, 'profiles', otherUid)),
        ])
        return {
          ...m,
          otherUser: uSnap.exists() ? (uSnap.data() as User) : undefined,
          otherProfile: pSnap.exists() ? (pSnap.data() as Profile) : undefined,
        }
      }

      const pendingForMe = all.filter((m) => m.status === 'pending' && m.initiatedBy !== user.uid)
      const activeOnes = all.filter((m) => m.status === 'accepted')

      setIncoming(await Promise.all(pendingForMe.map(enrich)))
      setAccepted(await Promise.all(activeOnes.map(enrich)))
    })
    return () => unsub()
  }, [user])

  const handleRespond = async (matchId: string, accept: boolean) => {
    try {
      await respondToMeetRequest(matchId, accept)
      toast.success(accept ? 'It\'s a match! 🎉' : 'Request declined.')
    } catch {
      toast.error('Could not respond right now.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Matches</h1>
      </div>

      {incoming.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-brand-ink/60 dark:text-white/60">
            New requests ({incoming.length})
          </h2>
          <div className="space-y-3">
            {incoming.map((m) => (
              <div key={m.id} className="card flex items-center gap-4 p-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-bridge-gradient" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{m.otherUser?.firstName || 'Someone'}</p>
                  <p className="text-xs text-brand-ink/50 dark:text-white/50">
                    {m.otherProfile?.town}, {m.otherProfile?.county} · {m.compatibilityScore}% match
                  </p>
                </div>
                <button onClick={() => handleRespond(m.id, false)} className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-500 dark:bg-white/10">
                  <HiXMark />
                </button>
                <button onClick={() => handleRespond(m.id, true)} className="grid h-9 w-9 place-items-center rounded-full bg-bridge-gradient text-white">
                  <HiCheck />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-brand-ink/60 dark:text-white/60">
          Your connections ({accepted.length})
        </h2>
        {accepted.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <HiOutlineUsers className="h-10 w-10 text-brand-purple" />
            <p className="text-sm text-brand-ink/60 dark:text-white/60">No connections yet — try Meet Someone.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {accepted.map((m) => (
              <Link key={m.id} href={`/dashboard/chat/${m.id}`} className="card flex items-center gap-3 p-4">
                <div className="h-11 w-11 shrink-0 rounded-full bg-bridge-gradient" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{m.otherUser?.firstName}</p>
                  <p className="truncate text-xs text-brand-ink/50 dark:text-white/50">{m.otherProfile?.town}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
