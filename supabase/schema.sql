-- Bakery Orders Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  order_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone)
);

-- Product categories (cakes, cookies, bread, pastries, etc.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products/Menu items
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  prep_time_hours INTEGER DEFAULT 24,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredients master list
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10,2),
  supplier TEXT,
  category TEXT DEFAULT 'Other',
  min_stock_level DECIMAL(10,2),
  current_stock DECIMAL(10,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product-to-ingredient mapping (recipe)
CREATE TABLE product_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,4) NOT NULL,
  UNIQUE(product_id, ingredient_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled')),
  source TEXT NOT NULL
    CHECK (source IN ('call', 'text', 'dm_instagram', 'dm_facebook', 'walk_in', 'website', 'other')),
  order_date TIMESTAMPTZ DEFAULT NOW(),
  delivery_date DATE NOT NULL,
  delivery_time_slot TEXT,
  is_delivery BOOLEAN DEFAULT false,
  delivery_address TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order line items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  customizations JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (supplier invoices for ingredient tracking)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_name TEXT NOT NULL,
  invoice_number TEXT,
  invoice_date DATE NOT NULL,
  total_amount DECIMAL(10,2),
  image_url TEXT,
  ocr_raw_text TEXT,
  ocr_confidence DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'verified')),
  due_date DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items (extracted from invoices)
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,4) NOT NULL,
  unit TEXT,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  is_matched BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forecasting data (aggregated for performance)
CREATE TABLE ingredient_usage_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  quantity_used DECIMAL(10,4) NOT NULL,
  order_count INTEGER DEFAULT 0,
  UNIQUE(ingredient_id, usage_date)
);

-- Indexes for performance
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_ingredient_usage_date ON ingredient_usage_daily(usage_date);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_usage_daily ENABLE ROW LEVEL SECURITY;

-- Policies: Tenant-scoped data access
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view own products" ON products
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view own ingredients" ON ingredients
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own ingredients" ON ingredients
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own ingredients" ON ingredients
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own ingredients" ON ingredients
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can update own order items" ON order_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can delete own order items" ON order_items
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can view own invoice items" ON invoice_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

CREATE POLICY "Users can insert own invoice items" ON invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

CREATE POLICY "Users can update own invoice items" ON invoice_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

CREATE POLICY "Users can delete own invoice items" ON invoice_items
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.created_by = auth.uid()));

CREATE POLICY "Users can view own product ingredients" ON product_ingredients
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

CREATE POLICY "Users can insert own product ingredients" ON product_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

CREATE POLICY "Users can update own product ingredients" ON product_ingredients
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

CREATE POLICY "Users can delete own product ingredients" ON product_ingredients
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND products.created_by = auth.uid()));

CREATE POLICY "Users can view own ingredient usage" ON ingredient_usage_daily
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

CREATE POLICY "Users can insert own ingredient usage" ON ingredient_usage_daily
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

CREATE POLICY "Users can update own ingredient usage" ON ingredient_usage_daily
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

CREATE POLICY "Users can delete own ingredient usage" ON ingredient_usage_daily
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM ingredients WHERE ingredients.id = ingredient_usage_daily.ingredient_id AND ingredients.created_by = auth.uid()));

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order status history (audit log)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can insert own order status history" ON order_status_history
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can update own order status history" ON order_status_history
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

CREATE POLICY "Users can delete own order status history" ON order_status_history
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.created_by = auth.uid()));

-- Additional indexes for forecasting
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_ingredient_usage_ingredient ON ingredient_usage_daily(ingredient_id);

-- Function to increment customer order_count safely within tenant scope
CREATE OR REPLACE FUNCTION increment_customer_order_count(customer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET order_count = order_count + 1
  WHERE id = customer_id
    AND created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to populate ingredient usage from orders
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

-- Function to search orders with filters and pagination (single round-trip)
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
