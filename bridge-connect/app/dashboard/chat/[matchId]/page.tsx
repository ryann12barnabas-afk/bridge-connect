'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  HiOutlineVideoCamera, HiOutlinePaperAirplane, HiOutlinePhoto, HiArrowLeft,
} from 'react-icons/hi2'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import {
  subscribeToMessages, subscribeToMatch, sendMessage, setTypingStatus, subscribeToTyping,
} from '@/lib/chat'
import { uploadChatImage } from '@/lib/storage'
import { startVideoCall, updateCallStatus, subscribeToCallSession } from '@/lib/video'
import VideoCallRoom from '@/components/video/VideoCallRoom'
import type { Message, Match, User } from '@/types'
import { timeAgo } from '@/lib/utils'

export default function ChatThreadPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const { user, firebaseUser, subscription } = useAuth()
  const isPremium = subscription?.status === 'active'

  const [match, setMatch] = useState<Match | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)
  const [activeCall, setActiveCall] = useState<{ roomUrl: string; token: string | null; sessionId: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const otherUid = match?.users.find((u) => u !== user?.uid)

  useEffect(() => {
    if (!matchId) return
    const unsub = subscribeToMatch(matchId, setMatch)
    return () => unsub()
  }, [matchId])

  useEffect(() => {
    if (!otherUid) return
    getDoc(doc(db, 'users', otherUid)).then((snap) => {
      if (snap.exists()) setOtherUser(snap.data() as User)
    })
  }, [otherUid])

  useEffect(() => {
    if (!matchId) return
    const unsub = subscribeToMessages(matchId, setMessages)
    return () => unsub()
  }, [matchId])

  useEffect(() => {
    if (!matchId || !otherUid) return
    const unsub = subscribeToTyping(matchId, otherUid, setOtherTyping)
    return () => unsub()
  }, [matchId, otherUid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTextChange = (value: string) => {
    setText(value)
    if (!user || !matchId) return
    setTypingStatus(matchId, user.uid, true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setTypingStatus(matchId, user.uid, false), 2000)
  }

  const handleSend = async () => {
    if (!text.trim() || !user || !otherUid || !matchId) return
    const content = text
    setText('')
    try {
      await sendMessage(matchId, user.uid, otherUid, content)
      setTypingStatus(matchId, user.uid, false)
    } catch {
      toast.error('Message failed to send.')
    }
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !otherUid || !matchId) return
    try {
      const url = await uploadChatImage(matchId, user.uid, file)
      await sendMessage(matchId, user.uid, otherUid, '', 'image', url)
    } catch (err: any) {
      toast.error(err?.message || 'Image upload failed.')
    }
  }

  const handleStartCall = async () => {
    if (!firebaseUser || !user || !otherUid || !matchId) return
    try {
      const idToken = await firebaseUser.getIdToken()
      const session = await startVideoCall(idToken, matchId, user.uid, otherUid)
      setActiveCall({ roomUrl: session.roomUrl, token: null, sessionId: session.id })
      await updateCallStatus(session.id, 'active')
      if (!isPremium) {
        toast('Free trial call — 3 minutes, then upgrade for unlimited calls.', { icon: '⏱️' })
      }
    } catch (err: any) {
      toast.error(err?.message || 'Could not start the call.')
    }
  }

  const handleFreeCallTimeUp = () => {
    toast.error("Your 3-minute free call has ended. Upgrade for unlimited video calls.")
    router.push('/dashboard/subscription')
  }

  const handleLeaveCall = async () => {
    if (activeCall) await updateCallStatus(activeCall.sessionId, 'ended')
    setActiveCall(null)
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-2xl flex-col">
      <div className="glass sticky top-0 z-10 flex items-center justify-between rounded-xl2 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="lg:hidden"><HiArrowLeft /></button>
          <div className="h-10 w-10 rounded-full bg-bridge-gradient" />
          <div>
            <p className="text-sm font-semibold">{otherUser?.firstName || 'Bridge Connect member'}</p>
            {otherTyping && <p className="text-xs text-brand-purple">typing…</p>}
          </div>
        </div>
        <button
          onClick={handleStartCall}
          className="grid h-10 w-10 place-items-center rounded-full bg-bridge-gradient text-white"
          aria-label="Start video call"
        >
          <HiOutlineVideoCamera className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-2 py-4">
        {messages.map((m) => {
          const mine = m.senderId === user?.uid
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine ? 'bg-bridge-gradient text-white' : 'bg-brand-mist dark:bg-white/10'
                }`}
              >
                {m.type === 'image' && m.imageURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageURL} alt="Shared" className="max-w-full rounded-lg" />
                ) : (
                  <p>{m.content}</p>
                )}
                <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-brand-ink/40 dark:text-white/40'}`}>
                  {timeAgo(m.createdAt)} {mine && m.seenAt ? '· Seen' : ''}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-black/5 px-2 py-3 dark:border-white/10">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-brand-ink/50 dark:text-white/50" aria-label="Attach image">
          <HiOutlinePhoto className="h-6 w-6" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
        <input
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
          className="input-field flex-1"
        />
        <button onClick={handleSend} className="grid h-10 w-10 place-items-center rounded-full bg-bridge-gradient text-white" aria-label="Send">
          <HiOutlinePaperAirplane className="h-5 w-5" />
        </button>
      </div>

{activeCall && (
        <VideoCallRoom
          roomUrl={activeCall.roomUrl}
          token={activeCall.token}
          onLeave={handleLeaveCall}
          timeLimitSeconds={isPremium ? undefined : 180}
          onTimeUp={handleFreeCallTimeUp}
        />
      )}    </div>
  )
}
