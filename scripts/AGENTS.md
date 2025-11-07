# AGENTS.md - Scripts (Database Migrations & Setup)

## 📦 Package Identity
Database migrations (SQL files) and setup automation scripts (Node.js). Handles schema creation, data seeding, and environment validation.

**Tech**: SQL (PostgreSQL via Supabase), Node.js ESM

## ⚡ Setup & Run

```bash
# Interactive setup wizard
npm run setup        # Runs scripts/setup.mjs

# Run database migrations only
npm run setup:db     # Runs scripts/run-migrations.mjs

# Validate environment variables
npm run validate     # Runs scripts/validate-env.mjs

# Manual migration (Supabase MCP tools preferred)
# Use: apply_migration tool with SQL from scripts/
```

## 📐 Patterns & Conventions

### File Organization
```
scripts/
├── setup.mjs                    # Interactive setup wizard
├── run-migrations.mjs           # Migration runner
├── validate-env.mjs             # Environment validator
├── 01-create-tables.sql         # Schema: products, categories, etc.
├── 02-seed-categories.sql       # Data: default categories
├── 03-migrate-products.sql      # Migration: add columns
├── 04-seed-default-prompts.sql  # Data: AI prompts
├── 05-add-buy-link-column.sql   # Migration: buy_link column
├── 06-add-product-colors-table.sql # Schema: color variants
├── 07-migrate-existing-products-colors.sql # Migration: migrate colors
├── 08-create-site-settings-table.sql # Schema: site settings
├── all-migrations.sql           # Combined migrations (generated)
└── README.md                    # Migration guide
```

### Migration Naming Convention

**✅ DO**: Number migrations sequentially
```
XX-description.sql
│  └─ Descriptive, kebab-case name
└─ Sequential number (01, 02, 03...)

Examples:
- 01-create-tables.sql       # Initial schema
- 02-seed-categories.sql     # Data seeding
- 03-migrate-products.sql    # Schema change
```

### Migration Pattern

**✅ DO**: Structure migrations with comments and safety checks
```sql
-- scripts/08-create-site-settings-table.sql
-- Site Settings Table
-- Stores customizable site configuration (logo, fonts, colors)
-- Uses JSONB for flexible schema

-- Drop existing table (if re-running)
DROP TABLE IF EXISTS site_settings CASCADE;

-- Create table
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_updated_at ON site_settings(updated_at);

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**✅ DO**: Use `DROP TABLE IF EXISTS CASCADE` for idempotent migrations
**✅ DO**: Always enable RLS and create policies
**✅ DO**: Add indexes for frequently queried columns
**✅ DO**: Use triggers for auto-updating timestamps

### Setup Script Pattern

**✅ DO**: Use interactive prompts for user input
```js
// scripts/setup.mjs
import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer))
  })
}

// Usage
const supabaseUrl = await prompt("Enter Supabase URL: ")
```

**✅ DO**: Validate environment variables with clear error messages
```js
// scripts/validate-env.mjs
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
]

const missing = required.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables:`)
  missing.forEach((key) => console.error(`  - ${key}`))
  process.exit(1)
}

console.log("✅ All environment variables present")
```

## 🔗 Touch Points / Key Files

- **Setup wizard**: `scripts/setup.mjs` (interactive .env.local creation)
- **Migration runner**: `scripts/run-migrations.mjs` (applies all SQL files)
- **Environment validator**: `scripts/validate-env.mjs` (checks .env.local)
- **Initial schema**: `scripts/01-create-tables.sql` (products, categories, prompts)
- **Site settings**: `scripts/08-create-site-settings-table.sql` (JSONB pattern)
- **Migration guide**: `scripts/README.md` (how to create/run migrations)

## 🔍 JIT Index Hints

```bash
# List all migrations in order
ls scripts/*.sql | sort

# Find migrations by keyword
rg -n "CREATE TABLE" scripts/*.sql
rg -n "ALTER TABLE" scripts/*.sql

# Find RLS policies
rg -n "CREATE POLICY" scripts/*.sql

# Find seeding data
rg -n "INSERT INTO" scripts/*.sql
```

## ⚠️ Common Gotchas

- **Migration order**: Run migrations sequentially (01, 02, 03...)
- **Idempotency**: Always use `IF EXISTS` / `IF NOT EXISTS` for re-runability
- **RLS policies**: Never forget to enable RLS and create policies
- **Service role key**: Required for running migrations (bypasses RLS)
- **JSONB columns**: Use for flexible schemas (e.g., site_settings.value)
- **Triggers**: Remember to create `updated_at` triggers for audit columns

## ✅ Pre-PR Checks

```bash
# Test migration runner
npm run setup:db

# Verify database schema (Supabase MCP)
# Use: list_tables tool

# Check for SQL syntax errors
# Open migration files in DB client
```

---

**Related**: [API Routes](../app/api/AGENTS.md) | [Lib Services](../lib/AGENTS.md) | [Root](../AGENTS.md)
