// app/api/video/create-room/route.ts
// Creates a short-lived, private Daily.co video room for a match and returns
// its join URL. Called server-side so the Daily API key never reaches the client.
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/firebase/admin'

const DAILY_API_URL = 'https://api.daily.co/v1/rooms'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const idToken = authHeader?.replace('Bearer ', '')
    if (!idToken) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 })
    }
    const decoded = await adminAuth.verifyIdToken(idToken)

    const { matchId } = await request.json()
    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 })
    }

    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Video calling is not configured. Set DAILY_API_KEY in your environment.' },
        { status: 503 }
      )
    }

    const roomName = `bc-${matchId}-${Date.now()}`

    const res = await fetch(DAILY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: Math.round(Date.now() / 1000) + 60 * 30, // room expires after 30 minutes
          enable_chat: false,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          max_participants: 2,
        },
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('Daily room creation failed:', errBody)
      return NextResponse.json({ error: 'Could not create video room' }, { status: 502 })
    }

    const room = await res.json()

    // Issue a short-lived meeting token scoped to this user so the room stays private.
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
    const tokenData = tokenRes.ok ? await tokenRes.json() : null

    return NextResponse.json({
      roomUrl: room.url,
      roomName,
      token: tokenData?.token || null,
    })
  } catch (err) {
    console.error('create-room error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
