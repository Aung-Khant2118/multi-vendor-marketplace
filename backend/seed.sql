-- ============================================================
-- MARKETPLACE SEED DATA — Run in Supabase SQL Editor
-- ============================================================
-- Passwords are BCrypt-hashed ("password123" for all accounts)
-- ============================================================

-- ===================== USERS =====================
-- Password for all accounts: password123
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (first_name, last_name, email, username, password, role, email_verified)
VALUES
  ('Admin', 'User', 'admin@example.com', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', true),
  ('Jane', 'Vendor', 'jane@vendor.com', 'jane@vendor.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'VENDOR', true),
  ('John', 'Vendor', 'john@vendor.com', 'john@vendor.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'VENDOR', true),
  ('Alice', 'Customer', 'alice@example.com', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', true),
  ('Bob', 'Customer', 'bob@example.com', 'bob@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', true);

-- ===================== CATEGORIES =====================

INSERT INTO categories (name, slug, description, image_url, active)
VALUES
  ('Electronics', 'electronics', 'Mobile phones, laptops, tablets, headphones, computer accessories, and other electronic devices.', 'https://cdn.example/electronics.png', true),
  ('Fashion', 'fashion', 'Clothing, shoes, bags, accessories, and other fashion products.', 'https://cdn.example/fashion.png', true),
  ('Home & Living', 'home-living', 'Furniture, kitchen supplies, lighting, home decor, and other household products.', 'https://cdn.example/home-living.png', true),
  ('Beauty & Personal Care', 'beauty-personal-care', 'Skincare, makeup, hair care, body care, and personal grooming products.', 'https://cdn.example/beauty-personal-care.png', true),
  ('Sports & Fitness', 'sports-fitness', 'Sportswear, fitness equipment, outdoor equipment, and sports accessories.', 'https://cdn.example/sports-fitness.png', true),
  ('Books & Education', 'books-education', 'Books, stationery, school supplies, educational materials, and learning resources.', 'https://cdn.example/books-education.png', true),
  ('Toys & Hobbies', 'toys-hobbies', 'Toys, games, puzzles, collectibles, arts and crafts, and hobby products.', 'https://cdn.example/toys-hobbies.png', true),
  ('Food & Grocery', 'food-grocery', 'Packaged food, snacks, beverages, cooking ingredients, and everyday grocery products.', 'https://cdn.example/food-grocery.png', true);

-- ===================== VENDORS =====================

INSERT INTO vendors (user_id, store_name, slug, description, business_email, business_phone, status, rating, approved_at, approved_by)
VALUES
  (2, 'Jane''s Tech Shop', 'janes-tech-shop', 'Premium electronics and gadgets at great prices', 'jane@vendor.com', '+15551234567', 'ACTIVE', 4.5, NOW(), 1),
  (3, 'John''s Fashion Hub', 'johns-fashion-hub', 'Trendy clothing and accessories', 'john@vendor.com', '+15559876543', 'ACTIVE', 4.2, NOW(), 1);

-- ===================== PRODUCTS =====================

INSERT INTO products (name, slug, description, price, category_id, vendor_id)
VALUES
  -- Electronics (category 1) — Jane (user id 2)
  ('Wireless Mouse', 'wireless-mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 1, 2),
  ('Mechanical Keyboard', 'mechanical-keyboard', 'RGB mechanical keyboard with blue switches', 79.99, 1, 2),
  ('USB-C Hub', 'usb-c-hub', '7-in-1 USB-C hub with HDMI and SD card reader', 45.99, 1, 2),
  ('Webcam HD', 'webcam-hd', '1080p HD webcam with microphone', 59.99, 1, 2),
  ('Bluetooth Speaker', 'bluetooth-speaker', 'Portable Bluetooth speaker with bass boost', 39.99, 1, 2),
  -- Fashion (category 2) — John (user id 3)
  ('Cotton T-Shirt', 'cotton-t-shirt', 'Comfortable cotton t-shirt in various colors', 19.99, 2, 3),
  ('Denim Jacket', 'denim-jacket', 'Classic denim jacket with vintage wash', 69.99, 2, 3),
  ('Running Shoes', 'running-shoes', 'Lightweight running shoes with cushioning', 89.99, 2, 3),
  ('Wool Sweater', 'wool-sweater', 'Warm wool sweater for winter', 54.99, 2, 3),
  -- Home & Living (category 3)
  ('LED Desk Lamp', 'led-desk-lamp', 'Adjustable LED desk lamp with USB charging', 34.99, 3, 2),
  ('Plant Pot Set', 'plant-pot-set', 'Set of 3 ceramic plant pots', 24.99, 3, 3),
  -- Sports & Fitness (category 5)
  ('Yoga Mat', 'yoga-mat', 'Non-slip yoga mat with carrying strap', 29.99, 5, 3),
  ('Water Bottle', 'water-bottle', 'Stainless steel insulated water bottle', 19.99, 5, 2);

-- ===================== PRODUCT VARIANTS =====================

INSERT INTO product_variants (product_id, sku, price, stock, attributes, active)
VALUES
  -- Wireless Mouse
  (1, 'WM-BLK-001', 29.99, 150, '{"color": "Black"}', true),
  (1, 'WM-WHT-001', 29.99, 80, '{"color": "White"}', true),
  (1, 'WM-GRY-001', 32.99, 60, '{"color": "Gray"}', true),
  -- Mechanical Keyboard
  (2, 'MK-RGB-001', 79.99, 50, '{"color": "Black", "switch": "Blue"}', true),
  (2, 'MK-WHT-001', 84.99, 30, '{"color": "White", "switch": "Blue"}', true),
  -- USB-C Hub
  (3, 'CH-7IN1-001', 45.99, 100, '{"ports": "7-in-1"}', true),
  -- Webcam
  (4, 'WC-1080-001', 59.99, 70, '{"resolution": "1080p"}', true),
  -- Bluetooth Speaker
  (5, 'BS-BLK-001', 39.99, 120, '{"color": "Black"}', true),
  (5, 'BS-BLU-001', 39.99, 90, '{"color": "Blue"}', true),
  -- Cotton T-Shirt
  (6, 'CT-BLK-S', 19.99, 200, '{"color": "Black", "size": "S"}', true),
  (6, 'CT-BLK-M', 19.99, 180, '{"color": "Black", "size": "M"}', true),
  (6, 'CT-WHT-S', 19.99, 150, '{"color": "White", "size": "S"}', true),
  (6, 'CT-WHT-M', 19.99, 140, '{"color": "White", "size": "M"}', true),
  (6, 'CT-BLU-L', 19.99, 100, '{"color": "Blue", "size": "L"}', true),
  -- Denim Jacket
  (7, 'DJ-BLU-M', 69.99, 40, '{"color": "Blue", "size": "M"}', true),
  (7, 'DJ-BLU-L', 69.99, 35, '{"color": "Blue", "size": "L"}', true),
  -- Running Shoes
  (8, 'RS-BLK-42', 89.99, 60, '{"color": "Black", "size": "42"}', true),
  (8, 'RS-WHT-42', 89.99, 45, '{"color": "White", "size": "42"}', true),
  -- Wool Sweater
  (9, 'WS-GRY-M', 54.99, 30, '{"color": "Gray", "size": "M"}', true),
  (9, 'WS-GRY-L', 54.99, 25, '{"color": "Gray", "size": "L"}', true),
  -- LED Desk Lamp
  (10, 'LD-BLK-001', 34.99, 80, '{"color": "Black"}', true),
  (10, 'LD-WHT-001', 34.99, 60, '{"color": "White"}', true),
  -- Plant Pot Set
  (11, 'PP-WHT-001', 24.99, 50, '{"color": "White", "set": "3-pack"}', true),
  -- Yoga Mat
  (12, 'YM-BLU-001', 29.99, 100, '{"color": "Blue"}', true),
  (12, 'YM-PRP-001', 29.99, 80, '{"color": "Purple"}', true),
  -- Water Bottle
  (13, 'WB-SLV-001', 19.99, 150, '{"color": "Silver", "capacity": "750ml"}', true),
  (13, 'WB-BLK-001', 19.99, 120, '{"color": "Black", "capacity": "750ml"}', true);

-- ===================== COUPONS =====================

INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, used_count, start_date, end_date, active, vendor_id, created_at, updated_at)
VALUES
  ('WELCOME10', 'PERCENTAGE', 10.00, 50.00, 1000, 0, NOW(), NOW() + INTERVAL '6 months', true, NULL, NOW(), NOW()),
  ('FLAT20', 'FIXED', 20.00, 100.00, 500, 0, NOW(), NOW() + INTERVAL '3 months', true, NULL, NOW(), NOW()),
  ('JANE15', 'PERCENTAGE', 15.00, 30.00, 200, 0, NOW(), NOW() + INTERVAL '1 month', true, 2, NOW(), NOW()),
  ('JOHN25', 'FIXED', 25.00, 75.00, 100, 0, NOW(), NOW() + INTERVAL '1 month', true, 3, NOW(), NOW());

-- ===================== DONE =====================
-- Verify: Run these queries after seeding
-- SELECT COUNT(*) FROM users;        -- expect 5
-- SELECT COUNT(*) FROM categories;   -- expect 8
-- SELECT COUNT(*) FROM vendors;      -- expect 2
-- SELECT COUNT(*) FROM products;     -- expect 13
-- SELECT COUNT(*) FROM product_variants; -- expect 27
-- SELECT COUNT(*) FROM coupons;      -- expect 4
