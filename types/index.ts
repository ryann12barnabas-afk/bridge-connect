// types/index.ts
// Central TypeScript interfaces for Bridge Connect

export type Gender = 'male' | 'female' | 'non-binary' | 'other'
export type LookingFor = 'male' | 'female' | 'everyone'
export type RelationshipIntent = 'friendship' | 'dating' | 'networking'
export type RelationshipStatus = 'single' | 'divorced' | 'widowed' | 'complicated' | 'prefer-not-to-say'
export type SubscriptionPlan = 'weekly' | 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'expired' | 'none'
export type PaymentStatus = 'pending' | 'success' | 'failed'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned'
export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type MessageType = 'text' | 'image' | 'system'
export type NotificationType =
  | 'new_match'
  | 'new_friend_request'
  | 'payment_success'
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'new_message'
  | 'video_call_invite'
  | 'profile_verified'

export interface User {
  uid: string
  email: string
  phoneNumber?: string
  firstName: string
  lastName: string
  username: string
  createdAt: string // ISO timestamp
  updatedAt: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isBanned: boolean
  isAdmin: boolean
  role: 'user' | 'admin' | 'moderator'
  authProvider: 'password' | 'google' | 'phone'
  freeMeetsRemaining: number
  profileCompletionPercent: number
  lastActiveAt: string
  onlineStatus: boolean
  dailyLikesUsed: number
  dailyLikesResetAt: string
}

export interface Profile {
  uid: string
  age: number
  gender: Gender
  lookingFor: LookingFor
  country: string
  county: string
  town: string
  photoURL: string
  photos: string[]
  bio: string
  interests: string[]
  relationshipStatus: RelationshipStatus
  relationshipIntent: RelationshipIntent
  occupation: string
  education: string
  isVerified: boolean
  verificationDocURL?: string
  latitude?: number
  longitude?: number
  updatedAt: string
}

export interface Subscription {
  uid: string
  status: SubscriptionStatus
  plan: SubscriptionPlan | null
  startedAt: string | null
  expiryDate: string | null
  paymentReference: string | null
  transactionId: string | null
  autoRenew: boolean
}

export interface Payment {
  id: string
  uid: string
  amount: number
  plan: SubscriptionPlan
  phoneNumber: string
  status: PaymentStatus
  mpesaReceiptNumber?: string
  merchantRequestId?: string
  checkoutRequestId?: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export interface Match {
  id: string
  users: [string, string]
  status: MatchStatus
  initiatedBy: string
  createdAt: string
  respondedAt?: string
  compatibilityScore?: number
  lastMessageAt?: string
  lastMessagePreview?: string
}

export interface Message {
  id: string
  matchId: string
  senderId: string
  recipientId: string
  type: MessageType
  content: string
  imageURL?: string
  createdAt: string
  seenAt?: string
  isTyping?: boolean
}

export interface VideoCallSession {
  id: string
  matchId: string
  roomUrl: string
  roomName: string
  initiatedBy: string
  participants: string[]
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined'
  createdAt: string
  endedAt?: string
}

export interface Notification {
  id: string
  uid: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  createdAt: string
  relatedId?: string // matchId, paymentId, etc.
}

export interface Report {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  details: string
  status: ReportStatus
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
}

export interface FriendRequest {
  id: string
  fromUid: string
  toUid: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface AppSettings {
  freeMeetsCount: number
  weeklyPrice: number
  monthlyPrice: number
  yearlyPrice: number
  maintenanceMode: boolean
}

// ---- Form / validation payloads ----

export interface RegisterFormData {
  firstName: string
  lastName: string
  username: string
  age: number
  gender: Gender
  lookingFor: LookingFor
  country: string
  county: string
  town: string
  bio: string
  interests: string[]
  relationshipStatus: RelationshipStatus
  occupation: string
  education: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface MeetPreferences {
  ageMin: number
  ageMax: number
  gender: LookingFor
  county?: string
  interests?: string[]
  relationshipIntent?: RelationshipIntent
}

  export interface Like {
  id: string
  fromUid: string
  toUid: string
  createdAt: string
  }
