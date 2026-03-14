# Bakery System

Bakery System is a Next.js + Supabase app for:
- Order management
- Customer tracking
- Supplier invoice capture (OCR)
- Ingredient matching and cost tracking
- Forecasting and analytics dashboards

## 1. Requirements

- Node.js 20+
- npm 10+
- Supabase project
- Anthropic API key (for invoice OCR)

## 2. Environment Setup

1. Copy env template:
```bash
cp .env.example .env.local
```

2. Fill values in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

## 3. Database Setup

Apply schema and migrations in your Supabase project:

```bash
supabase db push
```

Seed core data:
```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
psql "$SUPABASE_DB_URL" -f supabase/demo-seed.sql
```

Notes:
- The latest migration (`20260313090000_security_hardening.sql`) applies tenant-scoped security hardening and ownership defaults.
- Invoice files are scoped by user folder in storage: `invoices/<auth.uid()>/...`

## 4. Run Locally

Install dependencies:
```bash
npm ci
```

Start dev server:
```bash
npm run dev
```

Open:
- [http://localhost:3000](http://localhost:3000)

## 5. Demo Login

Create a demo user through the app:
- `/login` -> sign up

Then sign in and open:
- `/dashboard`

## 6. Quality Checks

Lint:
```bash
npm run lint
```

Type check:
```bash
npx tsc --noEmit
```

Production build:
```bash
npm run build
```

## 7. Deployment

Recommended:
- Vercel for Next.js app
- Supabase for Postgres/Auth/Storage

Before production:
- Rotate all API keys
- Configure Supabase email provider
- Create at least one admin account in `profiles`
- Verify RLS and storage policies in production project
