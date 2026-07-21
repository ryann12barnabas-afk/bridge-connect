// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Normalizes a Kenyan phone number to the 2547XXXXXXXX format required by Daraja. */
export function normalizeMpesaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('0')) return `254${digits.slice(1)}`
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`
  return digits
}

export function formatKsh(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count}${label} ago`
  }
  return 'just now'
}

export function calcProfileCompletion(fields: Record<string, unknown>): number {
  const keys = Object.keys(fields)
  if (keys.length === 0) return 0
  const filled = keys.filter((k) => {
    const v = fields[k]
    if (Array.isArray(v)) return v.length > 0
    return v !== undefined && v !== null && v !== ''
  }).length
  return Math.round((filled / keys.length) * 100)
}

/** Basic input sanitizer to strip script tags / dangerous HTML before storing user text. */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

export function generateUsername(firstName: string, lastName: string): string {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '')
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${base}${suffix}`
}

export const INTERESTS_LIST = [
  'Music', 'Movies', 'Football', 'Travel', 'Food', 'Fitness', 'Reading',
  'Gaming', 'Fashion', 'Art', 'Photography', 'Dancing', 'Comedy', 'Tech',
  'Business', 'Faith', 'Nature', 'Volunteering', 'Cooking', 'Fashion Design',
]

export const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu', 'Machakos',
  'Kajiado', 'Kakamega', 'Meru', 'Nyeri', 'Kilifi', 'Bungoma', 'Kericho',
  'Trans Nzoia', 'Laikipia', 'Embu', 'Nyandarua', 'Murang\'a', 'Homa Bay',
]
