import type { Metadata, Viewport } from 'next'
import { Sora, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import AgeGate from '@/components/ui/AgeGate'
import Script from 'next/script'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bridgeconnect.app'),
  title: {
    default: 'Bridge Connect — Connecting Hearts. Building Friendships.',
    template: '%s | Bridge Connect',
  },
  description:
    'Bridge Connect is a premium social platform to meet new friends, find romantic partners, chat, and build genuine connections through smart matching and video calls.',
  keywords: [
    'dating app Kenya', 'meet new friends', 'online dating', 'bridge connect',
    'chat app', 'video call dating', 'find partner Kenya',
  ],
  authors: [{ name: 'Bridge Connect' }],
  openGraph: {
    title: 'Bridge Connect — Connecting Hearts. Building Friendships.',
    description:
      'Meet new friends, find romantic partners, and build genuine connections on Bridge Connect.',
    url: '/',
    siteName: 'Bridge Connect',
    images: [{ url: '/images/og-cover.jpg', width: 1200, height: 630 }],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridge Connect — Connecting Hearts. Building Friendships.',
    description: 'Meet new friends, find romantic partners, and build genuine connections.',
    images: ['/images/og-cover.jpg'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', apple: '/images/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F6FF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1030' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-body bg-white text-brand-ink dark:bg-brand-ink dark:text-white antialiased">
        <AuthProvider>
          <AgeGate />
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
        <Script src="https://cdn.jsdelivr.net/npm/eruda" strategy="afterInteractive" />
        <Script id="eruda-init" strategy="afterInteractive">
          {`eruda.init();`}
        </Script>
      </body>
    </html>
  )
}
