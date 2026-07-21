'use client'

import { useEffect, useState } from 'react'
import { HiOutlineArrowDownTray } from 'react-icons/hi2'
import { fetchAllPayments, toCSV, downloadCSV } from '@/lib/admin'
import { formatKsh, timeAgo } from '@/lib/utils'
import type { Payment } from '@/types'

const STATUS_STYLES: Record<Payment['status'], string> = {
  success: 'bg-green-100 text-green-600',
  pending: 'bg-yellow-100 text-yellow-600',
  failed: 'bg-red-100 text-red-600',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllPayments(200).then((p) => { setPayments(p); setLoading(false) })
  }, [])

  const totalRevenue = payments.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Payments</h1>
          <p className="text-sm text-brand-ink/60 dark:text-white/60">Total revenue: {formatKsh(totalRevenue)}</p>
        </div>
        <button onClick={() => downloadCSV('payments.csv', toCSV(payments))} className="btn-secondary !py-2 text-sm">
          <HiOutlineArrowDownTray /> Export
        </button>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 text-xs text-brand-ink/50 dark:border-white/10 dark:text-white/50">
            <tr>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Receipt</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-brand-ink/50">Loading…</td></tr>}
            {!loading && payments.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-3">{p.phoneNumber}</td>
                <td className="px-4 py-3 capitalize">{p.plan}</td>
                <td className="px-4 py-3">{formatKsh(p.amount)}</td>
                <td className="px-4 py-3">{p.mpesaReceiptNumber || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">{timeAgo(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
