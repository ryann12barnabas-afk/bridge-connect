'use client'

// lib/chat.ts
// Realtime chat helpers: sending messages, marking read, typing indicators,
// and subscribing to a match's message thread.
import {
  collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc,
  serverTimestamp, setDoc, getDoc,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Message, Match } from '@/types'
import { sanitizeInput } from './utils'

export function subscribeToMessages(matchId: string, cb: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'matches', matchId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)))
  })
}

export function subscribeToMatch(matchId: string, cb: (match: Match | null) => void) {
  return onSnapshot(doc(db, 'matches', matchId), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Match) : null)
  })
}

export function subscribeToUserMatches(uid: string, cb: (matches: Match[]) => void) {
  const q = query(
    collection(db, 'matches'),
    where('users', 'array-contains', uid),
    where('status', '==', 'accepted')
  )
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match)))
  })
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  recipientId: string,
  content: string,
  type: 'text' | 'image' = 'text',
  imageURL?: string
) {
  const now = new Date().toISOString()
  await addDoc(collection(db, 'matches', matchId, 'messages'), {
    matchId,
    senderId,
    recipientId,
    type,
    content: type === 'text' ? sanitizeInput(content) : content,
    imageURL: imageURL || null,
    createdAt: now,
  })

  await updateDoc(doc(db, 'matches', matchId), {
    lastMessageAt: now,
    lastMessagePreview: type === 'image' ? '📷 Photo' : content.slice(0, 80),
  })
}

export async function markMessageSeen(matchId: string, messageId: string) {
  await updateDoc(doc(db, 'matches', matchId, 'messages', messageId), {
    seenAt: new Date().toISOString(),
  })
}

export async function setTypingStatus(matchId: string, uid: string, isTyping: boolean) {
  await setDoc(
    doc(db, 'matches', matchId, 'typing', uid),
    { isTyping, updatedAt: new Date().toISOString() },
    { merge: true }
  )
}

export function subscribeToTyping(matchId: string, otherUid: string, cb: (isTyping: boolean) => void) {
  return onSnapshot(doc(db, 'matches', matchId, 'typing', otherUid), (snap) => {
    cb(snap.exists() ? !!snap.data().isTyping : false)
  })
}
