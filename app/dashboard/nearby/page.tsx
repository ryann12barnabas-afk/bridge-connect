'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { KENYA_COUNTIES } from '@/lib/utils'
import type { Profile, User } from '@/types'
import { HiOutlineMapPin, HiOutlineShieldCheck } from 'react-icons/hi2'

interface Member { user: User; profile: Profile }

export default function NearbyPage() {
  const { user, profile } = useAuth()
  const [county, setCounty] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile?.county) setCounty(profile.county)
  }, [profile])

  useEffect(() => {
    if (!county || !user) return
    setLoading(true)
    const load = async () => {
      const q = query(collection(db, 'profiles'), where('county', '==', county), limit(30))
      const snap = await getDocs(q)
      const results: Member[] = []
      for (const d of snap.docs) {
        const p = d.data() as Profile
        if (p.uid === user.uid) continue
        const uSnap = await getDoc(doc(db, 'users', p.uid))
        if (uSnap.exists()) results.push({ user: uSnap.data() as User, profile: p })
      }
      setMembers(results)
      setLoading(false)
    }
    load()
  }, [county, user])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">People Nearby</h1>
        <select className="input-field w-48" value={county} onChange={(e) => setCounty(e.target.value)}>
          {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading && <p className="mt-6 text-sm text-brand-ink/50 dark:text-white/50">Looking around {county}…</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <div key={m.user.uid} className="card overflow-hidden">
            <div className="aspect-square w-full bg-gradient-to-br from-brand-blueLight to-brand-purple" />
            <div className="p-4">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm">{m.user.firstName}, {m.profile.age}</p>
                {m.profile.isVerified && <HiOutlineShieldCheck className="h-4 w-4 text-brand-blue" />}
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-brand-ink/50 dark:text-white/50">
                <HiOutlineMapPin className="h-3.5 w-3.5" /> {m.profile.town}, {m.profile.county}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!loading && members.length === 0 && (
        <p className="mt-10 text-center text-sm text-brand-ink/50 dark:text-white/50">
          No members found in {county} yet.
        </p>
      )}
    </div>
  )
}
