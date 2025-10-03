-- Migration: Add buy_link column to products table
-- This column will store external URLs (e.g., Tokopedia links) for each product
-- Run this in Supabase SQL Editor

ALTER TABLE products
ADD COLUMN buy_link VARCHAR(500) NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.buy_link IS 'External purchase link (e.g., Tokopedia, Shopee, etc.)';

-- Create index for faster queries (optional, but recommended if filtering by buy_link)
CREATE INDEX IF NOT EXISTS idx_products_buy_link ON products(buy_link) WHERE buy_link IS NOT NULL;
