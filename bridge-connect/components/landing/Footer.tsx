import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { FaFacebook, FaInstagram, FaTiktok, FaXTwitter } from 'react-icons/fa6'

export default function Footer() {
  return (
    <footer className="border-t border-black/5 px-6 py-12 dark:border-white/10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-brand-ink/60 dark:text-white/60">
              Connecting Hearts. Building Friendships.
            </p>
            <div className="mt-4 flex gap-4 text-lg text-brand-ink/50 dark:text-white/50">
              <FaFacebook className="cursor-pointer hover:text-brand-blue" />
              <FaInstagram className="cursor-pointer hover:text-brand-blue" />
              <FaTiktok className="cursor-pointer hover:text-brand-blue" />
              <FaXTwitter className="cursor-pointer hover:text-brand-blue" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="font-display text-sm font-semibold">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-brand-ink/60 dark:text-white/60">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how-it-works">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-brand-ink/60 dark:text-white/60">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-brand-ink/60 dark:text-white/60">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/safety">Safety Tips</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-black/5 pt-6 text-center text-xs text-brand-ink/40 dark:border-white/10 dark:text-white/40">
          © {new Date().getFullYear()} Bridge Connect. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
