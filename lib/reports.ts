'use client'

import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

export async function submitReport(reporterId: string, reportedUserId: string, reason: string, details: string) {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    reportedUserId,
    reason,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
}
