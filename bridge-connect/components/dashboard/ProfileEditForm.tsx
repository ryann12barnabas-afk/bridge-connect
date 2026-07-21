'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { doc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { HiOutlineCamera } from 'react-icons/hi2'
import { db } from '@/firebase/config'
import { profileEditSchema } from '@/lib/validation'
import { uploadProfilePhoto } from '@/lib/storage'
import { useAuth } from '@/hooks/useAuth'
import { INTERESTS_LIST, KENYA_COUNTIES, calcProfileCompletion, sanitizeInput } from '@/lib/utils'
import { z } from 'zod'

type FormData = z.infer<typeof profileEditSchema>

export default function ProfileEditForm() {
  const { user, profile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [interests, setInterests] = useState<string[]>(profile?.interests || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      bio: profile?.bio,
      occupation: profile?.occupation,
      education: profile?.education,
      town: profile?.town,
      county: profile?.county,
      relationshipStatus: profile?.relationshipStatus,
    },
  })

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      await updateDoc(doc(db, 'profiles', user.uid), { photoURL: url, updatedAt: new Date().toISOString() })
      toast.success('Photo updated!')
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        ...data,
        bio: sanitizeInput(data.bio || ''),
        interests,
        updatedAt: new Date().toISOString(),
      })

      const completion = calcProfileCompletion({
        photoURL: profile?.photoURL,
        bio: data.bio,
        interests,
        occupation: data.occupation,
        education: data.education,
      })
      await updateDoc(doc(db, 'users', user.uid), { profileCompletionPercent: completion })

      toast.success('Profile updated!')
    } catch {
      toast.error('Could not update profile.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-bridge-gradient">
          {profile?.photoURL && (
            <Image src={profile.photoURL} alt="Profile photo" fill className="object-cover" />
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary !py-2 text-sm"
          >
            <HiOutlineCamera /> {uploading ? 'Uploading…' : 'Change photo'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Bio</label>
        <textarea className="input-field mt-1" rows={3} {...register('bio')} />
        {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">County</label>
          <select className="input-field mt-1" {...register('county')}>
            {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Town</label>
          <input className="input-field mt-1" {...register('town')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Occupation</label>
          <input className="input-field mt-1" {...register('occupation')} />
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Education</label>
          <input className="input-field mt-1" {...register('education')} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Relationship status</label>
        <select className="input-field mt-1" {...register('relationshipStatus')}>
          <option value="single">Single</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
          <option value="complicated">It&apos;s complicated</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-brand-ink/60 dark:text-white/60">Interests</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS_LIST.map((interest) => (
            <button
              type="button"
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                interests.includes(interest)
                  ? 'border-brand-purple bg-brand-purple text-white'
                  : 'border-gray-200 text-brand-ink/70 dark:border-white/10 dark:text-white/70'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
