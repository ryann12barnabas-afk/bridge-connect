'use client'

import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { User } from '@/types'

export const FREE_DAILY_LIKE_LIMIT = 25
const RESET_HOUR = 7 // 7:00 AM

/** Returns the next occurrence of 7:00 AM strictly after the given date. */
function nextResetBoundary(from: Date): Date {
  const next = new Date(from)
  next.setHours(RESET_HOUR, 0, 0, 0)
  if (next <= from) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

/** True if the free-tier daily window has expired and should be treated as reset. */
function isWindowExpired(user: User): boolean {
  if (!user.dailyLikesResetAt) return true
  return new Date() >= new Date(user.dailyLikesResetAt)
}

/** Checks whether this user can send another like right now. No numbers are ever shown to the user. */
export function canSendLike(user: User, isPremium: boolean): boolean {
  if (isPremium) return true
  if (isWindowExpired(user)) return true
  return user.dailyLikesUsed < FREE_DAILY_LIKE_LIMIT
}

/** Records that a like was sent, resetting the daily window if it had expired. */
export async function consumeDailyLike(uid: string, user: User, isPremium: boolean) {
  if (isPremium) return

  const userRef = doc(db, 'users', uid)

  if (isWindowExpired(user)) {
    const resetAt = nextResetBoundary(new Date())
    await updateDoc(userRef, {
      dailyLikesUsed: 1,
      dailyLikesResetAt: resetAt.toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } else {
    await updateDoc(userRef, {
      dailyLikesUsed: user.dailyLikesUsed + 1,
      updatedAt: new Date().toISOString(),
    })
  }
  }
