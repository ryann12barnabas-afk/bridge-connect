import { Metadata } from 'next'
import { Suspense } from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your Bridge Connect account.',
}

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to keep the conversation going.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
