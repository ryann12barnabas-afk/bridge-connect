// app/api/auth/session/route.ts
// Exchanges a Firebase ID token (obtained client-side after login) for an
// HttpOnly session cookie that our middleware can check on every request.
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/firebase/admin'

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000 // 5 days, in ms

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    // Verifies signature + expiry server-side before trusting the token.
    await adminAuth.verifyIdToken(idToken)

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN,
    })

    const response = NextResponse.json({ status: 'success' })
    response.cookies.set('bc_session', sessionCookie, {
      maxAge: SESSION_EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Session creation failed:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'signed_out' })
  response.cookies.delete('bc_session')
  return response
}
