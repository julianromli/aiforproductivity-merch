# Database Migration Scripts

This folder contains SQL migration scripts for setting up the Supabase database.

## 🚀 Quick Setup (Recommended)

**For the easiest setup, use the combined migration file:**

```sql
scripts/all-migrations.sql  ← Contains ALL migrations in one file
```

**How to use:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire `all-migrations.sql` file
3. Click "Run"
4. ✅ Done! All tables, data, and security configured

This runs all 8 migrations at once - perfect for first-time setup!

---

## Migration Files (Run in Order - Advanced)

### Core Schema

**01-create-tables.sql**
- Creates main database schema
- Tables: `products`, `ai_prompts`, `categories`
- Indexes and triggers
- Row Level Security (RLS) policies

**02-seed-categories.sql**
- Adds default product categories
- Categories: Caps, Hoodies, T-Shirts, Tote Bags

**03-migrate-products.sql**
- Seeds initial products
- Product images and descriptions
- Price configurations

**04-seed-default-prompts.sql**
- Adds AI generation prompts
- Category-specific prompt templates
- Default prompts for image generation

### Extensions

**05-add-buy-link-column.sql**
- Adds `buy_link` column to products table
- External purchase links (Tokopedia, Shopee, etc.)

**06-add-product-colors-table.sql**
- Creates `product_colors` table
- Manages color variants per product
- Supports multiple colors with hex codes

**07-migrate-existing-products-colors.sql**
- Migrates existing product colors
- Populates `product_colors` table from legacy data

### Admin Features

**08-create-site-settings-table.sql** ✨ NEW
- Creates `site_settings` table for admin customize panel
- JSONB storage for flexible settings
- RLS policies (public read, authenticated write)
- Default values for logo, site name, fonts
- Auto-updating timestamps
- Settings keys:
  - `logo` - Logo URL and alt text
  - `site_name` - Website name/title
  - `fonts` - Sans, serif, mono font selections
  - `theme_light` - Light mode color scheme
  - `theme_dark` - Dark mode color scheme

## Running Migrations

### Automated (Recommended)

```bash
npm run setup:db
```

This runs all migrations in order using `run-migrations.mjs`

### Manual via Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor**
4. Open each migration file (in order)
5. Copy contents
6. Paste in SQL Editor
7. Click **Run**

### Manual via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Run migrations
supabase db push
```

## Verification

After running migrations, verify in Supabase Dashboard:

1. **Table Editor** → Check tables exist:
   - `products` (with products)
   - `categories` (4 categories)
   - `ai_prompts` (default prompts)
   - `product_colors` (color variants)
   - `site_settings` (NEW - default settings)

2. **Authentication** → Policies → Check RLS enabled

3. **SQL Editor** → Run test queries:
   ```sql
   -- Check products
   SELECT COUNT(*) FROM products;
   
   -- Check categories
   SELECT * FROM categories;
   
   -- Check site settings (NEW)
   SELECT * FROM site_settings;
   ```

## Migration Script (run-migrations.mjs)

Located in the same folder, this Node.js script:
- Reads all migration files
- Executes them in order
- Handles errors gracefully
- Reports success/warnings
- Uses Supabase service role key

**Usage:**
```bash
node scripts/run-migrations.mjs
```

Or via npm script:
```bash
npm run setup:db
```

## Rollback

⚠️ **Warning**: No automatic rollback. 

To rollback manually:
1. Go to Supabase Dashboard → SQL Editor
2. Drop tables in reverse order:
   ```sql
   DROP TABLE IF EXISTS site_settings CASCADE;
   DROP TABLE IF EXISTS product_colors CASCADE;
   DROP TABLE IF EXISTS ai_prompts CASCADE;
   DROP TABLE IF EXISTS products CASCADE;
   DROP TABLE IF EXISTS categories CASCADE;
   ```
3. Re-run migrations from scratch

## Troubleshooting

### Error: "table already exists"
- Expected on re-runs
- Migrations use `CREATE TABLE IF NOT EXISTS`
- Safe to ignore

### Error: "permission denied"
- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Ensure key has admin privileges
- Verify project is not paused

### Error: "syntax error"
- Check SQL syntax in migration file
- Ensure entire file is copied (no truncation)
- Try running smaller sections

### Migration script fails
- Run migrations manually via Supabase Dashboard
- Check Supabase logs for detailed errors
- Verify environment variables are set

## Best Practices

1. **Never edit existing migrations** - Create new ones instead
2. **Test locally first** - Use local Supabase instance
3. **Backup before production** - Export data before running
4. **Version control** - Commit migrations to git
5. **Document changes** - Add comments in SQL files

## Dependencies

- Node.js 18+
- `@supabase/supabase-js` package
- Valid Supabase project
- Environment variables configured

## Related Documentation

- [Supabase SQL Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Project documentation:
  - `SETUP.md` - Complete setup guide
  - `docs/SITE_SETTINGS_TABLE.md` - Site settings reference
  - `AGENTS.md` - Development guide

---

**Last Updated**: 2025-01-31  
**Maintained By**: Development Team
