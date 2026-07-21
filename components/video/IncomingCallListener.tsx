'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToIncomingCalls, updateCallStatus } from '@/lib/video'
import IncomingCallModal from './IncomingCallModal'
import VideoCallRoom from './VideoCallRoom'
import type { VideoCallSession, User } from '@/types'

/**
 * Mounted once in the dashboard layout so an incoming call can ring no matter
 * which page the user is currently on, mirroring how calls work in a native app.
 */
export default function IncomingCallListener() {
  const { user } = useAuth()
  const [incoming, setIncoming] = useState<VideoCallSession | null>(null)
  const [callerName, setCallerName] = useState<string>('')
  const [joinedCall, setJoinedCall] = useState<VideoCallSession | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToIncomingCalls(user.uid, async (session) => {
      setIncoming(session)
      if (session) {
        const callerSnap = await getDoc(doc(db, 'users', session.initiatedBy))
        if (callerSnap.exists()) setCallerName((callerSnap.data() as User).firstName)
      }
    })
    return () => unsub()
  }, [user])

  const handleAccept = async () => {
    if (!incoming) return
    await updateCallStatus(incoming.id, 'active')
    setJoinedCall(incoming)
    setIncoming(null)
  }

  const handleDecline = async () => {
    if (!incoming) return
    await updateCallStatus(incoming.id, 'declined')
    setIncoming(null)
  }

  if (joinedCall) {
    return (
      <VideoCallRoom
        roomUrl={joinedCall.roomUrl}
        onLeave={async () => {
          await updateCallStatus(joinedCall.id, 'ended')
          setJoinedCall(null)
        }}
      />
    )
  }

  return (
    <IncomingCallModal
      session={incoming}
      callerName={callerName}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  )
}
