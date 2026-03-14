-- Migration: Standardize created_by/changed_by foreign keys to reference auth.users(id)
-- orders and invoices referenced profiles(id), while newer tables reference auth.users(id).
-- Since profiles.id mirrors auth.users.id (via handle_new_user trigger), this is functionally
-- equivalent but inconsistent. Align everything to auth.users(id).

-- orders.created_by: profiles(id) -> auth.users(id)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_created_by_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- invoices.created_by: profiles(id) -> auth.users(id)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_created_by_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- order_status_history.changed_by: profiles(id) -> auth.users(id)
ALTER TABLE order_status_history DROP CONSTRAINT IF EXISTS order_status_history_changed_by_fkey;
ALTER TABLE order_status_history ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);
