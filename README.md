# Sweet Delights Bakery

An order management system for small bakeries. Track orders, manage customers, scan supplier invoices with AI, and monitor business performance from a single dashboard.

## Features

- **Order Management** -- Create, track, and update orders through a full lifecycle (pending, confirmed, in progress, ready, completed)
- **Customer Tracking** -- Maintain a customer database with order history and contact details
- **AI-Powered Invoice OCR** -- Upload supplier invoices and extract line items automatically using Anthropic Claude
- **Ingredient Management** -- Track inventory with AI-assisted ingredient categorization
- **Demand Forecasting** -- Predict future order volume based on historical trends
- **Analytics Dashboard** -- Visualize revenue, order trends, and business metrics with interactive charts
- **Role-Based Settings** -- Configure business details, tax rates, and user preferences

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage, Row-Level Security) |
| AI | Anthropic Claude (invoice OCR, ingredient categorization) |
| Charts | Recharts |
| Validation | Zod, React Hook Form |

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd bakery-orders
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and Anthropic API credentials (see [Environment Variables](#environment-variables)).

4. Set up the database (see [Database Setup](#database-setup)).

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, for storage and admin operations) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude (invoice OCR and ingredient categorization) |

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL Editor to create tables, RLS policies, and functions.
3. Run `supabase/seed.sql` to insert initial reference data.
4. Apply migrations in `supabase/migrations/` in order.
5. Optionally run `supabase/demo-seed.sql` to load sample data for development.

## Project Structure

```
src/
  app/
    (auth)/        -- Login, forgot/reset password pages
    (dashboard)/   -- Main app pages (orders, customers, products, invoices, analytics, forecasting, settings)
    api/           -- API routes (order actions, invoice OCR, forecasting)
    auth/          -- Auth callback handler
  components/
    layout/        -- Sidebar, header, sign-out button
    ui/            -- shadcn/ui primitives
  lib/             -- Supabase clients, utilities, validation schemas
  types/           -- TypeScript type definitions
```
