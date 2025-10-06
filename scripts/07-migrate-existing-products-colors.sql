-- Migration 07: Migrate existing products to have default Black color variant
-- Run this AFTER 06-add-product-colors-table.sql
-- This ensures all existing products have at least one color variant

-- Insert default Black color for all existing products without colors
INSERT INTO product_colors (product_id, color_name, color_hex, image_url, is_default, sort_order)
SELECT
  id AS product_id,
  'Black' AS color_name,
  '#000000' AS color_hex,
  image_url,
  true AS is_default,
  0 AS sort_order
FROM products
WHERE id NOT IN (SELECT DISTINCT product_id FROM product_colors);

-- Success message with count
DO $$ 
DECLARE
  migrated_count INT;
BEGIN 
  SELECT COUNT(*) INTO migrated_count FROM product_colors;
  RAISE NOTICE 'Migration 07 completed: % products now have color variants', migrated_count;
END $$;
