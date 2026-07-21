// app/api/mpesa/stkpush/route.ts
// Client calls this after the user enters their phone + selects a plan. We
// verify the caller's Firebase ID token, create a `payments` record, then
// trigger the actual STK push against Safaricom's Daraja API.
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/firebase/admin'
import { initiateStkPush } from '@/lib/mpesa/daraja'
import { mpesaPhoneSchema } from '@/lib/validation'
import { SUBSCRIPTION_PRICES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const idToken = authHeader?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Missing auth token' }, { status: 401 })

    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    const body = await request.json()
    const parsed = mpesaPhoneSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }

    const { phoneNumber, plan } = parsed.data
    const amount = SUBSCRIPTION_PRICES[plan]

    const stkResponse = await initiateStkPush({
      phoneNumber,
      amount,
      accountReference: `BridgeConnect-${uid.slice(0, 8)}`,
      transactionDesc: `Bridge Connect ${plan} subscription`,
    })

    const now = new Date().toISOString()
    const paymentRef = adminDb.collection('payments').doc()
    await paymentRef.set({
      id: paymentRef.id,
      uid,
      amount,
      plan,
      phoneNumber,
      status: 'pending',
      merchantRequestId: stkResponse.MerchantRequestID,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      status: 'pending',
      checkoutRequestId: stkResponse.CheckoutRequestID,
      message: stkResponse.CustomerMessage || 'Enter your M-Pesa PIN on your phone to complete payment.',
      paymentId: paymentRef.id,
    })
  } catch (err: any) {
    console.error('STK push route error:', err)
    return NextResponse.json({ error: err?.message || 'Payment could not be started' }, { status: 500 })
  }
}
