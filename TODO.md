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

## Post-Demo Polish
- [ ] Add product images/photos to product pages
- [ ] Add Stripe test key for payment processing (if POS is re-added)
- [ ] Configure Supabase email provider for password reset emails
- [ ] Verify forgot password and signup email verification flows
- [ ] Add notification bell/dropdown in header for alerts
- [ ] Connect POS tax rate to business_settings instead of hardcoded 7.5%
- [ ] Loading transitions between pages
- [ ] Dark mode support (CSS variables already set up)

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
