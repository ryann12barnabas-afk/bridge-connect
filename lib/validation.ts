// lib/validation.ts
import { z } from 'zod'

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name is too short').max(50),
    lastName: z.string().min(2, 'Last name is too short').max(50),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed'),
    age: z.coerce.number().int().min(18, 'You must be 18 or older').max(100),
    gender: z.enum(['male', 'female', 'non-binary', 'other']),
    lookingFor: z.enum(['male', 'female', 'everyone']),
    country: z.string().min(2, 'Country is required'),
    county: z.string().min(2, 'County is required'),
    town: z.string().min(1, 'Town is required'),
    bio: z.string().max(500, 'Bio must be under 500 characters').optional().default(''),
    interests: z.array(z.string()).max(15).optional().default([]),
    relationshipStatus: z.enum(['single', 'divorced', 'widowed', 'complicated', 'prefer-not-to-say']),
    occupation: z.string().max(100).optional().default(''),
    education: z.string().max(100).optional().default(''),
    phoneNumber: z
      .string()
      .regex(/^(?:\+254|0)7\d{8}$/, 'Enter a valid Kenyan phone number (e.g. 07XXXXXXXX)'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password needs at least one uppercase letter')
      .regex(/[0-9]/, 'Password needs at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const profileEditSchema = z.object({
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).max(15).optional(),
  occupation: z.string().max(100).optional(),
  education: z.string().max(100).optional(),
  town: z.string().min(1).optional(),
  county: z.string().min(1).optional(),
  relationshipStatus: z
    .enum(['single', 'divorced', 'widowed', 'complicated', 'prefer-not-to-say'])
    .optional(),
})

export const mpesaPhoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^(?:\+254|0)7\d{8}$/, 'Enter a valid M-Pesa number (e.g. 07XXXXXXXX)'),
  plan: z.enum(['weekly', 'monthly', 'yearly']),
})

export const reportUserSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.string().min(1, 'Please select a reason'),
  details: z.string().max(1000).optional().default(''),
})

export const messageSchema = z.object({
  content: z.string().min(1).max(2000),
})
