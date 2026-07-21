'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineNoSymbol, HiOutlineCheckCircle, HiOutlineArrowDownTray } from 'react-icons/hi2'
import { fetchAllUsers, banUser, toCSV, downloadCSV } from '@/lib/admin'
import { timeAgo } from '@/lib/utils'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setUsers(await fetchAllUsers(200))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleBan = async (u: User) => {
    try {
      await banUser(u.uid, !u.isBanned)
      toast.success(u.isBanned ? 'User unbanned' : 'User banned')
      load()
    } catch {
      toast.error('Action failed')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <div className="flex gap-3">
          <input
            className="input-field w-56"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => downloadCSV('users.csv', toCSV(users))}
            className="btn-secondary !py-2 text-sm"
          >
            <HiOutlineArrowDownTray /> Export
          </button>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 text-xs text-brand-ink/50 dark:border-white/10 dark:text-white/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-brand-ink/50">Loading…</td></tr>
            )}
            {!loading && filtered.map((u) => (
              <tr key={u.uid} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-3">{u.firstName} {u.lastName} <span className="text-brand-ink/40">@{u.username}</span></td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{timeAgo(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.isBanned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {u.isBanned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleBan(u)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${u.isBanned ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {u.isBanned ? <HiOutlineCheckCircle /> : <HiOutlineNoSymbol />}
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
