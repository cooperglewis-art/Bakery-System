# Bakery Orders App — Remaining Tasks

## Pre-Demo Checklist (Must Do)
- [x] Rotate/verify API keys are not exposed — confirmed safe
- [x] Create business_settings table — migration applied
- [x] Install Supabase CLI — added as dev dependency
- [x] Remove POS/Store feature — removed
- [x] Create demo seed data — 40 orders, 8 invoices, 90 days usage
- [x] Visual redesign — Inter font, stone palette, Apple-style shadows
- [x] Landing page — hero section with features grid
- [x] Enhanced dashboard — greeting, attention section, order cards
- [x] Empty states — friendly messages on all data pages
- [x] Page titles — browser tab titles on every page
- [x] Fix increment_customer_order_count function — SQL applied
- [x] Create invoices storage bucket in Supabase — bucket + policies applied
- [ ] Create demo login account (signup via the app or Supabase dashboard)
- [x] Verify all seed data is loaded in database — all counts confirmed

## Security (Completed)
- [x] Add authentication checks to all API routes — 401 on unauthenticated
- [x] Fix open redirect in auth callback — only allows /dashboard paths
- [x] Add Zod input validation to all API routes — 400 on invalid input
- [x] Invoice OCR cleanup — delete uploaded file from storage on failure
- [x] Server-side order total recalculation — prevents client tampering
- [x] Order creation transaction safety — cleanup on partial failure

## Post-Demo Polish
- [ ] Add product images/photos to product pages
- [ ] Add Stripe test key for payment processing (if POS is re-added)
- [ ] Configure Supabase email provider for password reset emails
- [ ] Verify forgot password and signup email verification flows
- [ ] Add notification bell/dropdown in header for alerts
- [x] Connect order tax rate to business_settings — dynamic, falls back to 7.5%
- [x] Loading skeletons on all dashboard pages
- [x] Searchable product dropdown in order form
- [ ] Dark mode support (CSS variables already set up)

## Code Quality (Completed)
- [x] README with features, tech stack, and setup instructions
- [x] .env.example with all required variables
- [x] Vitest test suite — 28 tests (rate limiting, order numbers, validation schemas)
- [x] Fix inconsistent created_by foreign keys — all reference auth.users(id)

## Future Features
- [ ] Customer-facing order portal (customers can place orders online)
- [ ] Email/SMS notifications when order status changes
- [ ] Recipe costing — calculate profit margins per product
- [ ] Calendar view for orders by delivery date
- [ ] Bulk order import/export (CSV)
- [ ] Multi-location support
- [ ] Supplier management (beyond invoice tracking)
- [ ] Inventory auto-deduction when orders are completed

## Technical Debt
- [ ] Set up Supabase CLI login and link for migration management
- [ ] Fix npm cache ownership issue (needs sudo chown)
- [ ] Add proper error boundaries on all pages
- [ ] Add integration tests for critical flows
- [ ] Set up CI/CD pipeline
- [ ] Deploy to Vercel or similar
