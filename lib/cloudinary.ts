'use client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Please upload a JPEG, PNG, or WebP image.'
  if (file.size > MAX_FILE_SIZE) return 'Image must be smaller than 5MB.'
  return null
}

/** Uploads an image directly from the browser to Cloudinary using an unsigned preset. */
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const error = validateImageFile(file)
  if (error) throw new Error(error)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Photo uploads are not configured yet.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || 'Image upload failed.')
  }

  const data = await res.json()
  return data.secure_url as string
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `bridge-connect/profile-photos/${uid}`)
}

export async function uploadChatImage(matchId: string, uid: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `bridge-connect/chat-images/${matchId}`)
}

export async function uploadVerificationDoc(uid: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `bridge-connect/verification-docs/${uid}`)
}
