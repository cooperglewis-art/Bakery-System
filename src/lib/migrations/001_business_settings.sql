CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings
CREATE POLICY "Authenticated users can read settings" ON business_settings
  FOR SELECT TO authenticated USING (true);

-- Only admins can update settings (checked via profiles.role)
CREATE POLICY "Admins can manage settings" ON business_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Seed default settings
INSERT INTO business_settings (key, value) VALUES
  ('business_name', '"Sweet Delights Bakery"'),
  ('business_phone', '""'),
  ('business_email', '""'),
  ('business_address', '""'),
  ('tax_rate', '0.075'),
  ('delivery_fee', '0'),
  ('business_hours', '"Mon-Sat 8am-6pm"'),
  ('order_lead_time_hours', '48'),
  ('order_number_prefix', '"SD"'),
  ('require_deposit', 'false'),
  ('default_deposit_percent', '50'),
  ('low_stock_threshold', '10'),
  ('notifications_new_order', 'true'),
  ('notifications_status_change', 'true')
ON CONFLICT (key) DO NOTHING;
