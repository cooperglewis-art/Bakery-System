-- Demo seed data for Sweet Delights Bakery
-- Run AFTER seed.sql to populate analytics and forecasting pages
-- Uses relative dates so data always looks fresh
-- Re-runnable with ON CONFLICT DO NOTHING

-- ============================================================
-- 1. PRODUCT-INGREDIENT MAPPINGS (recipes)
-- ============================================================

INSERT INTO product_ingredients (product_id, ingredient_id, quantity) VALUES
  -- Birthday Cake (8") - flour 2lb, sugar 1lb, butter 1lb, eggs 1dz, milk 0.5gal, vanilla 2oz, baking powder 0.05lb, salt 0.02lb
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Baking Powder' LIMIT 1), 0.0500),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Salt' LIMIT 1), 0.0200),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 1.5000),

  -- Birthday Cake (10") - larger quantities
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 3.0000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 1.5000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 1.5000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 1.5000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 3.0000),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Baking Powder' LIMIT 1), 0.0800),
  ((SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 2.0000),

  -- Sheet Cake (Quarter)
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 2.5000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 1.2500),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 1.5000),

  -- Sheet Cake (Half)
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 4.0000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 3.0000),

  -- Cheesecake
  ((SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Cream Cheese' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Heavy Cream' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.5000),

  -- Cupcakes (Dozen)
  ((SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 1.5000),
  ((SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 0.2500),
  ((SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 1.0000),

  -- Chocolate Chip Cookies (Dozen)
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Brown Sugar' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 0.2500),
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Chocolate Chips' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Baking Soda' LIMIT 1), 0.0200),

  -- Sugar Cookies (Dozen)
  ((SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 1.2500),
  ((SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 0.2500),
  ((SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Food Coloring Set' LIMIT 1), 0.1000),

  -- Sourdough Loaf
  ((SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 1.5000),
  ((SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Salt' LIMIT 1), 0.0500),
  ((SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Yeast' LIMIT 1), 0.0200),

  -- French Baguette
  ((SELECT id FROM products WHERE name = 'French Baguette' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'French Baguette' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Salt' LIMIT 1), 0.0300),
  ((SELECT id FROM products WHERE name = 'French Baguette' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Yeast' LIMIT 1), 0.0150),

  -- Cinnamon Rolls (6 pack)
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 1.5000),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Brown Sugar' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 0.2500),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 0.2500),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Yeast' LIMIT 1), 0.0300),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Cinnamon' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Cream Cheese' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 0.5000),

  -- Croissant
  ((SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 0.3000),
  ((SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.2500),
  ((SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 0.0500),
  ((SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 0.0800),
  ((SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 0.0600),
  ((SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Yeast' LIMIT 1), 0.0100),
  ((SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Salt' LIMIT 1), 0.0100),

  -- Apple Pie (9")
  ((SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 1.5000),
  ((SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 0.7500),
  ((SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Cinnamon' LIMIT 1), 1.0000),
  ((SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Nutmeg' LIMIT 1), 0.5000),
  ((SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Lemon Juice' LIMIT 1), 2.0000),
  ((SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Salt' LIMIT 1), 0.0200),

  -- Chocolate Croissant
  ((SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 0.3000),
  ((SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 0.2500),
  ((SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Chocolate Chips' LIMIT 1), 0.1500),
  ((SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 0.0500),
  ((SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 0.0800),
  ((SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), (SELECT id FROM ingredients WHERE name = 'Yeast' LIMIT 1), 0.0100)

ON CONFLICT (product_id, ingredient_id) DO NOTHING;


-- ============================================================
-- 2. ORDERS (40 orders over the last 60 days)
-- ============================================================
-- Each order uses WITH new_order AS (INSERT ... RETURNING id) pattern

-- Order 1: 58 days ago - completed, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Sarah Johnson' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '60 days', CURRENT_DATE - 58, '10:00 AM', true, '123 Oak St', 81.00, 6.48, 87.48, 45.00, 'Birthday party')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00);

-- Order 2: 55 days ago - completed, website, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Local Coffee Shop' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '57 days', CURRENT_DATE - 55, '6:00 AM', false, 63.00, 5.04, 68.04, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), 'Croissant', 6, 4.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), 'Chocolate Croissant', 4, 5.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Muffin (Large)' LIMIT 1), 'Muffin (Large)', 4, 3.50);

-- Order 3: 52 days ago - completed, dm_instagram, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Maria Garcia' LIMIT 1), 'completed', 'dm_instagram', CURRENT_DATE - interval '54 days', CURRENT_DATE - 52, '2:00 PM', true, '456 Elm Ave', 110.00, 8.80, 118.80, 60.00, 'Quinceañera cake')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), 'Birthday Cake (10")', 1, 65.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), 'Chocolate Chip Cookies (Dozen)', 0.5, 18.00);

-- Order 4: 50 days ago - completed, text, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Mike Chen' LIMIT 1), 'completed', 'text', CURRENT_DATE - interval '51 days', CURRENT_DATE - 50, '8:00 AM', false, 34.00, 2.72, 36.72, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), 'Sourdough Loaf', 2, 8.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), 'Cinnamon Rolls (6 pack)', 1, 18.00);

-- Order 5: 48 days ago - completed, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Corporate Events Inc' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '50 days', CURRENT_DATE - 48, '9:00 AM', true, '789 Corporate Blvd', 185.00, 14.80, 199.80, 100.00, 'Board meeting catering')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), 'Sheet Cake (Half)', 1, 70.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Assorted Cookie Platter' LIMIT 1), 'Assorted Cookie Platter', 2, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Danish (Assorted)' LIMIT 1), 'Danish (Assorted)', 6, 4.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Dinner Rolls (Dozen)' LIMIT 1), 'Dinner Rolls (Dozen)', 2, 12.00);

-- Order 6: 45 days ago - completed, dm_facebook, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Emily Davis' LIMIT 1), 'completed', 'dm_facebook', CURRENT_DATE - interval '47 days', CURRENT_DATE - 45, '12:00 PM', false, 53.00, 4.24, 57.24, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), 'Cheesecake (Whole)', 1, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), 'Chocolate Chip Cookies (Dozen)', 1, 18.00);

-- Order 7: 43 days ago - completed, website, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'The Smith Family' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '45 days', CURRENT_DATE - 43, '3:00 PM', true, '101 Maple Dr', 142.00, 11.36, 153.36, 70.00)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), 'Sheet Cake (Half)', 1, 70.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 2, 36.00);

-- Order 8: 40 days ago - completed, call, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'James Wilson' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '42 days', CURRENT_DATE - 40, '11:00 AM', false, 45.00, 3.60, 48.60, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00);

-- Order 9: 38 days ago - cancelled, text, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Emily Davis' LIMIT 1), 'cancelled', 'text', CURRENT_DATE - interval '40 days', CURRENT_DATE - 38, '2:00 PM', true, '222 Pine St', 65.00, 5.20, 70.20, 0, 'Customer cancelled - schedule conflict')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), 'Birthday Cake (10")', 1, 65.00);

-- Order 10: 36 days ago - completed, website, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Local Coffee Shop' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '38 days', CURRENT_DATE - 36, '6:00 AM', true, '55 Main St', 67.50, 5.40, 72.90, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), 'Croissant', 8, 4.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Scone' LIMIT 1), 'Scone', 5, 3.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Muffin (Large)' LIMIT 1), 'Muffin (Large)', 4, 3.50);

-- Order 11: 34 days ago - completed, call, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Mike Chen' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '35 days', CURRENT_DATE - 34, '9:00 AM', false, 40.00, 3.20, 43.20, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), 'Sourdough Loaf', 2, 8.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), 'Sugar Cookies (Dozen)', 1, 24.00);

-- Order 12: 32 days ago - completed, other, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Corporate Events Inc' LIMIT 1), 'completed', 'other', CURRENT_DATE - interval '34 days', CURRENT_DATE - 32, '10:00 AM', true, '789 Corporate Blvd', 155.00, 12.40, 167.40, 80.00, 'Employee appreciation event')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), 'Sheet Cake (Quarter)', 2, 40.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Assorted Cookie Platter' LIMIT 1), 'Assorted Cookie Platter', 1, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00);

-- Order 13: 30 days ago - completed, dm_instagram, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Maria Garcia' LIMIT 1), 'completed', 'dm_instagram', CURRENT_DATE - interval '32 days', CURRENT_DATE - 30, '1:00 PM', false, 63.00, 5.04, 68.04, 30.00)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), 'Chocolate Chip Cookies (Dozen)', 1, 18.00);

-- Order 14: 28 days ago - completed, text, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Sarah Johnson' LIMIT 1), 'completed', 'text', CURRENT_DATE - interval '30 days', CURRENT_DATE - 28, '11:00 AM', true, '123 Oak St', 89.00, 7.12, 96.12, 45.00)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), 'Cheesecake (Whole)', 1, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), 'Sugar Cookies (Dozen)', 1, 24.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Half Dozen)' LIMIT 1), 'Cupcakes (Half Dozen)', 1, 20.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'French Baguette' LIMIT 1), 'French Baguette', 2, 5.00);

-- Order 15: 26 days ago - completed, website, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Local Coffee Shop' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '28 days', CURRENT_DATE - 26, '6:00 AM', false, 55.50, 4.44, 59.94, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), 'Croissant', 6, 4.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), 'Chocolate Croissant', 4, 5.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Scone' LIMIT 1), 'Scone', 2, 3.50);

-- Order 16: 24 days ago - completed, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'The Smith Family' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '26 days', CURRENT_DATE - 24, '4:00 PM', true, '101 Maple Dr', 130.00, 10.40, 140.40, 65.00, 'Family reunion')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), 'Birthday Cake (10")', 1, 65.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Assorted Cookie Platter' LIMIT 1), 'Assorted Cookie Platter', 1, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), 'Apple Pie (9")', 1, 28.00);

-- Order 17: 22 days ago - completed, dm_facebook, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'James Wilson' LIMIT 1), 'completed', 'dm_facebook', CURRENT_DATE - interval '24 days', CURRENT_DATE - 22, '10:00 AM', false, 46.00, 3.68, 49.68, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), 'Apple Pie (9")', 1, 28.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), 'Chocolate Chip Cookies (Dozen)', 1, 18.00);

-- Order 18: 20 days ago - completed, website, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Corporate Events Inc' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '22 days', CURRENT_DATE - 20, '8:00 AM', true, '789 Corporate Blvd', 168.00, 13.44, 181.44, 90.00)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), 'Sheet Cake (Half)', 1, 70.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Oatmeal Raisin Cookies (Dozen)' LIMIT 1), 'Oatmeal Raisin Cookies (Dozen)', 1, 18.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), 'Cinnamon Rolls (6 pack)', 1, 18.00);

-- Order 19: 18 days ago - completed, text, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Mike Chen' LIMIT 1), 'completed', 'text', CURRENT_DATE - interval '20 days', CURRENT_DATE - 18, '9:00 AM', false, 34.00, 2.72, 36.72, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), 'Sourdough Loaf', 2, 8.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), 'Cinnamon Rolls (6 pack)', 1, 18.00);

-- Order 20: 16 days ago - completed, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Maria Garcia' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '18 days', CURRENT_DATE - 16, '2:00 PM', true, '456 Elm Ave', 101.00, 8.08, 109.08, 50.00, 'Baby shower')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Half Dozen)' LIMIT 1), 'Cupcakes (Half Dozen)', 1, 20.00);

-- Order 21: 15 days ago - completed, dm_instagram, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Emily Davis' LIMIT 1), 'completed', 'dm_instagram', CURRENT_DATE - interval '17 days', CURRENT_DATE - 15, '12:00 PM', false, 60.00, 4.80, 64.80, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Pecan Pie (9")' LIMIT 1), 'Pecan Pie (9")', 1, 32.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), 'Apple Pie (9")', 1, 28.00);

-- Order 22: 14 days ago - completed, website, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Local Coffee Shop' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '16 days', CURRENT_DATE - 14, '6:00 AM', true, '55 Main St', 72.00, 5.76, 77.76, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), 'Croissant', 8, 4.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), 'Chocolate Croissant', 4, 5.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Danish (Assorted)' LIMIT 1), 'Danish (Assorted)', 4, 4.00);

-- Order 23: 12 days ago - completed, text, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Sarah Johnson' LIMIT 1), 'completed', 'text', CURRENT_DATE - interval '14 days', CURRENT_DATE - 12, '10:00 AM', false, 42.00, 3.36, 45.36, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), 'Sugar Cookies (Dozen)', 1, 24.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), 'Chocolate Chip Cookies (Dozen)', 1, 18.00);

-- Order 24: 11 days ago - completed, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Corporate Events Inc' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '13 days', CURRENT_DATE - 11, '9:00 AM', true, '789 Corporate Blvd', 192.00, 15.36, 207.36, 100.00, 'Client lunch meeting')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), 'Sheet Cake (Half)', 1, 70.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Dinner Rolls (Dozen)' LIMIT 1), 'Dinner Rolls (Dozen)', 3, 12.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Assorted Cookie Platter' LIMIT 1), 'Assorted Cookie Platter', 2, 35.00);

-- Order 25: 10 days ago - completed, website, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Mike Chen' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '12 days', CURRENT_DATE - 10, '8:00 AM', false, 34.00, 2.72, 36.72, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), 'Sourdough Loaf', 2, 8.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), 'Cinnamon Rolls (6 pack)', 1, 18.00);

-- Order 26: 9 days ago - completed, dm_instagram, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Maria Garcia' LIMIT 1), 'completed', 'dm_instagram', CURRENT_DATE - interval '11 days', CURRENT_DATE - 9, '3:00 PM', true, '456 Elm Ave', 83.00, 6.64, 89.64, 45.00)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Half Dozen)' LIMIT 1), 'Cupcakes (Half Dozen)', 1, 20.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), 'Chocolate Chip Cookies (Dozen)', 1, 18.00);

-- Order 27: 8 days ago - completed, other, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'The Smith Family' LIMIT 1), 'completed', 'other', CURRENT_DATE - interval '10 days', CURRENT_DATE - 8, '11:00 AM', false, 93.00, 7.44, 100.44, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), 'Cheesecake (Whole)', 1, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Key Lime Pie (9")' LIMIT 1), 'Key Lime Pie (9")', 1, 26.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Pecan Pie (9")' LIMIT 1), 'Pecan Pie (9")', 1, 32.00);

-- Order 28: 7 days ago - completed, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Local Coffee Shop' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '9 days', CURRENT_DATE - 7, '6:00 AM', true, '55 Main St', 60.00, 4.80, 64.80, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), 'Croissant', 8, 4.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Muffin (Large)' LIMIT 1), 'Muffin (Large)', 4, 3.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Scone' LIMIT 1), 'Scone', 2, 3.50);

-- Order 29: 6 days ago - completed, text, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'James Wilson' LIMIT 1), 'completed', 'text', CURRENT_DATE - interval '8 days', CURRENT_DATE - 6, '12:00 PM', false, 53.00, 4.24, 57.24, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), 'Cheesecake (Whole)', 1, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Chip Cookies (Dozen)' LIMIT 1), 'Chocolate Chip Cookies (Dozen)', 1, 18.00);

-- Order 30: 5 days ago - completed, website, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Sarah Johnson' LIMIT 1), 'completed', 'website', CURRENT_DATE - interval '7 days', CURRENT_DATE - 5, '2:00 PM', true, '123 Oak St', 117.00, 9.36, 126.36, 60.00, 'Anniversary celebration')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), 'Birthday Cake (10")', 1, 65.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sugar Cookies (Dozen)' LIMIT 1), 'Sugar Cookies (Dozen)', 1, 24.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), 'Apple Pie (9")', 1, 28.00);

-- Order 31: 4 days ago - completed, dm_facebook, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Emily Davis' LIMIT 1), 'completed', 'dm_facebook', CURRENT_DATE - interval '6 days', CURRENT_DATE - 4, '10:00 AM', false, 54.00, 4.32, 58.32, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Oatmeal Raisin Cookies (Dozen)' LIMIT 1), 'Oatmeal Raisin Cookies (Dozen)', 1, 18.00);

-- Order 32: 3 days ago - completed, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Corporate Events Inc' LIMIT 1), 'completed', 'call', CURRENT_DATE - interval '5 days', CURRENT_DATE - 3, '9:00 AM', true, '789 Corporate Blvd', 146.00, 11.68, 157.68, 75.00)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Quarter)' LIMIT 1), 'Sheet Cake (Quarter)', 2, 40.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Dinner Rolls (Dozen)' LIMIT 1), 'Dinner Rolls (Dozen)', 1, 12.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), 'Cinnamon Rolls (6 pack)', 1, 18.00);

-- Order 33: 2 days ago - cancelled, website, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'James Wilson' LIMIT 1), 'cancelled', 'website', CURRENT_DATE - interval '4 days', CURRENT_DATE - 2, '11:00 AM', false, 45.00, 3.60, 48.60, 0, 'No-show')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00);

-- Order 34: 1 day ago - completed, text, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Mike Chen' LIMIT 1), 'completed', 'text', CURRENT_DATE - interval '3 days', CURRENT_DATE - 1, '8:00 AM', true, '333 Cedar Ln', 52.00, 4.16, 56.16, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sourdough Loaf' LIMIT 1), 'Sourdough Loaf', 2, 8.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'French Baguette' LIMIT 1), 'French Baguette', 2, 5.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cinnamon Rolls (6 pack)' LIMIT 1), 'Cinnamon Rolls (6 pack)', 1, 18.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Dinner Rolls (Dozen)' LIMIT 1), 'Dinner Rolls (Dozen)', 1, 12.00);

-- Order 35: today - ready, dm_instagram, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Maria Garcia' LIMIT 1), 'ready', 'dm_instagram', CURRENT_DATE - interval '3 days', CURRENT_DATE, '2:00 PM', true, '456 Elm Ave', 101.00, 8.08, 109.08, 50.00, 'Custom flower decorations')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Half Dozen)' LIMIT 1), 'Cupcakes (Half Dozen)', 1, 20.00);

-- Order 36: today - ready, call, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Sarah Johnson' LIMIT 1), 'ready', 'call', CURRENT_DATE - interval '2 days', CURRENT_DATE, '11:00 AM', false, 63.00, 5.04, 68.04, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cheesecake (Whole)' LIMIT 1), 'Cheesecake (Whole)', 1, 35.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), 'Apple Pie (9")', 1, 28.00);

-- Order 37: today - in_progress, website, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Local Coffee Shop' LIMIT 1), 'in_progress', 'website', CURRENT_DATE - interval '1 day', CURRENT_DATE, '6:00 AM', true, '55 Main St', 69.00, 5.52, 74.52, 0)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Croissant' LIMIT 1), 'Croissant', 8, 4.50),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Chocolate Croissant' LIMIT 1), 'Chocolate Croissant', 6, 5.00);

-- Order 38: tomorrow - pending, text, pickup
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'The Smith Family' LIMIT 1), 'pending', 'text', CURRENT_DATE, CURRENT_DATE + 1, '3:00 PM', false, 135.00, 10.80, 145.80, 70.00, 'Graduation party')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (10")' LIMIT 1), 'Birthday Cake (10")', 1, 65.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Assorted Cookie Platter' LIMIT 1), 'Assorted Cookie Platter', 1, 35.00);

-- Order 39: 2 days from now - pending, call, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Corporate Events Inc' LIMIT 1), 'pending', 'call', CURRENT_DATE, CURRENT_DATE + 2, '10:00 AM', true, '789 Corporate Blvd', 190.00, 15.20, 205.20, 100.00)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), 'Sheet Cake (Half)', 1, 70.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Sheet Cake (Half)' LIMIT 1), 'Sheet Cake (Half)', 1, 70.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Cupcakes (Dozen)' LIMIT 1), 'Cupcakes (Dozen)', 1, 36.00);

-- Order 40: 3 days from now - ready, dm_facebook, delivery
WITH new_order AS (
  INSERT INTO orders (id, customer_id, status, source, order_date, delivery_date, delivery_time_slot, is_delivery, delivery_address, subtotal, tax, total, deposit_paid, notes)
  VALUES (gen_random_uuid(), (SELECT id FROM customers WHERE name = 'Maria Garcia' LIMIT 1), 'ready', 'dm_facebook', CURRENT_DATE - interval '2 days', CURRENT_DATE + 3, '1:00 PM', true, '456 Elm Ave', 73.00, 5.84, 78.84, 35.00, 'Extra frosting requested')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Birthday Cake (8")' LIMIT 1), 'Birthday Cake (8")', 1, 45.00),
  ((SELECT id FROM new_order), (SELECT id FROM products WHERE name = 'Apple Pie (9")' LIMIT 1), 'Apple Pie (9")', 1, 28.00);


-- ============================================================
-- 3. INVOICES & INVOICE ITEMS (8 invoices over last 90 days)
-- ============================================================

-- Invoice 1: Sysco Foods, 85 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Sysco Foods', 'SYS-20260115', CURRENT_DATE - 85, 387.50, 'verified', CURRENT_DATE - 55)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 'Unsalted Butter 36ct', 25.0000, 'lb', 4.50, 112.50, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Cream Cheese' LIMIT 1), 'Cream Cheese Blocks', 15.0000, 'lb', 4.00, 60.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Heavy Cream' LIMIT 1), 'Heavy Whipping Cream', 20.0000, 'quart', 5.00, 100.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 'Large Eggs Grade A', 15.0000, 'dozen', 4.00, 60.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 'Whole Milk', 10.0000, 'gallon', 4.50, 45.00, true);

-- Invoice 2: Restaurant Depot, 75 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Restaurant Depot', 'RD-88421', CURRENT_DATE - 75, 285.00, 'verified', CURRENT_DATE - 45)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 'All Purpose Flour 50lb bag', 100.0000, 'lb', 0.50, 50.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 'Granulated Sugar 25lb', 50.0000, 'lb', 0.60, 30.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 'Powdered Sugar 25lb', 50.0000, 'lb', 0.80, 40.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Chocolate Chips' LIMIT 1), 'Semi-Sweet Choc Chips 10lb', 20.0000, 'lb', 5.00, 100.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 'Pure Vanilla Extract 16oz', 16.0000, 'oz', 2.00, 32.00, true);

-- Invoice 3: Valley Dairy Farm, 60 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Valley Dairy Farm', 'VDF-3341', CURRENT_DATE - 60, 245.00, 'verified', CURRENT_DATE - 30)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 'Farm Butter Unsalted', 20.0000, 'lb', 4.75, 95.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 'Free Range Eggs', 20.0000, 'dozen', 4.25, 85.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 'Fresh Whole Milk', 8.0000, 'gallon', 4.50, 36.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Heavy Cream' LIMIT 1), 'Heavy Cream', 12.0000, 'quart', 5.25, 63.00, true);

-- Invoice 4: Golden Grain Mills, 50 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Golden Grain Mills', 'GGM-7892', CURRENT_DATE - 50, 198.00, 'verified', CURRENT_DATE - 20)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 'Bread Flour 50lb', 100.0000, 'lb', 0.52, 52.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 'Pastry Flour 50lb', 80.0000, 'lb', 0.55, 44.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Yeast' LIMIT 1), 'Active Dry Yeast 2lb', 4.0000, 'lb', 8.00, 32.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Brown Sugar' LIMIT 1), 'Dark Brown Sugar 25lb', 40.0000, 'lb', 0.75, 30.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 'Granulated Sugar 25lb', 50.0000, 'lb', 0.60, 30.00, true);

-- Invoice 5: Sysco Foods, 35 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Sysco Foods', 'SYS-20260205', CURRENT_DATE - 35, 425.50, 'verified', CURRENT_DATE - 5)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 'Unsalted Butter 36ct', 30.0000, 'lb', 4.65, 139.50, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Cream Cheese' LIMIT 1), 'Philadelphia Cream Cheese', 20.0000, 'lb', 4.10, 82.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 'Large Eggs Grade A', 18.0000, 'dozen', 4.00, 72.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Heavy Cream' LIMIT 1), 'Heavy Whipping Cream', 16.0000, 'quart', 5.00, 80.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 'Whole Milk', 12.0000, 'gallon', 4.50, 54.00, true);

-- Invoice 6: Restaurant Depot, 20 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Restaurant Depot', 'RD-89102', CURRENT_DATE - 20, 312.00, 'verified', CURRENT_DATE + 10)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 'All Purpose Flour 50lb', 80.0000, 'lb', 0.52, 41.60, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Sugar' LIMIT 1), 'Granulated Sugar 25lb', 40.0000, 'lb', 0.62, 24.80, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Chocolate Chips' LIMIT 1), 'Semi-Sweet Choc Chips 10lb', 15.0000, 'lb', 5.10, 76.50, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Cocoa Powder' LIMIT 1), 'Dutch Process Cocoa 5lb', 10.0000, 'lb', 6.20, 62.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Vanilla Extract' LIMIT 1), 'Pure Vanilla Extract 16oz', 16.0000, 'oz', 2.10, 33.60, true);

-- Invoice 7: Valley Dairy Farm, 10 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Valley Dairy Farm', 'VDF-3455', CURRENT_DATE - 10, 278.00, 'verified', CURRENT_DATE + 20)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Butter' LIMIT 1), 'Farm Butter Unsalted', 22.0000, 'lb', 4.80, 105.60, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Eggs' LIMIT 1), 'Free Range Eggs', 18.0000, 'dozen', 4.30, 77.40, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Milk' LIMIT 1), 'Fresh Whole Milk', 10.0000, 'gallon', 4.50, 45.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Heavy Cream' LIMIT 1), 'Heavy Cream', 10.0000, 'quart', 5.00, 50.00, true);

-- Invoice 8: Golden Grain Mills, 5 days ago
WITH new_invoice AS (
  INSERT INTO invoices (id, supplier_name, invoice_number, invoice_date, total_amount, status, due_date)
  VALUES (gen_random_uuid(), 'Golden Grain Mills', 'GGM-8011', CURRENT_DATE - 5, 175.50, 'verified', CURRENT_DATE + 25)
  RETURNING id
)
INSERT INTO invoice_items (invoice_id, ingredient_id, description, quantity, unit, unit_cost, total_cost, is_matched) VALUES
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'All-Purpose Flour' LIMIT 1), 'All Purpose Flour 50lb', 100.0000, 'lb', 0.53, 53.00, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Brown Sugar' LIMIT 1), 'Dark Brown Sugar 25lb', 30.0000, 'lb', 0.78, 23.40, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Yeast' LIMIT 1), 'Active Dry Yeast 2lb', 3.0000, 'lb', 8.50, 25.50, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Cinnamon' LIMIT 1), 'Ground Cinnamon 8oz', 16.0000, 'oz', 0.80, 12.80, true),
  ((SELECT id FROM new_invoice), (SELECT id FROM ingredients WHERE name = 'Powdered Sugar' LIMIT 1), 'Powdered Sugar 25lb', 40.0000, 'lb', 0.82, 32.80, true);


-- ============================================================
-- 4. INGREDIENT USAGE DAILY (last 90 days)
-- ============================================================
-- Generate realistic daily usage with weekday/weekend variance

INSERT INTO ingredient_usage_daily (ingredient_id, usage_date, quantity_used, order_count)
SELECT
  ing.id,
  d.usage_date,
  ROUND(CAST(
    base_usage.base_qty
    * CASE EXTRACT(DOW FROM d.usage_date)
        WHEN 0 THEN 0.40  -- Sunday: low
        WHEN 6 THEN 0.85  -- Saturday: moderate-high
        ELSE 1.0 + (random() * 0.3 - 0.15)  -- Weekdays: full with +-15% variance
      END
    * (0.85 + random() * 0.30)  -- Additional day-to-day variance +-15%
  AS NUMERIC), 4),
  CASE EXTRACT(DOW FROM d.usage_date)
    WHEN 0 THEN GREATEST(1, FLOOR(random() * 2)::int)
    WHEN 6 THEN GREATEST(1, FLOOR(random() * 3 + 1)::int)
    ELSE GREATEST(1, FLOOR(random() * 4 + 2)::int)
  END
FROM ingredients ing
CROSS JOIN generate_series(CURRENT_DATE - 90, CURRENT_DATE - 1, interval '1 day') AS d(usage_date)
INNER JOIN (
  -- Base daily usage quantities per ingredient (realistic for a small bakery)
  VALUES
    ('All-Purpose Flour',  8.0),
    ('Sugar',              4.0),
    ('Brown Sugar',        1.5),
    ('Butter',             4.0),
    ('Eggs',               3.0),
    ('Milk',               1.5),
    ('Heavy Cream',        2.0),
    ('Vanilla Extract',    3.0),
    ('Baking Powder',      0.15),
    ('Baking Soda',        0.08),
    ('Salt',               0.12),
    ('Chocolate Chips',    1.5),
    ('Cocoa Powder',       0.8),
    ('Cream Cheese',       1.5),
    ('Powdered Sugar',     2.5),
    ('Yeast',              0.10),
    ('Cinnamon',           1.0),
    ('Nutmeg',             0.3),
    ('Lemon Juice',        1.0),
    ('Food Coloring Set',  0.05)
) AS base_usage(ing_name, base_qty)
ON ing.name = base_usage.ing_name
ON CONFLICT (ingredient_id, usage_date) DO NOTHING;
