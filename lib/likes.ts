'use client'

import {
  collection, addDoc, getDocs, query, where, onSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Like, Match } from '@/types'

export async function sendLike(
  fromUid: string,
  toUid: string,
  compatibilityScore: number
): Promise<{ matched: boolean; matchId?: string }> {
  const likesRef = collection(db, 'likes')

  await addDoc(likesRef, {
    fromUid,
    toUid,
    createdAt: new Date().toISOString(),
  })

  const reverseQuery = query(
    likesRef,
    where('fromUid', '==', toUid),
    where('toUid', '==', fromUid)
  )
  const reverseSnap = await getDocs(reverseQuery)

  if (!reverseSnap.empty) {
    const now = new Date().toISOString()
    const matchDoc = await addDoc(collection(db, 'matches'), {
      users: [fromUid, toUid],
      status: 'accepted',
      initiatedBy: fromUid,
      createdAt: now,
      respondedAt: now,
      compatibilityScore,
    } satisfies Omit<Match, 'id'>)

    await addDoc(collection(db, 'notifications'), {
      uid: toUid,
      type: 'new_match',
      title: "It's a match!",
      body: 'You both liked each other. Start chatting now!',
      isRead: false,
      createdAt: now,
      relatedId: matchDoc.id,
    })

    return { matched: true, matchId: matchDoc.id }
  }

  return { matched: false }
}

export async function recordPass(fromUid: string, toUid: string) {
  await addDoc(collection(db, 'passes'), {
    fromUid,
    toUid,
    createdAt: new Date().toISOString(),
  })
}

export async function getPassedUids(uid: string): Promise<string[]> {
  const q = query(collection(db, 'passes'), where('fromUid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data().toUid as string)
}

export async function getLikedUids(uid: string): Promise<string[]> {
  const q = query(collection(db, 'likes'), where('fromUid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data().toUid as string)
}

export function subscribeToLikesReceived(uid: string, cb: (likes: Like[]) => void) {
  const q = query(collection(db, 'likes'), where('toUid', '==', uid))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Like)))
  })
}
