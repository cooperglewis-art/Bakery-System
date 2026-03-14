-- Security hardening follow-up:
-- 1) Ensure created_by defaults are applied on all tenant-scoped tables
-- 2) Backfill legacy null created_by rows to the earliest profile for continuity
-- 3) Tighten update policies so created_by cannot be reassigned
-- 4) Scope invoice storage policies to per-user folder paths
-- 5) Convert SECURITY DEFINER business RPCs to SECURITY INVOKER with user scoping

-- ============================================================================
-- created_by defaults
-- ============================================================================
ALTER TABLE customers ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE categories ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE products ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE ingredients ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE orders ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE invoices ALTER COLUMN created_by SET DEFAULT auth.uid();

-- ============================================================================
-- Backfill legacy rows with null ownership
-- ============================================================================
DO $$
DECLARE
  owner_id UUID;
BEGIN
  SELECT id INTO owner_id
  FROM profiles
  ORDER BY created_at ASC
  LIMIT 1;

  IF owner_id IS NOT NULL THEN
    UPDATE customers SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE categories SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE products SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE ingredients SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE orders SET created_by = owner_id WHERE created_by IS NULL;
    UPDATE invoices SET created_by = owner_id WHERE created_by IS NULL;
  END IF;
END $$;

-- ============================================================================
-- Tighten update policies on tenant-owned parent records
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage settings" ON business_settings;
CREATE POLICY "Admins can manage settings" ON business_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update own customers" ON customers;
CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own ingredients" ON ingredients;
CREATE POLICY "Users can update own ingredients" ON ingredients
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- Scope storage policies by user folder: invoices/<auth.uid()>/...
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can upload invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read invoices" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON storage.objects;

CREATE POLICY "Users can upload own invoices" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own invoices" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own invoices" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Harden RPCs
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_customer_order_count(customer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET order_count = order_count + 1
  WHERE id = customer_id
    AND created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

CREATE OR REPLACE FUNCTION populate_ingredient_usage(target_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO ingredient_usage_daily (ingredient_id, usage_date, quantity_used, order_count)
  SELECT
    pi.ingredient_id,
    target_date,
    SUM(oi.quantity * pi.quantity),
    COUNT(DISTINCT o.id)
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_ingredients pi ON pi.product_id = oi.product_id
  JOIN products p ON p.id = pi.product_id
  JOIN ingredients i ON i.id = pi.ingredient_id
  WHERE o.delivery_date = target_date
    AND o.status NOT IN ('cancelled')
    AND o.created_by = auth.uid()
    AND p.created_by = auth.uid()
    AND i.created_by = auth.uid()
  GROUP BY pi.ingredient_id
  ON CONFLICT (ingredient_id, usage_date)
  DO UPDATE SET
    quantity_used = EXCLUDED.quantity_used,
    order_count = EXCLUDED.order_count;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

CREATE OR REPLACE FUNCTION search_orders(
  search_term TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  date_filter DATE DEFAULT NULL,
  page_size INT DEFAULT 25,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  order_number INT,
  status TEXT,
  source TEXT,
  delivery_date DATE,
  delivery_time_slot TEXT,
  total NUMERIC,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.order_number,
    o.status,
    o.source,
    o.delivery_date,
    o.delivery_time_slot,
    o.total,
    c.name AS customer_name,
    c.phone AS customer_phone,
    COALESCE(oi_agg.items, '[]'::JSONB) AS items,
    COUNT(*) OVER() AS total_count
  FROM orders o
  LEFT JOIN customers c ON c.id = o.customer_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', oi.id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price
      )
    ) AS items
    FROM order_items oi
    WHERE oi.order_id = o.id
  ) oi_agg ON true
  WHERE
    o.created_by = auth.uid()
    AND (c.id IS NULL OR c.created_by = auth.uid())
    AND (status_filter IS NULL OR o.status = status_filter)
    AND (date_filter IS NULL OR o.delivery_date = date_filter)
    AND (
      search_term IS NULL
      OR c.name ILIKE '%' || search_term || '%'
      OR c.phone ILIKE '%' || search_term || '%'
      OR o.order_number::TEXT = search_term
    )
  ORDER BY o.delivery_date ASC, o.created_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER;
