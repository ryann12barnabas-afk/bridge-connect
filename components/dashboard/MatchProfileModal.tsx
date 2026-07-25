'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiXMark, HiOutlineMapPin, HiOutlineBriefcase, HiOutlineFlag, HiOutlineNoSymbol,
} from 'react-icons/hi2'
import { blockUser } from '@/lib/blocks'
import { submitReport } from '@/lib/reports'
import { getSpotifyEmbedUrl } from '@/lib/spotify'
import type { User, Profile } from '@/types'

const REPORT_REASONS = [
  'Inappropriate photos', 'Harassment or abuse', 'Fake profile', 'Underage user', 'Spam or scam', 'Other',
]

interface Props {
  show: boolean
  currentUid: string
  otherUser?: User
  otherProfile?: Profile
  onClose: () => void
  onBlocked?: () => void
}

export default function MatchProfileModal({ show, currentUid, otherUser, otherProfile, onClose, onBlocked }: Props) {
  const [mode, setMode] = useState<'view' | 'report' | 'confirmBlock'>('view')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  const photos = [otherProfile?.photoURL, ...(otherProfile?.photos || [])].filter(Boolean) as string[]
  const embedUrl = otherProfile?.spotifyTrackUrl ? getSpotifyEmbedUrl(otherProfile.spotifyTrackUrl) : null

  const handleClose = () => {
    setMode('view')
    setReason('')
    setDetails('')
    setPhotoIndex(0)
    onClose()
  }

  const handleBlock = async () => {
    if (!otherUser) return
    setSubmitting(true)
    try {
      await blockUser(currentUid, otherUser.uid)
      toast.success(`${otherUser.firstName} has been blocked.`)
      onBlocked?.()
      handleClose()
    } catch {
      toast.error('Could not block right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReport = async () => {
    if (!otherUser || !reason) {
      toast.error('Please select a reason.')
      return
    }
    setSubmitting(true)
    try {
      await submitReport(currentUid, otherUser.uid, reason, details)
      toast.success('Report submitted. Our team will review it.')
      handleClose()
    } catch {
      toast.error('Could not submit report right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-xl2 bg-white shadow-glass dark:bg-brand-ink sm:rounded-xl2"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-5 py-4 backdrop-blur dark:bg-brand-ink/95">
              <p className="font-display font-semibold">
                {mode === 'view' ? 'Profile' : mode === 'report' ? 'Report user' : 'Block user'}
              </p>
              <button onClick={handleClose} aria-label="Close"><HiXMark className="h-5 w-5" /></button>
            </div>

            {mode === 'view' && otherProfile && otherUser && (
              <div>
                <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-brand-blueLight to-brand-purple">
                  {photos.length > 0 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[photoIndex]} alt={otherUser.firstName} className="h-full w-full object-cover" />
                  )}

                  {photos.length > 1 && (
                    <div className="absolute left-2 right-2 top-2 flex gap-1">
                      {photos.map((_, i) => (
                        <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/40">
                          <div className={`h-full bg-white ${i <= photoIndex ? 'w-full' : 'w-0'}`} />
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIndex((i) => Math.max(i - 1, 0))}
                        className="absolute left-0 top-0 h-full w-1/2"
                        aria-label="Previous photo"
                      />
                      <button
                        onClick={() => setPhotoIndex((i) => Math.min(i + 1, photos.length - 1))}
                        className="absolute right-0 top-0 h-full w-1/2"
                        aria-label="Next photo"
                      />
                    </>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-bold">{otherUser.firstName}, {otherProfile.age}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-brand-ink/60 dark:text-white/60">
                    <HiOutlineMapPin className="h-4 w-4" /> {otherProfile.town}, {otherProfile.county}
                  </p>
                  {otherProfile.occupation && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-brand-ink/60 dark:text-white/60">
                      <HiOutlineBriefcase className="h-4 w-4" /> {otherProfile.occupation}
                    </p>
                  )}
                  {otherProfile.bio && <p className="mt-3 text-sm text-brand-ink/70 dark:text-white/70">{otherProfile.bio}</p>}
                  {otherProfile.interests?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {otherProfile.interests.map((i) => (
                        <span key={i} className="rounded-full bg-brand-mist px-2.5 py-1 text-xs text-brand-blue dark:bg-white/10">{i}</span>
                      ))}
                    </div>
                  )}
                  {embedUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl">
                      <iframe src={embedUrl} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify preview" />
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setMode('report')} className="btn-secondary flex-1 !py-2.5 text-sm">
                      <HiOutlineFlag /> Report
                    </button>
                    <button onClick={() => setMode('confirmBlock')} className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white">
                      <span className="inline-flex items-center gap-2"><HiOutlineNoSymbol /> Block</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'report' && (
              <div className="p-5">
                <p className="text-sm text-brand-ink/60 dark:text-white/60">Why are you reporting {otherUser?.firstName}?</p>
                <div className="mt-4 space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`block w-full rounded-xl border px-4 py-2.5 text-left text-sm ${reason === r ? 'border-brand-purple bg-brand-mist dark:bg-white/10' : 'border-gray-200 dark:border-white/10'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  className="input-field mt-4"
                  rows={3}
                  placeholder="Additional details (optional)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
                <div className="mt-4 flex gap-3">
                  <button onClick={() => setMode('view')} className="btn-secondary flex-1 !py-2.5 text-sm">Back</button>
                  <button onClick={handleReport} disabled={submitting} className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white">
                    {submitting ? 'Submitting…' : 'Submit report'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'confirmBlock' && (
              <div className="p-5 text-center">
                <HiOutlineNoSymbol className="mx-auto h-10 w-10 text-red-500" />
                <p className="mt-3 font-semibold">Block {otherUser?.firstName}?</p>
                <p className="mt-1 text-sm text-brand-ink/60 dark:text-white/60">
                  They won&apos;t be able to message you or see your profile again. This can&apos;t be easily undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setMode('view')} className="btn-secondary flex-1 !py-2.5 text-sm">Cancel</button>
                  <button onClick={handleBlock} disabled={submitting} className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white">
                    {submitting ? 'Blocking…' : 'Confirm block'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
