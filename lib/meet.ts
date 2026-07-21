'use client'

// lib/meet.ts
// Core "Meet Someone" matching logic. Finds a compatible candidate using the
// current user's preferences (age range, gender, location, interests, intent),
// then creates a pending Match document that both people can accept/decline.
import {
  collection, query, where, getDocs, limit, doc, setDoc, updateDoc,
  getDoc, serverTimestamp, increment, addDoc, collectionGroup,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Profile, User, Match, MeetPreferences } from '@/types'

interface CandidateResult {
  user: User
  profile: Profile
  compatibilityScore: number
}

/**
 * Finds a random compatible candidate for the "Meet Someone" feature.
 * Firestore has no native "ORDER BY RANDOM()", so we pull a bounded batch of
 * candidates matching hard filters (gender/age/not-already-matched) and then
 * pick randomly client-side, weighting by a simple interest-overlap score.
 */
export async function findMeetCandidate(
  currentUid: string,
  prefs: MeetPreferences,
  excludeUids: string[]
): Promise<CandidateResult | null> {
  const profilesRef = collection(db, 'profiles')

  // Firestore only allows range filters on one field at a time, so we filter
  // gender via `where` and age range client-side after the fetch.
  const constraints = []
  if (prefs.gender !== 'everyone') {
    constraints.push(where('gender', '==', prefs.gender))
  }
  if (prefs.county) {
    constraints.push(where('county', '==', prefs.county))
  }

  const q = query(profilesRef, ...constraints, limit(50))
  const snap = await getDocs(q)

  const candidates: CandidateResult[] = []

  for (const docSnap of snap.docs) {
    const profile = docSnap.data() as Profile
    if (profile.uid === currentUid) continue
    if (excludeUids.includes(profile.uid)) continue
    if (profile.age < prefs.ageMin || profile.age > prefs.ageMax) continue
    if (prefs.relationshipIntent && profile.relationshipIntent !== prefs.relationshipIntent) continue

    const userSnap = await getDoc(doc(db, 'users', profile.uid))
    if (!userSnap.exists()) continue
    const user = userSnap.data() as User
    if (user.isBanned) continue

    const overlap = prefs.interests
      ? profile.interests.filter((i) => prefs.interests!.includes(i)).length
      : 0
    const compatibilityScore = Math.min(100, 50 + overlap * 10)

    candidates.push({ user, profile, compatibilityScore })
  }

  if (candidates.length === 0) return null

  // Weight toward higher compatibility while still keeping it random/serendipitous.
  candidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
  const pool = candidates.slice(0, Math.max(5, Math.ceil(candidates.length / 2)))
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Creates a pending match request from the current user to a candidate. */
export async function createMeetRequest(
  fromUid: string,
  toUid: string,
  compatibilityScore: number
): Promise<string> {
  const matchesRef = collection(db, 'matches')
  const now = new Date().toISOString()
  const docRef = await addDoc(matchesRef, {
    users: [fromUid, toUid],
    status: 'pending',
    initiatedBy: fromUid,
    createdAt: now,
    compatibilityScore,
  } satisfies Omit<Match, 'id'>)
  return docRef.id
}

/** Records the responder's decision and, if both sides accepted, activates the match. */
export async function respondToMeetRequest(matchId: string, accept: boolean) {
  const matchRef = doc(db, 'matches', matchId)
  await updateDoc(matchRef, {
    status: accept ? 'accepted' : 'declined',
    respondedAt: new Date().toISOString(),
  })
}

/** Decrements the free-meet counter for users without an active subscription. */
export async function consumeFreeMeet(uid: string) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    freeMeetsRemaining: increment(-1),
    updatedAt: new Date().toISOString(),
  })
}

export async function hasMeetsAvailable(user: User, isPremium: boolean): Promise<boolean> {
  if (isPremium) return true
  return user.freeMeetsRemaining > 0
}
