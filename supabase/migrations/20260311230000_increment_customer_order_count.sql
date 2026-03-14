CREATE OR REPLACE FUNCTION increment_customer_order_count(customer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET order_count = order_count + 1
  WHERE id = customer_id
    AND created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
