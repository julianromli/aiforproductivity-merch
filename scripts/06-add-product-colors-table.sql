-- Migration 06: Add product_colors table for multi-color product variants
-- Run this script in Supabase SQL Editor or via MCP

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create product_colors table
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_colors_is_default ON product_colors(is_default);
CREATE INDEX IF NOT EXISTS idx_product_colors_sort_order ON product_colors(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access to product colors" ON product_colors;
CREATE POLICY "Allow public read access to product colors"
  ON product_colors FOR SELECT
  USING (true);

-- Create policies for service role (admin) full access
DROP POLICY IF EXISTS "Allow service role full access to product colors" ON product_colors;
CREATE POLICY "Allow service role full access to product colors"
  ON product_colors FOR ALL
  USING (auth.role() = 'service_role');

-- Add trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_product_colors_updated_at ON product_colors;
CREATE TRIGGER update_product_colors_updated_at
  BEFORE UPDATE ON product_colors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional (recommended): Ensure only one default per product
-- Uncomment if you want to enforce single default constraint
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_product_colors_default
--   ON product_colors(product_id)
--   WHERE is_default = true;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Migration 06 completed: product_colors table created successfully';
END $$;
