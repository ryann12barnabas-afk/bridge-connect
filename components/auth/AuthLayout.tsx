import { ReactNode } from 'react'
import Logo from '@/components/ui/Logo'

export default function AuthLayout({
  children, title, subtitle,
}: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-bridge-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float [animation-delay:2s]" />
        <Logo className="[&_span]:text-white" />
        <div className="relative z-10 text-white">
          <h2 className="font-display text-3xl font-bold leading-tight">
            Connecting Hearts.<br />Building Friendships.
          </h2>
          <p className="mt-4 max-w-sm text-white/80">
            Join thousands of people meeting new friends, finding partners, and building genuine
            connections every day.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/60">© {new Date().getFullYear()} Bridge Connect</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-brand-ink/60 dark:text-white/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
