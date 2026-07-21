'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace('/login')
    }
  }, [loading, firebaseUser, router])

  if (loading || !firebaseUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
