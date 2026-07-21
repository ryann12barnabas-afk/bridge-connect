'use client'

// lib/admin.ts
// Client-side data access for the admin panel. All of these operations are
// additionally locked down by Firestore security rules (only uid with
// role == 'admin' can write to other users' docs) — this file just wraps the
// convenience calls the admin UI needs.
import {
  collection, query, orderBy, limit as fbLimit, getDocs, doc, updateDoc, deleteDoc, where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { User, Payment, Report, Subscription } from '@/types'

export async function fetchAllUsers(max = 100): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), fbLimit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as User)
}

export async function fetchAllPayments(max = 100): Promise<Payment[]> {
  const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'), fbLimit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment))
}

export async function fetchAllReports(max = 100): Promise<Report[]> {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), fbLimit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report))
}

export async function banUser(uid: string, banned: boolean) {
  await updateDoc(doc(db, 'users', uid), { isBanned: banned, updatedAt: new Date().toISOString() })
}

export async function deleteUserRecord(uid: string) {
  // Removes the Firestore profile/user docs. Deleting the actual Firebase Auth
  // account requires the Admin SDK and should be done via a server route in production.
  await deleteDoc(doc(db, 'users', uid))
  await deleteDoc(doc(db, 'profiles', uid))
}

export async function resolveReport(reportId: string, status: Report['status'], adminUid: string) {
  await updateDoc(doc(db, 'reports', reportId), {
    status,
    reviewedBy: adminUid,
    reviewedAt: new Date().toISOString(),
  })
}

export function toCSV<T extends Record<string, any>>(rows: T[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))]
  return lines.join('\n')
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
