'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToUserMatches } from '@/lib/chat'
import { timeAgo } from '@/lib/utils'
import type { Match, User, Profile } from '@/types'
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'

interface EnrichedMatch extends Match {
  otherUser?: User
  otherProfile?: Profile
}

export default function ChatListPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<EnrichedMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserMatches(user.uid, async (rawMatches) => {
      const enriched = await Promise.all(
        rawMatches.map(async (m) => {
          const otherUid = m.users.find((u) => u !== user.uid)!
          const [userSnap, profileSnap] = await Promise.all([
            getDoc(doc(db, 'users', otherUid)),
            getDoc(doc(db, 'profiles', otherUid)),
          ])
          return {
            ...m,
            otherUser: userSnap.exists() ? (userSnap.data() as User) : undefined,
            otherProfile: profileSnap.exists() ? (profileSnap.data() as Profile) : undefined,
          }
        })
      )
      enriched.sort((a, b) => (b.lastMessageAt || b.createdAt).localeCompare(a.lastMessageAt || a.createdAt))
      setMatches(enriched)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Chats</h1>

      {loading && <p className="mt-6 text-sm text-brand-ink/50 dark:text-white/50">Loading your chats…</p>}

      {!loading && matches.length === 0 && (
        <div className="card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <HiOutlineChatBubbleLeftRight className="h-10 w-10 text-brand-purple" />
          <p className="font-semibold">No conversations yet</p>
          <p className="text-sm text-brand-ink/60 dark:text-white/60">
            Once you match with someone, your chat will show up here.
          </p>
          <Link href="/dashboard/meet" className="btn-primary mt-2">Meet Someone</Link>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/dashboard/chat/${m.id}`}
            className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="h-12 w-12 shrink-0 rounded-full bg-bridge-gradient" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{m.otherUser?.firstName || 'Bridge Connect member'}</p>
              <p className="truncate text-sm text-brand-ink/60 dark:text-white/60">
                {m.lastMessagePreview || 'Say hello 👋'}
              </p>
            </div>
            {m.lastMessageAt && (
              <span className="shrink-0 text-xs text-brand-ink/40 dark:text-white/40">{timeAgo(m.lastMessageAt)}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
