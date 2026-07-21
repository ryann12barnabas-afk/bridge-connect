'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { fetchAllUsers, fetchAllPayments } from '@/lib/admin'
import { formatKsh } from '@/lib/utils'
import type { User, Payment } from '@/types'

export default function AdminAnalyticsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAllUsers(500), fetchAllPayments(500)]).then(([u, p]) => {
      setUsers(u)
      setPayments(p)
      setLoading(false)
    })
  }, [])

  const totalRevenue = payments.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0)
  const activeSubs = payments.filter((p) => p.status === 'success').length
  const bannedCount = users.filter((u) => u.isBanned).length

  const last14Days = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    const key = date.toISOString().slice(0, 10)
    const label = date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
    const signups = users.filter((u) => u.createdAt?.slice(0, 10) === key).length
    const revenue = payments
      .filter((p) => p.status === 'success' && p.createdAt?.slice(0, 10) === key)
      .reduce((sum, p) => sum + p.amount, 0)
    return { label, signups, revenue }
  })

  const STATS = [
    { label: 'Total users', value: users.length },
    { label: 'Banned users', value: bannedCount },
    { label: 'Successful payments', value: activeSubs },
    { label: 'Total revenue', value: formatKsh(totalRevenue) },
  ]

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>

      {loading ? (
        <p className="text-sm text-brand-ink/50 dark:text-white/50">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card p-5">
                <p className="text-xs font-medium text-brand-ink/50 dark:text-white/50">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <p className="mb-4 text-sm font-semibold">New sign-ups (last 14 days)</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={last14Days}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <p className="mb-4 text-sm font-semibold">Revenue (KSh, last 14 days)</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={last14Days}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => formatKsh(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#2952E3" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
