'use client'

// lib/video.ts
// Orchestrates video calls: creates a Daily.co room via our API route, writes a
// VideoCallSession doc to Firestore (used as the "ringing" signal so the other
// person's chat UI can show an incoming-call prompt), and updates call status.
import {
  doc, setDoc, updateDoc, onSnapshot, collection, query, where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { VideoCallSession } from '@/types'

interface CreateRoomResponse {
  roomUrl: string
  roomName: string
  token: string | null
}

/** Calls our server route to provision a private Daily.co room for this match. */
export async function provisionVideoRoom(idToken: string, matchId: string): Promise<CreateRoomResponse> {
  const res = await fetch('/api/video/create-room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ matchId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Could not start video call')
  }
  return res.json()
}

/** Starts a call: provisions the room and writes the "ringing" session doc both users can see. */
export async function startVideoCall(
  idToken: string,
  matchId: string,
  callerUid: string,
  calleeUid: string
): Promise<VideoCallSession> {
  const { roomUrl, roomName } = await provisionVideoRoom(idToken, matchId)

  const sessionId = `${matchId}-${Date.now()}`
  const session: VideoCallSession = {
    id: sessionId,
    matchId,
    roomUrl,
    roomName,
    initiatedBy: callerUid,
    participants: [callerUid, calleeUid],
    status: 'ringing',
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'videoCalls', sessionId), session)
  return session
}

export async function updateCallStatus(sessionId: string, status: VideoCallSession['status']) {
  const updates: Partial<VideoCallSession> = { status }
  if (status === 'ended' || status === 'declined' || status === 'missed') {
    updates.endedAt = new Date().toISOString()
  }
  await updateDoc(doc(db, 'videoCalls', sessionId), updates)
}

/** Listens for an incoming call session where the current user is a participant and it's still ringing. */
export function subscribeToIncomingCalls(uid: string, cb: (session: VideoCallSession | null) => void) {
  const q = query(
    collection(db, 'videoCalls'),
    where('participants', 'array-contains', uid),
    where('status', '==', 'ringing')
  )
  return onSnapshot(q, (snap) => {
    const incoming = snap.docs
      .map((d) => d.data() as VideoCallSession)
      .find((session) => session.initiatedBy !== uid)
    cb(incoming || null)
  })
}

export function subscribeToCallSession(sessionId: string, cb: (session: VideoCallSession | null) => void) {
  return onSnapshot(doc(db, 'videoCalls', sessionId), (snap) => {
    cb(snap.exists() ? (snap.data() as VideoCallSession) : null)
  })
}
