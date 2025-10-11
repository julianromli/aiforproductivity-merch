# Site Settings Table

## Overview

The `site_settings` table stores customizable website settings that can be managed through the Admin Customize Panel (`/admin/customize`).

## Schema

```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes

- `idx_site_settings_key` - Fast lookup by setting key
- `idx_site_settings_updated_at` - Ordered queries by update time

## Row Level Security (RLS)

- **Public Read**: Anyone can view settings (for frontend rendering)
- **Authenticated Write**: Only authenticated users can create/update settings

## Setting Keys

### `logo`
Stores logo configuration for the website.

**Type**: `{ url: string, alt: string }`

**Example**:
```json
{
  "url": "https://blob.vercel-storage.com/abc123/logo.png",
  "alt": "Website Logo"
}
```

### `site_name`
Stores the website name/title that appears next to the logo in the navbar.

**Type**: `string`

**Example**:
```json
"AI For Productivity"
```

### `fonts`
Stores font family selections for sans, serif, and monospace fonts.

**Type**: `{ sans: string, serif: string, mono: string }`

**Example**:
```json
{
  "sans": "Manrope",
  "serif": "Instrument Serif",
  "mono": "Geist Mono"
}
```

### `theme_light`
Stores CSS custom properties for light mode theme.

**Type**: `Record<string, string>` (CSS variable name → value)

**Example**:
```json
{
  "background": "oklch(1.0000 0 0)",
  "foreground": "oklch(0.2367 0.0587 264.2278)",
  "primary": "oklch(0.4640 0.1131 249.0359)",
  "primary-foreground": "oklch(1.0000 0 0)",
  ...
}
```

### `theme_dark`
Stores CSS custom properties for dark mode theme.

**Type**: `Record<string, string>` (CSS variable name → value)

**Example**:
```json
{
  "background": "oklch(0.0800 0 0)",
  "foreground": "oklch(0.9500 0.0025 228.7857)",
  "primary": "oklch(0.6692 0.1607 245.0110)",
  "primary-foreground": "oklch(1.0000 0 0)",
  ...
}
```

## Usage

### Backend (Server Components)

```typescript
import { getSetting } from '@/lib/settings-service'

// Get logo settings
const logo = await getSetting<{ url: string, alt: string }>('logo')

// Get site name
const siteName = await getSetting<string>('site_name')

// Get theme settings
const lightTheme = await getSetting<Record<string, string>>('theme_light')
const darkTheme = await getSetting<Record<string, string>>('theme_dark')
```

### API Routes

```typescript
import { upsertSetting } from '@/lib/settings-service'

// Save logo
await upsertSetting('logo', { 
  url: 'https://...', 
  alt: 'Logo' 
}, userId)

// Save theme
await upsertSetting('theme_light', {
  background: 'oklch(...)',
  foreground: 'oklch(...)',
  ...
}, userId)
```

## Admin Interface

Settings can be managed through the admin panel at `/admin/customize`:

1. **Logo Tab**: Upload logo or provide external URL
2. **Fonts Tab**: Select from predefined Google Fonts
3. **Color Scheme Tab**: Paste CSS from [TweakCN](https://tweakcn.com/editor/theme)

## Migration

Run the migration to create the table:

```bash
npm run setup:db
```

Or manually via Supabase SQL Editor:
```bash
scripts/08-create-site-settings-table.sql
```

## Default Values

The migration automatically inserts default settings:

```sql
INSERT INTO site_settings (key, value) VALUES
  ('logo', '{"url": "/placeholder.svg", "alt": "Website Logo"}'::jsonb),
  ('site_name', '"AI For Productivity"'::jsonb),
  ('fonts', '{"sans": "Manrope", "serif": "Instrument Serif", "mono": "Geist Mono"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

## Dynamic CSS Injection

Settings are injected into the HTML `<head>` via `app/layout.tsx`:

```tsx
const fonts = await getFontSettings()
const lightTheme = await getThemeSettings('light')
const darkTheme = await getThemeSettings('dark')

const customCSS = generateCustomCSS(fonts, lightTheme, darkTheme)

// Injected as inline <style> tag
<style dangerouslySetInnerHTML={{ __html: customCSS }} />
```

This overrides default values from `app/globals.css` without modifying the file.

## Best Practices

1. **Always use `.maybeSingle()`** when fetching settings to handle non-existent keys gracefully
2. **Validate JSONB structure** before saving to ensure type safety
3. **Use TypeScript types** from `lib/settings-service.ts` for type safety
4. **Handle null cases** in frontend when settings don't exist yet
5. **Test in both light and dark mode** when updating theme settings

## Related Files

- **Migration**: `scripts/08-create-site-settings-table.sql`
- **Service Layer**: `lib/settings-service.ts`
- **Theme Generator**: `lib/theme-generator.ts`
- **Admin UI**: `app/admin/customize/page.tsx`
- **API Routes**: `app/api/admin/settings/route.ts`
- **Root Layout**: `app/layout.tsx` (CSS injection)

## Security Considerations

✅ **Row Level Security Enabled**
- Public can read (required for frontend)
- Only authenticated users can write

✅ **Input Validation**
- Admin UI validates CSS format before saving
- Backend validates required fields

⚠️ **Production Recommendation**
- Add role-based access control (RBAC)
- Limit admin access to specific emails or user roles
- See `middleware.ts` for authentication logic

## Troubleshooting

### Error: "Cannot coerce result to single JSON object"
**Solution**: Use `.maybeSingle()` instead of `.single()` in Supabase queries.

### Settings not applying
**Solution**: Reload the page after saving (settings are injected server-side during SSR).

### Invalid CSS format error
**Solution**: Ensure you're copying the complete `:root {}` and `.dark {}` blocks from TweakCN, including the braces.
