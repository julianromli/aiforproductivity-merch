-- Site Settings Table Migration
-- Stores customizable site settings (logo, fonts, theme colors)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
