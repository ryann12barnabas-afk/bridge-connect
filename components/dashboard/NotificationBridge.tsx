'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/types'

/**
 * Requests browser notification permission and shows a native phone
 * notification whenever a new Firestore notification arrives while the
 * app is open. This is foreground-only — it won't fire if the browser
 * tab/app is fully closed (that needs push + a Cloud Function).
 */
export default function NotificationBridge() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const mountedAt = useRef(new Date().toISOString())

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (!user || permission !== 'granted') return

    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type !== 'added') return
        const notif = change.doc.data() as Notification
        // Skip anything that existed before this listener mounted, so we
        // don't re-notify for old unread items on every page load.
        if (notif.createdAt <= mountedAt.current) return

        new window.Notification(notif.title, {
          body: notif.body,
          icon: '/images/apple-touch-icon.png',
        })
      })
    })

    return () => unsub()
  }, [user, permission])

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  if (permission !== 'default') return null

  return (
    <div className="glass fixed inset-x-4 bottom-20 z-40 flex items-center justify-between gap-3 rounded-xl2 p-4 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80">
      <p className="text-xs text-brand-ink/70 dark:text-white/70">
        Turn on notifications so you never miss a match or message.
      </p>
      <button onClick={requestPermission} className="btn-primary shrink-0 !px-4 !py-2 text-xs">
        Enable
      </button>
    </div>
  )
    }
