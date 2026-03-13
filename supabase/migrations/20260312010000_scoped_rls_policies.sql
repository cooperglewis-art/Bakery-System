-- Migration: Replace overly-permissive RLS policies with user-scoped policies
-- Each user can only access data they created

-- ============================================================================
-- 1. Add created_by column to tables that don't have one
-- ============================================================================

-- orders already has created_by (references profiles(id))
-- invoices already has created_by (references profiles(id))

ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- ============================================================================
-- 2. Drop existing permissive policies and create scoped ones for parent tables
-- ============================================================================

-- --- customers ---
DROP POLICY IF EXISTS "Authenticated users can view customers" ON customers;

CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- --- categories ---
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- --- products ---
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

CREATE POLICY "Users can view own products" ON products
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- --- ingredients ---
DROP POLICY IF EXISTS "Authenticated users can manage ingredients" ON ingredients;

CREATE POLICY "Users can view own ingredients" ON ingredients
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own ingredients" ON ingredients
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own ingredients" ON ingredients
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete own ingredients" ON ingredients
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- --- orders ---
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- --- invoices ---
DROP POLICY IF EXISTS "Authenticated users can manage invoices" ON invoices;

CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ============================================================================
-- 3. Drop existing permissive policies and create scoped ones for child tables
-- ============================================================================

-- --- order_items (scoped through parent orders) ---
DROP POLICY IF EXISTS "Authenticated users can manage order_items" ON order_items;

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can update own order items" ON order_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can delete own order items" ON order_items
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

-- --- invoice_items (scoped through parent invoices) ---
DROP POLICY IF EXISTS "Authenticated users can manage invoice_items" ON invoice_items;

CREATE POLICY "Users can view own invoice items" ON invoice_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

CREATE POLICY "Users can insert own invoice items" ON invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

CREATE POLICY "Users can update own invoice items" ON invoice_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

CREATE POLICY "Users can delete own invoice items" ON invoice_items
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

-- --- order_status_history (scoped through parent orders) ---
DROP POLICY IF EXISTS "Authenticated users can manage order_status_history" ON order_status_history;

CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can insert own order status history" ON order_status_history
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can update own order status history" ON order_status_history
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can delete own order status history" ON order_status_history
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

-- --- product_ingredients (scoped through parent products) ---
DROP POLICY IF EXISTS "Authenticated users can manage product_ingredients" ON product_ingredients;

CREATE POLICY "Users can view own product ingredients" ON product_ingredients
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

CREATE POLICY "Users can insert own product ingredients" ON product_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

CREATE POLICY "Users can update own product ingredients" ON product_ingredients
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

CREATE POLICY "Users can delete own product ingredients" ON product_ingredients
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

-- --- ingredient_usage_daily (scoped through parent ingredients) ---
DROP POLICY IF EXISTS "Authenticated users can manage ingredient_usage_daily" ON ingredient_usage_daily;

CREATE POLICY "Users can view own ingredient usage" ON ingredient_usage_daily
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

CREATE POLICY "Users can insert own ingredient usage" ON ingredient_usage_daily
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

CREATE POLICY "Users can update own ingredient usage" ON ingredient_usage_daily
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

CREATE POLICY "Users can delete own ingredient usage" ON ingredient_usage_daily
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

-- ============================================================================
-- NOTE: profiles and business_settings policies are left unchanged.
-- profiles: users can view all profiles, update only their own.
-- business_settings: all authenticated can read, only admins can write.
-- ============================================================================
