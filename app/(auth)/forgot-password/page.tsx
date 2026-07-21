import { Metadata } from 'next'
import AuthLayout from '@/components/auth/AuthLayout'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Reset your password' }

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll email you a reset link.">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
