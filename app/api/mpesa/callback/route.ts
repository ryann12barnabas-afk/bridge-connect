// app/api/mpesa/callback/route.ts
// Public webhook Safaricom calls once the customer completes (or cancels) the
// STK push on their phone. Updates the matching `payments` doc and, on
// success, activates/extends the user's subscription.
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/firebase/admin'
import { SUBSCRIPTION_DURATION_DAYS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const callback = body?.Body?.stkCallback
    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback

    const paymentsSnap = await adminDb
      .collection('payments')
      .where('checkoutRequestId', '==', CheckoutRequestID)
      .limit(1)
      .get()

    if (paymentsSnap.empty) {
      console.warn('No matching payment found for callback:', CheckoutRequestID)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const paymentDoc = paymentsSnap.docs[0]
    const payment = paymentDoc.data()
    const now = new Date().toISOString()

    if (ResultCode !== 0) {
      // User cancelled, timed out, or the payment otherwise failed.
      await paymentDoc.ref.update({ status: 'failed', updatedAt: now })
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const items: { Name: string; Value: string | number }[] = CallbackMetadata?.Item || []
    const getValue = (name: string) => items.find((i) => i.Name === name)?.Value

    const mpesaReceiptNumber = String(getValue('MpesaReceiptNumber') || '')
    const transactionId = mpesaReceiptNumber

    await paymentDoc.ref.update({
      status: 'success',
      mpesaReceiptNumber,
      transactionId,
      updatedAt: now,
    })

    // Extend from current expiry if still active, otherwise start fresh from now.
    const subRef = adminDb.collection('subscriptions').doc(payment.uid)
    const subSnap = await subRef.get()
    const existing = subSnap.exists ? subSnap.data() : null
    const durationDays = SUBSCRIPTION_DURATION_DAYS[payment.plan as keyof typeof SUBSCRIPTION_DURATION_DAYS]

    const currentExpiry = existing?.expiryDate ? new Date(existing.expiryDate) : null
    const base = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date()
    const newExpiry = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000)

    await subRef.set(
      {
        uid: payment.uid,
        status: 'active',
        plan: payment.plan,
        startedAt: existing?.startedAt || now,
        expiryDate: newExpiry.toISOString(),
        paymentReference: mpesaReceiptNumber,
        transactionId,
      },
      { merge: true }
    )

    await adminDb.collection('notifications').add({
      uid: payment.uid,
      type: 'payment_success',
      title: 'Payment successful',
      body: `Your ${payment.plan} subscription is now active. Enjoy unlimited connections!`,
      isRead: false,
      createdAt: now,
      relatedId: paymentDoc.id,
    })

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('M-Pesa callback error:', err)
    // Still acknowledge receipt so Safaricom doesn't endlessly retry a broken payload.
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
