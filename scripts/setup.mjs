#!/usr/bin/env node

/**
 * Interactive Setup Wizard for AI For Productivity Merch
 * 
 * This script guides users through:
 * 1. Collecting API keys and credentials
 * 2. Validating connections
 * 3. Creating .env.local
 * 4. Running database migrations
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createInterface } from 'readline'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function header(message) {
  console.log('\n' + '━'.repeat(60))
  log(message, 'cyan')
  console.log('━'.repeat(60) + '\n')
}

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${prompt}${colors.reset} `, resolve)
  })
}

async function main() {
  log('\n🚀 AI For Productivity Merch - Setup Wizard', 'bright')
  log('━'.repeat(60), 'cyan')
  log('This wizard will help you configure your store in 5 minutes!\n', 'cyan')

  const config = {}

  // Check if .env.local already exists
  const envPath = join(ROOT_DIR, '.env.local')
  if (existsSync(envPath)) {
    log('⚠️  Warning: .env.local already exists', 'yellow')
    const overwrite = await question('Do you want to overwrite it? (y/n): ')
    if (overwrite.toLowerCase() !== 'y') {
      log('\n❌ Setup cancelled. Existing .env.local preserved.', 'red')
      rl.close()
      process.exit(0)
    }
  }

  // Step 1: Google AI (Gemini)
  header('📝 Step 1/4: Google AI Configuration')
  log('Get your API key: https://aistudio.google.com/app/apikey', 'blue')
  log('(Used for AI-powered virtual try-on feature)\n', 'blue')

  config.GEMINI_API_KEY = await question('Enter your Gemini API key: ')
  
  if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY.length < 10) {
    log('❌ Invalid API key. Please run the setup again.', 'red')
    rl.close()
    process.exit(1)
  }
  
  log('✅ Gemini API key saved', 'green')

  // Step 2: Supabase
  header('📝 Step 2/4: Supabase Configuration')
  log('Get credentials from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api', 'blue')
  log('(Database and authentication)\n', 'blue')

  config.NEXT_PUBLIC_SUPABASE_URL = await question('Enter your Supabase Project URL: ')
  config.NEXT_PUBLIC_SUPABASE_ANON_KEY = await question('Enter your Supabase Anon Key: ')
  config.SUPABASE_SERVICE_ROLE_KEY = await question('Enter your Supabase Service Role Key: ')

  // Validate Supabase connection
  log('\n🔍 Testing Supabase connection...', 'yellow')
  try {
    const supabase = createClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true })
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected before migration)
      throw new Error(error.message)
    }
    
    log('✅ Connected to Supabase successfully', 'green')
  } catch (error) {
    log(`❌ Failed to connect to Supabase: ${error.message}`, 'red')
    log('Please check your credentials and try again.', 'red')
    rl.close()
    process.exit(1)
  }

  // Step 3: Database Setup
  header('📝 Step 3/4: Database Setup')
  log('Do you want to run database migrations now?', 'blue')
  log('(Required for first-time setup. Creates tables and seed data)\n', 'blue')

  const runMigrations = await question('Run migrations? (y/n): ')
  
  if (runMigrations.toLowerCase() === 'y') {
    log('\n🔧 Running database migrations...', 'yellow')
    
    try {
      const supabase = createClient(
        config.NEXT_PUBLIC_SUPABASE_URL,
        config.SUPABASE_SERVICE_ROLE_KEY
      )

      // Get all SQL files
      const sqlFiles = [
        '01-create-tables.sql',
        '02-seed-categories.sql',
        '03-migrate-products.sql',
        '04-seed-default-prompts.sql',
        '05-add-buy-link-column.sql',
        '06-add-product-colors-table.sql',
        '07-migrate-existing-products-colors.sql',
      ]

      for (const file of sqlFiles) {
        const filePath = join(ROOT_DIR, 'scripts', file)
        if (!existsSync(filePath)) {
          log(`⚠️  Skipping ${file} (not found)`, 'yellow')
          continue
        }

        const sql = readFileSync(filePath, 'utf-8')
        log(`  Running ${file}...`, 'cyan')
        
        const { error } = await supabase.rpc('exec_sql', { sql })
        
        // Fallback: Try direct query if RPC doesn't exist
        if (error && error.code === '42883') { // Function doesn't exist
          // Split by semicolon and execute each statement
          const statements = sql.split(';').filter(s => s.trim())
          for (const statement of statements) {
            const { error: execError } = await supabase.rpc('query', { query: statement })
            if (execError) {
              log(`  ⚠️  Warning: ${execError.message}`, 'yellow')
            }
          }
        } else if (error) {
          log(`  ⚠️  Warning: ${error.message}`, 'yellow')
        }
        
        log(`  ✅ ${file} completed`, 'green')
      }

      log('\n✅ All migrations completed', 'green')
      log('\n📝 Note: If you see warnings, you may need to run migrations manually.', 'yellow')
      log('   See: SETUP.md for manual migration instructions\n', 'yellow')
      
    } catch (error) {
      log(`\n❌ Migration failed: ${error.message}`, 'red')
      log('\n📝 You can run migrations manually later:', 'yellow')
      log('   1. Go to Supabase Dashboard → SQL Editor', 'yellow')
      log('   2. Copy and run each SQL file from /scripts folder', 'yellow')
      log('   3. See SETUP.md for detailed instructions\n', 'yellow')
    }
  } else {
    log('\n⚠️  Skipped migrations', 'yellow')
    log('Remember to run them manually before starting the app!', 'yellow')
    log('See: SETUP.md#step-3-setup-database\n', 'yellow')
  }

  // Step 4: Vercel Blob (Optional)
  header('📝 Step 4/4: Vercel Blob Storage (Optional)')
  log('Required for production. Optional for local development.', 'blue')
  log('Get token from: https://vercel.com/dashboard/stores\n', 'blue')

  const addBlob = await question('Add Vercel Blob token now? (y/n): ')
  
  if (addBlob.toLowerCase() === 'y') {
    config.BLOB_READ_WRITE_TOKEN = await question('Enter your Vercel Blob token: ')
    log('✅ Vercel Blob token saved', 'green')
  } else {
    log('⚠️  Skipped - Add BLOB_READ_WRITE_TOKEN to .env.local before deploying', 'yellow')
  }

  // Create .env.local
  log('\n💾 Creating .env.local file...', 'yellow')
  
  const envContent = `# Auto-generated by setup wizard
# Last updated: ${new Date().toISOString()}

# Google AI
GEMINI_API_KEY=${config.GEMINI_API_KEY}

# Supabase
NEXT_PUBLIC_SUPABASE_URL=${config.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}

# Vercel Blob (Optional for local dev)
${config.BLOB_READ_WRITE_TOKEN ? `BLOB_READ_WRITE_TOKEN=${config.BLOB_READ_WRITE_TOKEN}` : '# BLOB_READ_WRITE_TOKEN=your_token_here'}
`

  writeFileSync(envPath, envContent, 'utf-8')
  log('✅ .env.local created successfully', 'green')

  // Final summary
  header('✅ Setup Complete!')
  log('Your store is now configured and ready to use!\n', 'green')
  
  log('📋 Next Steps:', 'bright')
  log('  1. Start development server:', 'cyan')
  log('     npm run dev\n', 'bright')
  log('  2. Open browser:', 'cyan')
  log('     http://localhost:3000\n', 'bright')
  log('  3. Access admin dashboard:', 'cyan')
  log('     http://localhost:3000/admin/login\n', 'bright')
  
  if (!config.BLOB_READ_WRITE_TOKEN) {
    log('⚠️  Remember to add BLOB_READ_WRITE_TOKEN before deploying!', 'yellow')
  }
  
  log('\n📚 Documentation:', 'bright')
  log('  • SETUP.md - Complete setup guide', 'cyan')
  log('  • AGENTS.md - AI agent guidelines', 'cyan')
  log('  • docs/ADMIN_USER_GUIDE.md - Admin panel guide\n', 'cyan')
  
  log('🎉 Happy selling!', 'green')
  
  rl.close()
}

// Run the wizard
main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'red')
  log('Please check the error above and try again.\n', 'red')
  rl.close()
  process.exit(1)
})
