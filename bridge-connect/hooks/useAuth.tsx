'use client'

// hooks/useAuth.tsx
// Global auth context: wraps Firebase Auth state + our Firestore `users` doc.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import type { User, Profile, Subscription } from '@/types'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  user: User | null
  profile: Profile | null
  subscription: Subscription | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  user: null,
  profile: null,
  subscription: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser)
      if (!fbUser) {
        setUser(null)
        setProfile(null)
        setSubscription(null)
        setLoading(false)
      }
    })
    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (!firebaseUser) return

    const unsubUser = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
      setUser(snap.exists() ? (snap.data() as User) : null)
      setLoading(false)
    })
    const unsubProfile = onSnapshot(doc(db, 'profiles', firebaseUser.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as Profile) : null)
    })
    const unsubSub = onSnapshot(doc(db, 'subscriptions', firebaseUser.uid), (snap) => {
      setSubscription(snap.exists() ? (snap.data() as Subscription) : null)
    })

    return () => {
      unsubUser()
      unsubProfile()
      unsubSub()
    }
  }, [firebaseUser])

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, user, profile, subscription, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
