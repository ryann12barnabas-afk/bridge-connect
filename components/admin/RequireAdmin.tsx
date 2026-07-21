'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  if (loading || !user?.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
