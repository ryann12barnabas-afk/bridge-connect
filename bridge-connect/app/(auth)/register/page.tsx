import { Metadata } from 'next'
import AuthLayout from '@/components/auth/AuthLayout'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Join Bridge Connect and start meeting new people today.',
}

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="It only takes a couple of minutes.">
      <RegisterForm />
    </AuthLayout>
  )
}
