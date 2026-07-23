'use client'

// lib/auth-actions.ts
// Client-side functions that perform registration/login/etc against Firebase Auth + Firestore.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import type { RegisterInput } from './validation'
import { sanitizeInput, calcProfileCompletion } from './utils'
import { FREE_MEETS_DEFAULT } from './constants'

export async function registerUser(data: RegisterInput) {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password)
  const uid = cred.user.uid

  await updateFirebaseProfile(cred.user, {
    displayName: `${data.firstName} ${data.lastName}`,
  })

  const now = new Date().toISOString()

  const userDoc = {
    uid,
    email: data.email,
    phoneNumber: data.phoneNumber,
    firstName: sanitizeInput(data.firstName),
    lastName: sanitizeInput(data.lastName),
    username: sanitizeInput(data.username),
    createdAt: now,
    updatedAt: now,
    isEmailVerified: false,
    isPhoneVerified: false,
    isBanned: false,
    isAdmin: false,
    role: 'user',
    authProvider: 'password',
    freeMeetsRemaining: FREE_MEETS_DEFAULT,
    profileCompletionPercent: 0,
    lastActiveAt: now,
    onlineStatus: true,
    dailyLikesUsed: 0,
    dailyLikesResetAt: '',
    }
  }

  const profileDoc = {
    uid,
    age: data.age,
    gender: data.gender,
    lookingFor: data.lookingFor,
    country: sanitizeInput(data.country),
    county: sanitizeInput(data.county),
    town: sanitizeInput(data.town),
    photoURL: '',
    photos: [],
    bio: sanitizeInput(data.bio || ''),
    interests: data.interests || [],
    relationshipStatus: data.relationshipStatus,
    relationshipIntent: 'dating',
    occupation: sanitizeInput(data.occupation || ''),
    education: sanitizeInput(data.education || ''),
    isVerified: false,
    updatedAt: now,
  }

  userDoc.profileCompletionPercent = calcProfileCompletion({
    photoURL: profileDoc.photoURL,
    bio: profileDoc.bio,
    interests: profileDoc.interests,
    occupation: profileDoc.occupation,
    education: profileDoc.education,
  })

  await setDoc(doc(db, 'users', uid), userDoc)
  await setDoc(doc(db, 'profiles', uid), profileDoc)
  await setDoc(doc(db, 'subscriptions', uid), {
    uid,
    status: 'none',
    plan: null,
    startedAt: null,
    expiryDate: null,
    paymentReference: null,
    transactionId: null,
    autoRenew: false,
  })

  await sendEmailVerification(cred.user)

  return cred.user
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const uid = cred.user.uid
  const now = new Date().toISOString()

  // Create the Firestore user doc on first Google sign-in if it doesn't exist.
  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      email: cred.user.email || '',
      firstName: cred.user.displayName?.split(' ')[0] || '',
      lastName: cred.user.displayName?.split(' ').slice(1).join(' ') || '',
      username: (cred.user.email || uid).split('@')[0],
      updatedAt: now,
      createdAt: now,
      isEmailVerified: cred.user.emailVerified,
      isPhoneVerified: false,
      isBanned: false,
      isAdmin: false,
      role: 'user',
      authProvider: 'google',
      freeMeetsRemaining: FREE_MEETS_DEFAULT,
      profileCompletionPercent: 0,
      lastActiveAt: now,
      onlineStatus: true,
    },
    { merge: true }
  )

  return cred.user
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}
