import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://bridgeconnect.app'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/admin/', '/api/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
