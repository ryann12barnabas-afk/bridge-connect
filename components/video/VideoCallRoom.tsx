'use client'

import { useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { HiOutlinePhoneXMark, HiOutlineMicrophone, HiOutlineVideoCamera } from 'react-icons/hi2'

interface VideoCallRoomProps {
  roomUrl: string
  token?: string | null
  onLeave: () => void
}

/**
 * Embeds a Daily.co call in a full-screen overlay. Daily's prebuilt iframe
 * handles device permissions, network resilience, and layout for us, which is
 * why we use it instead of hand-rolling raw WebRTC signaling.
 */
export default function VideoCallRoom({ roomUrl, token, onLeave }: VideoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callRef = useRef<DailyCall | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [joining, setJoining] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '1rem',
      },
      showLeaveButton: false,
      showFullscreenButton: true,
    })
    callRef.current = callFrame

    callFrame
      .join({ url: roomUrl, token: token || undefined })
      .then(() => setJoining(false))
      .catch((err) => {
        console.error('Failed to join call:', err)
        setJoining(false)
      })

    callFrame.on('left-meeting', onLeave)

    return () => {
      callFrame.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUrl, token])

  const toggleMic = () => {
    callRef.current?.setLocalAudio(!micOn)
    setMicOn((v) => !v)
  }

  const toggleCam = () => {
    callRef.current?.setLocalVideo(!camOn)
    setCamOn((v) => !v)
  }

  const leaveCall = async () => {
    await callRef.current?.leave()
    onLeave()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4">
      <div className="relative flex-1 overflow-hidden rounded-2xl">
        {joining && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-brand-ink">
            <div className="text-center text-white">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              <p className="mt-4 text-sm">Connecting…</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMic}
          className={`grid h-12 w-12 place-items-center rounded-full text-white ${micOn ? 'bg-white/20' : 'bg-red-500'}`}
          aria-label="Toggle microphone"
        >
          <HiOutlineMicrophone className="h-5 w-5" />
        </button>
        <button
          onClick={leaveCall}
          className="grid h-14 w-14 place-items-center rounded-full bg-red-500 text-white"
          aria-label="Leave call"
        >
          <HiOutlinePhoneXMark className="h-6 w-6" />
        </button>
        <button
          onClick={toggleCam}
          className={`grid h-12 w-12 place-items-center rounded-full text-white ${camOn ? 'bg-white/20' : 'bg-red-500'}`}
          aria-label="Toggle camera"
        >
          <HiOutlineVideoCamera className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
