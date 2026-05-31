# Resumatch — Setup Guide

## Project structure

```
resumatch/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Design system
│   ├── dashboard/page.tsx       # Main product UI
│   ├── upgrade/page.tsx         # Pricing / Stripe checkout
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts    # OAuth callback
│   └── api/
│       ├── tailor/route.ts      # Core AI endpoint
│       ├── export/route.ts      # .docx download
│       ├── stripe/route.ts      # Checkout session
│       └── webhook/route.ts     # Stripe webhook
├── lib/
│   ├── supabase.ts              # DB client
│   ├── tailor.ts                # Anthropic AI prompt
│   └── stripe.ts                # Stripe client
└── supabase-schema.sql          # Run once in Supabase
```

## Setup steps

### 1. Supabase
1. Create a project at https://supabase.com
2. Go to SQL Editor → paste and run `supabase-schema.sql`
3. Copy from Project Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Google Gemini (FREE!)
1. Get your API key at https://aistudio.google.com/app/apikey
2. Add as `GEMINI_API_KEY`
3. 1,500 free requests/day available!

### 3. Stripe
1. Create account at https://stripe.com
2. Create a Product → add a $15/month recurring Price
3. Copy the Price ID → `STRIPE_PRO_PRICE_ID`
4. Copy Secret key → `STRIPE_SECRET_KEY`
5. Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
6. For webhooks (local dev): `stripe listen --forward-to localhost:3000/api/webhook`
7. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 4. Fill in .env.local
All keys go into `.env.local` (already created with placeholders).

### 5. Run
```bash
npm run dev
```
Visit http://localhost:3000

## Deploy to Vercel
1. Push to GitHub
2. Import in Vercel
3. Add all env vars in Vercel dashboard
4. Update `NEXT_PUBLIC_APP_URL` to your production URL
5. Update Stripe webhook endpoint to your Vercel URL + `/api/webhook`

## Next features to build (Sprint 3)
- [ ] LinkedIn URL → auto-fetch job description
- [ ] Resume history page (`/dashboard/history`)
- [ ] Referral system (give 3 extra free uses per referral)
- [ ] Email notifications when tailor completes
