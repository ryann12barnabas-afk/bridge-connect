'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchAllReports, resolveReport } from '@/lib/admin'
import { useAuth } from '@/hooks/useAuth'
import { timeAgo } from '@/lib/utils'
import type { Report } from '@/types'

const STATUS_STYLES: Record<Report['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-600',
  reviewed: 'bg-blue-100 text-blue-600',
  dismissed: 'bg-gray-100 text-gray-500',
  actioned: 'bg-red-100 text-red-600',
}

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setReports(await fetchAllReports(200))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleResolve = async (id: string, status: Report['status']) => {
    if (!user) return
    try {
      await resolveReport(id, status, user.uid)
      toast.success('Report updated')
      load()
    } catch {
      toast.error('Could not update report')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Reported profiles</h1>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-brand-ink/50">Loading…</p>}
        {!loading && reports.length === 0 && (
          <p className="text-sm text-brand-ink/50 dark:text-white/50">No reports filed.</p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}>{r.status}</span>
              <span className="text-xs text-brand-ink/40 dark:text-white/40">{timeAgo(r.createdAt)}</span>
            </div>
            <p className="mt-3 text-sm font-semibold">Reason: {r.reason}</p>
            {r.details && <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">{r.details}</p>}
            {r.status === 'pending' && (
              <div className="mt-4 flex gap-3">
                <button onClick={() => handleResolve(r.id, 'dismissed')} className="btn-secondary !py-2 text-xs">Dismiss</button>
                <button onClick={() => handleResolve(r.id, 'actioned')} className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white">
                  Take action
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
