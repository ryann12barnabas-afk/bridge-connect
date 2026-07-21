import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-bridge-radial px-6 text-center">
      <div>
        <Logo className="justify-center" />
        <h1 className="mt-8 font-display text-6xl font-extrabold text-brand-purple">404</h1>
        <p className="mt-3 text-brand-ink/60 dark:text-white/60">
          This page wandered off. Let&apos;s get you back to connecting.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Back home</Link>
      </div>
    </div>
  )
}
