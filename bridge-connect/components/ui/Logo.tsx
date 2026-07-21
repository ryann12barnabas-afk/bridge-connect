import Link from 'next/link'
import { HiOutlineHeart } from 'react-icons/hi2'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-bridge-gradient text-white shadow-glass transition-transform group-hover:rotate-6">
        <HiOutlineHeart className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Bridge<span className="text-brand-purple">Connect</span>
      </span>
    </Link>
  )
}
