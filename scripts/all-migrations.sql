-- ============================================================================
-- AI FOR PRODUCTIVITY MERCH - COMPLETE DATABASE SETUP
-- ============================================================================
-- 
-- This file combines ALL migrations for easy setup.
-- 
-- FOR NO-CODE ADMINS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this ENTIRE file
-- 3. Click "Run" button
-- 4. Wait for success message
-- 
-- That's it! Your database is ready.
-- ============================================================================

-- ============================================================================
-- MIGRATION 01: CREATE TABLES
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Prompts Table
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  prompt_template TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table (for future expansion)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  prompt_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_product_id ON ai_prompts(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_is_default ON ai_prompts(is_default);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_prompts_updated_at ON ai_prompts;
CREATE TRIGGER update_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to active products" ON products;
DROP POLICY IF EXISTS "Allow public read access to prompts" ON ai_prompts;
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow service role full access to products" ON products;
DROP POLICY IF EXISTS "Allow service role full access to prompts" ON ai_prompts;
DROP POLICY IF EXISTS "Allow service role full access to categories" ON categories;

-- Create policies for public read access
CREATE POLICY "Allow public read access to active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow public read access to prompts"
  ON ai_prompts FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Create policies for service role (admin) full access
CREATE POLICY "Allow service role full access to products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to prompts"
  ON ai_prompts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- MIGRATION 02: SEED CATEGORIES
-- ============================================================================

INSERT INTO categories (name, slug, prompt_instructions) VALUES
  ('APPAREL', 'apparel', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'),
  ('ACCESSORIES', 'accessories', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'),
  ('STATIONERY', 'stationery', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'),
  ('OTHER', 'other', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- MIGRATION 03: SEED SAMPLE PRODUCTS
-- ============================================================================

INSERT INTO products (name, price, currency, category, description, image_url, is_active, sort_order) VALUES
  ('Nike ZoomX Vomero Plus', 180000, 'IDR', 'APPAREL', 'Premium running shoes with ZoomX foam technology', '/products/nike-vomero.jpeg', true, 1),
  ('Nike Club Cap', 250000, 'IDR', 'APPAREL', 'Classic baseball cap with Nike logo', '/products/nike-cap.jpeg', true, 2),
  ('Nike Tech Woven Pants', 120000, 'IDR', 'APPAREL', 'Camo tracksuit with modern tech fabric', '/products/nike-tech-set.jpeg', true, 3),
  ('Jordan Fleece Hoodie', 850000, 'IDR', 'APPAREL', 'Premium hoodie with signature graphics', '/products/jordan-hoodie.jpeg', true, 4),
  ('Nike ZoomX Vomero Plus', 180000, 'IDR', 'APPAREL', 'Premium running shoes with ZoomX foam technology', '/products/nike-vomero.jpeg', true, 5),
  ('Nike Club Cap', 250000, 'IDR', 'APPAREL', 'Classic baseball cap with Nike logo', '/products/nike-cap.jpeg', true, 6)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION 04: SEED DEFAULT AI PROMPTS
-- ============================================================================

DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN 
    SELECT id, name, category FROM products
  LOOP
    INSERT INTO ai_prompts (product_id, prompt_template, is_default)
    VALUES (
      product_record.id,
      CASE product_record.category
        WHEN 'RUNNING SHOES' THEN 
          'Create a lifestyle product photo showing a person wearing ' || product_record.name || '. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        WHEN 'ACCESSORIES' THEN
          'Create a lifestyle product photo showing a person wearing ' || product_record.name || '. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        WHEN 'MEN''S PANTS' THEN
          'Create a lifestyle product photo showing a person wearing ' || product_record.name || '. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        WHEN 'MEN''S HOODIE' THEN
          'Create a lifestyle product photo showing a person wearing ' || product_record.name || '. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        ELSE
          'Create a lifestyle product photo showing a person wearing ' || product_record.name || '. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
      END,
      true
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================================================
-- MIGRATION 05: ADD BUY LINK COLUMN
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'buy_link'
  ) THEN
    ALTER TABLE products ADD COLUMN buy_link VARCHAR(500) NULL;
    COMMENT ON COLUMN products.buy_link IS 'External purchase link (e.g., Tokopedia, Shopee, etc.)';
    CREATE INDEX IF NOT EXISTS idx_products_buy_link ON products(buy_link) WHERE buy_link IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION 06: ADD PRODUCT COLORS TABLE
-- ============================================================================

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

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to product colors" ON product_colors;
DROP POLICY IF EXISTS "Allow service role full access to product colors" ON product_colors;

-- Create policies for public read access
CREATE POLICY "Allow public read access to product colors"
  ON product_colors FOR SELECT
  USING (true);

-- Create policies for service role (admin) full access
CREATE POLICY "Allow service role full access to product colors"
  ON product_colors FOR ALL
  USING (auth.role() = 'service_role');

-- Add trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_product_colors_updated_at ON product_colors;
CREATE TRIGGER update_product_colors_updated_at
  BEFORE UPDATE ON product_colors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 07: MIGRATE EXISTING PRODUCTS TO HAVE DEFAULT COLOR
-- ============================================================================

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

-- ============================================================================
-- MIGRATION 08: CREATE SITE SETTINGS TABLE
-- ============================================================================

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON site_settings(updated_at);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Add comment to table
COMMENT ON TABLE site_settings IS 'Stores customizable site settings for admin customize panel';
COMMENT ON COLUMN site_settings.key IS 'Setting key (e.g., logo, fonts, theme_light, theme_dark)';
COMMENT ON COLUMN site_settings.value IS 'Setting value stored as JSONB for flexibility';
COMMENT ON COLUMN site_settings.updated_by IS 'User ID who last updated this setting';

-- Enable Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to modify site_settings" ON site_settings;

-- RLS Policy: Allow public read access (for frontend)
CREATE POLICY "Allow public read access to site_settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- RLS Policy: Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to modify site_settings"
  ON site_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings (optional - can be customized later via admin panel)
INSERT INTO site_settings (key, value) VALUES
  ('logo', '{"url": "/placeholder.svg", "alt": "Website Logo"}'::jsonb),
  ('site_name', '"AI For Productivity"'::jsonb),
  ('default_theme', '"system"'::jsonb),
  ('fonts', '{"sans": "Manrope", "serif": "Instrument Serif", "mono": "Geist Mono"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- 
-- ✅ All tables created
-- ✅ Sample data seeded
-- ✅ Security policies configured
-- 
-- NEXT STEPS:
-- 1. Start your app: npm run dev
-- 2. Access admin: http://localhost:3000/admin/login
-- 3. Customize your store via admin panel
-- 
-- For help, see: SETUP.md
-- ============================================================================
