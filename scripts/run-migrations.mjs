#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Automatically runs all SQL migration files in the /scripts directory
 * against your Supabase database using the Management API.
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')

// Load .env.local
const envPath = join(ROOT_DIR, '.env.local')
if (existsSync(envPath)) {
  config({ path: envPath })
}

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// SQL files to run (in order)
const MIGRATION_FILES = [
  '01-create-tables.sql',
  '02-seed-categories.sql',
  '03-migrate-products.sql',
  '04-seed-default-prompts.sql',
  '05-add-buy-link-column.sql',
  '06-add-product-colors-table.sql',
  '07-migrate-existing-products-colors.sql',
  '08-create-site-settings-table.sql',
]

async function runMigration(supabase, filename, sql) {
  log(`  📄 Running ${filename}...`, 'cyan')

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  let successCount = 0
  let errorCount = 0

  for (const statement of statements) {
    if (!statement) continue

    try {
      // Try to execute the statement
      const { error } = await supabase.rpc('exec_sql', { query: statement })

      if (error) {
        // Some errors are expected (e.g., "already exists")
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          error.code === '42P07' || // duplicate_table
          error.code === '42710' || // duplicate_object
          error.code === '23505'    // unique_violation
        ) {
          // Ignore these errors
          successCount++
        } else {
          log(`    ⚠️  Warning: ${error.message}`, 'yellow')
          errorCount++
        }
      } else {
        successCount++
      }
    } catch (err) {
      log(`    ⚠️  Error: ${err.message}`, 'yellow')
      errorCount++
    }
  }

  if (errorCount === 0) {
    log(`  ✅ ${filename} completed successfully`, 'green')
  } else {
    log(`  ⚠️  ${filename} completed with ${errorCount} warnings`, 'yellow')
  }

  return { successCount, errorCount }
}

async function main() {
  log('\n━'.repeat(60), 'cyan')
  log('🔧 DATABASE MIGRATION RUNNER', 'bright')
  log('━'.repeat(60) + '\n', 'cyan')

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    log('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL not found', 'red')
    log('Run: npm run setup\n', 'yellow')
    process.exit(1)
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not found', 'red')
    log('Run: npm run setup\n', 'yellow')
    process.exit(1)
  }

  // Create Supabase client
  log('🔗 Connecting to Supabase...', 'cyan')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Test connection
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true })
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected)
      throw new Error(error.message)
    }
    log('✅ Connected to Supabase\n', 'green')
  } catch (error) {
    log(`❌ Failed to connect: ${error.message}`, 'red')
    log('Check your SUPABASE_SERVICE_ROLE_KEY\n', 'yellow')
    process.exit(1)
  }

  // Run migrations
  log('📦 Running migrations...\n', 'bright')

  let totalSuccess = 0
  let totalErrors = 0

  for (const filename of MIGRATION_FILES) {
    const filePath = join(ROOT_DIR, 'scripts', filename)

    if (!existsSync(filePath)) {
      log(`  ⚠️  Skipping ${filename} (not found)`, 'yellow')
      continue
    }

    const sql = readFileSync(filePath, 'utf-8')
    const result = await runMigration(supabase, filename, sql)
    
    totalSuccess += result.successCount
    totalErrors += result.errorCount

    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Summary
  log('\n' + '━'.repeat(60), 'cyan')
  
  if (totalErrors === 0) {
    log('✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY', 'green')
    log(`Executed ${totalSuccess} statements\n`, 'green')
  } else {
    log('⚠️  MIGRATIONS COMPLETED WITH WARNINGS', 'yellow')
    log(`Executed ${totalSuccess} statements, ${totalErrors} warnings\n`, 'yellow')
    log('Note: Some warnings are expected (e.g., "already exists")', 'cyan')
    log('Check the output above for details\n', 'cyan')
  }

  log('📋 Next Steps:', 'bright')
  log('  1. Verify tables in Supabase Dashboard → Table Editor', 'cyan')
  log('  2. Check that products, categories, and prompts exist', 'cyan')
  log('  3. Start your app: npm run dev\n', 'cyan')

  log('━'.repeat(60) + '\n', 'cyan')
}

main().catch((error) => {
  log(`\n❌ Migration failed: ${error.message}`, 'red')
  log('See SETUP.md for manual migration instructions\n', 'yellow')
  process.exit(1)
})
