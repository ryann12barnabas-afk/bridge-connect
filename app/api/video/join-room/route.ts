import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/firebase/admin'

export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Missing auth token' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(idToken)

    const { roomName } = await request.json()
    if (!roomName) return NextResponse.json({ error: 'roomName is required' }, { status: 400 })

    // TODO: confirm decoded.uid is a participant of this call (check the videoCalls doc)

    const tokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: decoded.uid,
          exp: Math.round(Date.now() / 1000) + 60 * 30,
        },
      }),
    })
    if (!tokenRes.ok) {
      console.error('Daily token creation failed:', await tokenRes.text())
      return NextResponse.json({ error: 'Could not create meeting token' }, { status: 502 })
    }
    const { token } = await tokenRes.json()
    return NextResponse.json({ token })
  } catch (err) {
    console.error('join-room error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
