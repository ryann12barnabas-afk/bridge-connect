# Bridge Connect

**Connecting Hearts. Building Friendships.**

A premium social networking platform for meeting new friends, finding romantic partners, chatting, and building genuine connections — with realtime chat and face-to-face video calling.

## Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Auth & Database:** Firebase Authentication + Firestore + Storage
- **Payments:** M-Pesa Daraja STK Push (weekly / monthly / yearly plans)
- **Video calling:** Daily.co (WebRTC, embedded prebuilt call UI)
- **Forms:** React Hook Form + Zod

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Visit `http://localhost:3000`.

## Environment variables

Fill in `.env.local` (never commit real secrets):

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project settings → General → Your apps → SDK config |
| `FIREBASE_ADMIN_*` | Firebase Console → Project settings → Service accounts → Generate new private key |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | Safaricom Daraja portal → your app's keys |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | Daraja portal (use `174379` / the sandbox passkey for testing) |
| `MPESA_CALLBACK_URL` | Must be a **public HTTPS URL** — e.g. your Vercel deployment + `/api/mpesa/callback`. Safaricom cannot reach `localhost`, so use `ngrok` while developing locally. |
| `DAILY_API_KEY` | [dashboard.daily.co](https://dashboard.daily.co) → Developers → API keys |
| `JWT_SECRET` | Any long random string |

## Firebase setup

1. Create a Firebase project → enable **Authentication** (Email/Password + Google providers), **Firestore**, and **Storage**.
2. Deploy security rules and indexes:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # select your project
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
3. In Firestore, no manual collection creation is needed — collections (`users`, `profiles`, `subscriptions`, `payments`, `matches`, `notifications`, `reports`) are created automatically on first write.
4. To make your own account an admin (for `/admin`), manually set `isAdmin: true` and `role: "admin"` on your `users/{uid}` document in the Firebase console.

## M-Pesa (Daraja) setup

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke) and get your sandbox consumer key/secret.
2. Set `MPESA_ENV=sandbox` while testing; switch to `production` (with production credentials + a paybill/till shortcode) when you go live.
3. The STK push flow: `app/dashboard/subscription` → `/api/mpesa/stkpush` (initiates the push) → Safaricom calls `/api/mpesa/callback` (a **public** webhook) → Firestore `subscriptions/{uid}` is activated with an expiry date matching the chosen plan.

## Video calling (Daily.co)

1. Sign up at [daily.co](https://daily.co) and copy your API key into `DAILY_API_KEY`.
2. Calling is gated to Premium subscribers. From an open chat, tapping the camera icon calls `/api/video/create-room`, which provisions a private, auto-expiring 2-person room server-side and writes a `videoCalls` document that both users' clients listen to — this is what makes the other person's phone "ring" with the `IncomingCallModal`.
3. Free tier covers light usage; check Daily's pricing before scaling up.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it in [vercel.com/new](https://vercel.com/new).
3. Add all variables from `.env.example` in **Project Settings → Environment Variables**.
4. Deploy. Update `MPESA_CALLBACK_URL` and `NEXT_PUBLIC_APP_URL` to your live Vercel URL, then redeploy.

## Project structure

```
bridge-connect/
  app/                  # Next.js App Router pages & API routes
    (auth)/             # login, register, forgot-password, verify-email
    dashboard/          # authenticated user area (meet, chat, matches, profile…)
    admin/              # admin-only panel (analytics, users, payments, reports)
    api/                # mpesa, video, auth session routes
  components/           # landing, auth, dashboard, admin, video UI components
  firebase/             # client + admin SDK initialization
  lib/                  # business logic: auth, meet-matching, chat, mpesa, video, admin
  types/                # shared TypeScript interfaces
  firestore.rules        # Firestore security rules
  storage.rules           # Storage security rules
```

## Notes on production hardening

- The free-tier "3 free meets" logic lives client-side for responsiveness but is enforced again by Firestore rules and should be moved to a Cloud Function trigger for full tamper-resistance before scaling.
- `middleware.ts` checks for a session cookie for routing; the cookie itself is verified server-side via Firebase Admin (`app/api/auth/session/route.ts`).
- Rate limiting for API routes (STK push, video room creation) should be added at the edge (e.g. Vercel's rate limiting or Upstash) before public launch to prevent abuse.
