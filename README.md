# Bakery System

Bakery System is a Next.js + Supabase app for small bakery operations.
It centralizes orders, customers, supplier invoices, and business analytics in one dashboard.

## Features

- Order management with full status lifecycle
- Customer tracking with notes and order history
- AI-powered invoice OCR via Anthropic Claude
- Ingredient matching and cost updates from invoices
- Forecasting and analytics dashboards
- Role-based settings and team controls

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| AI | Anthropic Claude |
| Validation | Zod, React Hook Form |
| Charts | Recharts |

## 1. Requirements

- Node.js 20+
- npm 10+
- Supabase project
- Anthropic API key

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

Apply schema and migrations:

```bash
supabase db push
```

Seed data:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
psql "$SUPABASE_DB_URL" -f supabase/demo-seed.sql
```

Notes:
- `20260313090000_security_hardening.sql` adds tenant-scoped hardening and ownership defaults.
- Invoice files are stored per-user path: `invoices/<auth.uid()>/...`.

## 4. Run Locally

Install dependencies:
```bash
npm ci
```

Start dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Demo Login

Create a demo account in-app:
- Visit `/login`
- Use the Sign Up tab
- Then sign in and open `/dashboard`

## 6. Quality Checks

Lint:
```bash
npm run lint
```

Type check:
```bash
npx tsc --noEmit
```

Critical tests:
```bash
npm run test:critical
```

Production build:
```bash
npm run build
```

## 7. Deployment

Recommended:
- Vercel for Next.js
- Supabase for database/auth/storage

Before production:
- Rotate API keys
- Configure Supabase email provider
- Ensure at least one `admin` in `profiles`
- Verify RLS/storage policies in production

## Project Structure

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
    auth/
  components/
    layout/
    ui/
  lib/
  types/
```
