// lib/mpesa/daraja.ts
// Server-only helpers for talking to Safaricom's Daraja API. Never import this
// from a client component — it reads MPESA_* secrets from process.env.
import { normalizeMpesaPhone } from '@/lib/utils'

const BASE_URL = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
}

function getBaseUrl() {
  const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'
  return BASE_URL[env]
}

/** Fetches a short-lived OAuth token used to authorize STK push + query requests. */
export async function getDarajaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials are not configured.')
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  const res = await fetch(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!res.ok) throw new Error('Failed to authenticate with M-Pesa')
  const data = await res.json()
  return data.access_token
}

function getTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  )
}

function getPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

interface StkPushParams {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}

interface StkPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

/** Initiates an STK push prompt on the customer's phone for the given amount. */
export async function initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const timestamp = getTimestamp()
  const password = getPassword(shortcode, passkey, timestamp)
  const accessToken = await getDarajaAccessToken()
  const phone = normalizeMpesaPhone(params.phoneNumber)

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: params.amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error('STK push failed:', errBody)
    throw new Error('Could not initiate M-Pesa payment')
  }

  return res.json()
}

/** Queries Safaricom for the outcome of a previously initiated STK push (used as a fallback to the webhook). */
export async function queryStkPushStatus(checkoutRequestId: string) {
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const timestamp = getTimestamp()
  const password = getPassword(shortcode, passkey, timestamp)
  const accessToken = await getDarajaAccessToken()

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  })

  if (!res.ok) throw new Error('Could not query payment status')
  return res.json()
}
