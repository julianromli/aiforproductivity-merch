-- Migrate existing hardcoded products to database
-- This script will insert the products from your current app/page.tsx

INSERT INTO products (name, price, currency, category, description, image_url, is_active, sort_order) VALUES
  ('Nike ZoomX Vomero Plus', 180000, 'IDR', 'APPAREL', 'Premium running shoes with ZoomX foam technology', '/products/nike-vomero.jpeg', true, 1),
  ('Nike Club Cap', 250000, 'IDR', 'APPAREL', 'Classic baseball cap with Nike logo', '/products/nike-cap.jpeg', true, 2),
  ('Nike Tech Woven Pants', 120000, 'IDR', 'APPAREL', 'Camo tracksuit with modern tech fabric', '/products/nike-tech-set.jpeg', true, 3),
  ('Jordan Fleece Hoodie', 850000, 'IDR', 'APPAREL', 'Premium hoodie with signature graphics', '/products/jordan-hoodie.jpeg', true, 4),
  ('Nike ZoomX Vomero Plus', 180000, 'IDR', 'APPAREL', 'Premium running shoes with ZoomX foam technology', '/products/nike-vomero.jpeg', true, 5),
  ('Nike Club Cap', 250000, 'IDR', 'APPAREL', 'Classic baseball cap with Nike logo', '/products/nike-cap.jpeg', true, 6)
ON CONFLICT DO NOTHING;
