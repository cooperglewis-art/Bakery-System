-- Sample data for Sweet Delights Bakery
-- Run this after schema.sql

-- Categories
INSERT INTO categories (name, description, display_order) VALUES
  ('Cakes', 'Custom cakes for all occasions', 1),
  ('Cupcakes', 'Individual cupcakes and cupcake dozens', 2),
  ('Cookies', 'Fresh baked cookies', 3),
  ('Bread', 'Artisan breads and rolls', 4),
  ('Pastries', 'Croissants, danishes, and more', 5),
  ('Pies', 'Fruit pies and cream pies', 6),
  ('Specialty', 'Seasonal and specialty items', 7);

-- Products
INSERT INTO products (category_id, name, description, base_price, prep_time_hours) VALUES
  -- Cakes
  ((SELECT id FROM categories WHERE name = 'Cakes'), 'Birthday Cake (8")', 'Classic round cake, serves 10-12', 45.00, 48),
  ((SELECT id FROM categories WHERE name = 'Cakes'), 'Birthday Cake (10")', 'Large round cake, serves 16-20', 65.00, 48),
  ((SELECT id FROM categories WHERE name = 'Cakes'), 'Sheet Cake (Quarter)', 'Quarter sheet, serves 12-16', 40.00, 24),
  ((SELECT id FROM categories WHERE name = 'Cakes'), 'Sheet Cake (Half)', 'Half sheet, serves 24-30', 70.00, 24),
  ((SELECT id FROM categories WHERE name = 'Cakes'), 'Sheet Cake (Full)', 'Full sheet, serves 48-60', 120.00, 48),
  ((SELECT id FROM categories WHERE name = 'Cakes'), 'Wedding Cake Tier', 'Custom tiered wedding cake (per tier)', 150.00, 72),
  ((SELECT id FROM categories WHERE name = 'Cakes'), 'Cheesecake (Whole)', 'New York style cheesecake', 35.00, 24),

  -- Cupcakes
  ((SELECT id FROM categories WHERE name = 'Cupcakes'), 'Cupcakes (Dozen)', 'Assorted flavors, dozen', 36.00, 24),
  ((SELECT id FROM categories WHERE name = 'Cupcakes'), 'Cupcakes (Half Dozen)', 'Assorted flavors, 6 count', 20.00, 24),
  ((SELECT id FROM categories WHERE name = 'Cupcakes'), 'Mini Cupcakes (2 Dozen)', 'Bite-sized, 24 count', 30.00, 24),
  ((SELECT id FROM categories WHERE name = 'Cupcakes'), 'Gourmet Cupcake (Single)', 'Premium decorated cupcake', 5.00, 24),

  -- Cookies
  ((SELECT id FROM categories WHERE name = 'Cookies'), 'Chocolate Chip Cookies (Dozen)', 'Classic chocolate chip', 18.00, 4),
  ((SELECT id FROM categories WHERE name = 'Cookies'), 'Sugar Cookies (Dozen)', 'Decorated sugar cookies', 24.00, 24),
  ((SELECT id FROM categories WHERE name = 'Cookies'), 'Oatmeal Raisin Cookies (Dozen)', 'Chewy oatmeal raisin', 18.00, 4),
  ((SELECT id FROM categories WHERE name = 'Cookies'), 'Assorted Cookie Platter', 'Mix of 24 cookies', 35.00, 4),
  ((SELECT id FROM categories WHERE name = 'Cookies'), 'Custom Cookie (Single)', 'Large decorated cookie', 8.00, 24),

  -- Bread
  ((SELECT id FROM categories WHERE name = 'Bread'), 'Sourdough Loaf', 'Artisan sourdough', 8.00, 24),
  ((SELECT id FROM categories WHERE name = 'Bread'), 'French Baguette', 'Classic French bread', 5.00, 4),
  ((SELECT id FROM categories WHERE name = 'Bread'), 'Ciabatta Loaf', 'Italian ciabatta', 6.00, 4),
  ((SELECT id FROM categories WHERE name = 'Bread'), 'Dinner Rolls (Dozen)', 'Soft dinner rolls', 12.00, 4),
  ((SELECT id FROM categories WHERE name = 'Bread'), 'Cinnamon Rolls (6 pack)', 'Fresh cinnamon rolls with icing', 18.00, 4),

  -- Pastries
  ((SELECT id FROM categories WHERE name = 'Pastries'), 'Croissant', 'Butter croissant', 4.50, 4),
  ((SELECT id FROM categories WHERE name = 'Pastries'), 'Chocolate Croissant', 'Pain au chocolat', 5.00, 4),
  ((SELECT id FROM categories WHERE name = 'Pastries'), 'Danish (Assorted)', 'Fruit or cheese danish', 4.00, 4),
  ((SELECT id FROM categories WHERE name = 'Pastries'), 'Muffin (Large)', 'Various flavors', 3.50, 4),
  ((SELECT id FROM categories WHERE name = 'Pastries'), 'Scone', 'Fresh baked scone', 3.50, 4),

  -- Pies
  ((SELECT id FROM categories WHERE name = 'Pies'), 'Apple Pie (9")', 'Classic apple pie', 28.00, 24),
  ((SELECT id FROM categories WHERE name = 'Pies'), 'Pumpkin Pie (9")', 'Traditional pumpkin', 24.00, 24),
  ((SELECT id FROM categories WHERE name = 'Pies'), 'Pecan Pie (9")', 'Southern pecan pie', 32.00, 24),
  ((SELECT id FROM categories WHERE name = 'Pies'), 'Cherry Pie (9")', 'Sweet cherry filling', 28.00, 24),
  ((SELECT id FROM categories WHERE name = 'Pies'), 'Key Lime Pie (9")', 'Tangy key lime', 26.00, 24);

-- Sample ingredients
INSERT INTO ingredients (name, unit, unit_cost, supplier, min_stock_level, current_stock) VALUES
  ('All-Purpose Flour', 'lb', 0.50, 'Restaurant Depot', 50, 100),
  ('Sugar', 'lb', 0.60, 'Restaurant Depot', 30, 75),
  ('Brown Sugar', 'lb', 0.75, 'Restaurant Depot', 20, 40),
  ('Butter', 'lb', 4.50, 'Sysco', 20, 50),
  ('Eggs', 'dozen', 4.00, 'Local Farm', 10, 24),
  ('Milk', 'gallon', 4.50, 'Dairy Fresh', 5, 10),
  ('Heavy Cream', 'quart', 5.00, 'Dairy Fresh', 8, 16),
  ('Vanilla Extract', 'oz', 2.00, 'Restaurant Depot', 8, 16),
  ('Baking Powder', 'lb', 3.00, 'Restaurant Depot', 2, 5),
  ('Baking Soda', 'lb', 1.50, 'Restaurant Depot', 2, 5),
  ('Salt', 'lb', 0.50, 'Restaurant Depot', 5, 10),
  ('Chocolate Chips', 'lb', 5.00, 'Restaurant Depot', 10, 25),
  ('Cocoa Powder', 'lb', 6.00, 'Restaurant Depot', 5, 12),
  ('Cream Cheese', 'lb', 4.00, 'Sysco', 10, 20),
  ('Powdered Sugar', 'lb', 0.80, 'Restaurant Depot', 20, 50),
  ('Yeast', 'lb', 8.00, 'Restaurant Depot', 2, 4),
  ('Cinnamon', 'oz', 0.75, 'Restaurant Depot', 8, 16),
  ('Nutmeg', 'oz', 1.00, 'Restaurant Depot', 4, 8),
  ('Lemon Juice', 'oz', 0.20, 'Restaurant Depot', 16, 32),
  ('Food Coloring Set', 'set', 15.00, 'Restaurant Depot', 2, 5);

-- Sample customers
INSERT INTO customers (name, phone, email, notes, order_count) VALUES
  ('Sarah Johnson', '555-0101', 'sarah.j@email.com', 'Prefers chocolate cake', 5),
  ('Mike Chen', '555-0102', 'mike.chen@email.com', 'Regular weekly bread order', 12),
  ('Emily Davis', '555-0103', 'emily.d@email.com', 'Allergic to nuts', 3),
  ('The Smith Family', '555-0104', 'smithfam@email.com', 'Large family gatherings', 8),
  ('Corporate Events Inc', '555-0105', 'orders@corpevents.com', 'Corporate account - net 30', 15),
  ('Maria Garcia', '555-0106', 'maria.g@email.com', 'Birthday cakes specialist', 7),
  ('Local Coffee Shop', '555-0107', 'orders@localcoffee.com', 'Daily pastry order', 50),
  ('James Wilson', '555-0108', NULL, 'Walk-in customer', 2);
