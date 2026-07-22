'use client'

import { useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { HiOutlinePhoneXMark, HiOutlineMicrophone, HiOutlineVideoCamera } from 'react-icons/hi2'

interface VideoCallRoomProps {
  roomUrl: string
  token?: string | null
  onLeave: () => void
  /** If set, the call auto-ends once this many seconds have elapsed (used for free-trial calls). */
  timeLimitSeconds?: number
  /** Called when the time limit is hit, right before the call is force-ended. */
  onTimeUp?: () => void
}

export default function VideoCallRoom({
  roomUrl, token, onLeave, timeLimitSeconds, onTimeUp,
}: VideoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callRef = useRef<DailyCall | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [joining, setJoining] = useState(true)
  const [remaining, setRemaining] = useState(timeLimitSeconds ?? null)

  useEffect(() => {
    if (!containerRef.current) return

    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: { width: '100%', height: '100%', border: '0', borderRadius: '1rem' },
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

  useEffect(() => {
    if (remaining === null) return
    if (remaining <= 0) {
      onTimeUp?.()
      callRef.current?.leave()
      onLeave()
      return
    }
    const t = setTimeout(() => setRemaining((r) => (r !== null ? r - 1 : null)), 1000)
    return () => clearTimeout(t)
  }, [remaining, onLeave, onTimeUp])

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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
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
        {remaining !== null && (
          <div className={`absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold text-white backdrop-blur ${remaining <= 30 ? 'bg-red-500/80' : 'bg-black/50'}`}>
            Free call · {formatTime(remaining)} left
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
}    })
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
