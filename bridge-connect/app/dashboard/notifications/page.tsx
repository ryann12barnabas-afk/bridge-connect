'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { timeAgo } from '@/lib/utils'
import type { Notification } from '@/types'
import {
  HiOutlineBell, HiOutlineHeart, HiOutlineCreditCard, HiOutlineExclamationTriangle,
  HiOutlineChatBubbleLeftRight, HiOutlineVideoCamera, HiOutlineShieldCheck,
} from 'react-icons/hi2'

const ICONS: Record<Notification['type'], any> = {
  new_match: HiOutlineHeart,
  new_friend_request: HiOutlineHeart,
  payment_success: HiOutlineCreditCard,
  subscription_expiring: HiOutlineExclamationTriangle,
  subscription_expired: HiOutlineExclamationTriangle,
  new_message: HiOutlineChatBubbleLeftRight,
  video_call_invite: HiOutlineVideoCamera,
  profile_verified: HiOutlineShieldCheck,
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)))
    })
    return () => unsub()
  }, [user])

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { isRead: true })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Notifications</h1>

      {notifications.length === 0 && (
        <div className="card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <HiOutlineBell className="h-10 w-10 text-brand-purple" />
          <p className="text-sm text-brand-ink/60 dark:text-white/60">You&apos;re all caught up.</p>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {notifications.map((n) => {
          const Icon = ICONS[n.type] || HiOutlineBell
          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`card flex w-full items-start gap-3 p-4 text-left ${!n.isRead ? 'ring-1 ring-brand-purple/40' : ''}`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bridge-gradient text-white">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-xs text-brand-ink/60 dark:text-white/60">{n.body}</p>
                <p className="mt-1 text-[10px] text-brand-ink/40 dark:text-white/40">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-purple" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
