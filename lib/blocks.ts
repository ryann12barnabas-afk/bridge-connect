'use client'

import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'

export async function blockUser(blockerUid: string, blockedUid: string) {
  await addDoc(collection(db, 'blocks'), {
    blockerUid,
    blockedUid,
    createdAt: new Date().toISOString(),
  })
}

export async function unblockUser(blockerUid: string, blockedUid: string) {
  const q = query(
    collection(db, 'blocks'),
    where('blockerUid', '==', blockerUid),
    where('blockedUid', '==', blockedUid)
  )
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, 'blocks', d.id))))
}

/** Returns uids this user has blocked, plus uids of anyone who has blocked this user
 * (used to hide matches/chats/candidates in both directions). */
export async function getAllBlockedUids(uid: string): Promise<string[]> {
  const [blockedByMe, blockedMe] = await Promise.all([
    getDocs(query(collection(db, 'blocks'), where('blockerUid', '==', uid))),
    getDocs(query(collection(db, 'blocks'), where('blockedUid', '==', uid))),
  ])
  const set = new Set<string>()
  blockedByMe.docs.forEach((d) => set.add(d.data().blockedUid))
  blockedMe.docs.forEach((d) => set.add(d.data().blockerUid))
  return Array.from(set)
}

export async function hasBlockedEitherWay(uidA: string, uidB: string): Promise<boolean> {
  const q1 = query(
    collection(db, 'blocks'),
    where('blockerUid', '==', uidA),
    where('blockedUid', '==', uidB)
  )
  const q2 = query(
    collection(db, 'blocks'),
    where('blockerUid', '==', uidB),
    where('blockedUid', '==', uidA)
  )
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
  return !snap1.empty || !snap2.empty
}
