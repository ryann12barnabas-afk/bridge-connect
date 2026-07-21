'use client'

// lib/storage.ts
// Helpers for uploading profile photos and verification documents to Firebase Storage.
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/firebase/config'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Please upload a JPEG, PNG, or WebP image.'
  if (file.size > MAX_FILE_SIZE) return 'Image must be smaller than 5MB.'
  return null
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const error = validateImageFile(file)
  if (error) throw new Error(error)

  const path = `profile-photos/${uid}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function uploadChatImage(matchId: string, uid: string, file: File): Promise<string> {
  const error = validateImageFile(file)
  if (error) throw new Error(error)

  const path = `chat-images/${matchId}/${uid}-${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function uploadVerificationDoc(uid: string, file: File): Promise<string> {
  const path = `verification-docs/${uid}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deletePhotoByUrl(url: string): Promise<void> {
  try {
    const photoRef = ref(storage, url)
    await deleteObject(photoRef)
  } catch (err) {
    console.warn('Could not delete photo (may already be removed):', err)
  }
}
