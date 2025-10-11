#!/usr/bin/env node

/**
 * Environment Variable Validator CLI
 * 
 * Checks if all required environment variables are configured correctly.
 * Can be run standalone or as part of pre-deployment checks.
 */

import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

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

// Environment variables configuration
const ENV_VARS = [
  {
    name: 'GEMINI_API_KEY',
    required: true,
    description: 'Google AI API key for virtual try-on',
    setupUrl: 'https://aistudio.google.com/app/apikey',
    validate: (val) => val && val.length > 10 && !val.includes('your_'),
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    setupUrl: 'https://supabase.com/dashboard',
    validate: (val) => val && val.startsWith('https://') && val.includes('.supabase.co'),
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous/public key',
    setupUrl: 'https://supabase.com/dashboard',
    validate: (val) => val && val.startsWith('eyJ') && val.length > 100,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (admin)',
    setupUrl: 'https://supabase.com/dashboard',
    validate: (val) => val && val.startsWith('eyJ') && val.length > 100,
  },
  {
    name: 'BLOB_READ_WRITE_TOKEN',
    required: false,
    description: 'Vercel Blob storage token',
    setupUrl: 'https://vercel.com/dashboard/stores',
    validate: (val) => !val || val.startsWith('vercel_blob_'),
  },
]

function main() {
  log('\n━'.repeat(60), 'cyan')
  log('🔧 ENVIRONMENT VALIDATION', 'bright')
  log('━'.repeat(60) + '\n', 'cyan')

  // Check if .env.local exists
  if (!existsSync(envPath)) {
    log('❌ ERROR: .env.local file not found', 'red')
    log('\n📝 To create .env.local:', 'yellow')
    log('  1. Copy .env.example to .env.local', 'cyan')
    log('  2. Fill in your credentials', 'cyan')
    log('  3. Or run: npm run setup\n', 'cyan')
    process.exit(1)
  }

  log('📄 Found .env.local\n', 'green')

  let hasErrors = false
  let hasWarnings = false
  const results = []

  // Validate each variable
  ENV_VARS.forEach((config) => {
    const value = process.env[config.name]
    const isConfigured = value && config.validate(value)
    
    const status = {
      name: config.name,
      configured: isConfigured,
      required: config.required,
      description: config.description,
      setupUrl: config.setupUrl,
    }

    if (config.required && !isConfigured) {
      hasErrors = true
      status.level = 'error'
    } else if (!config.required && !isConfigured) {
      hasWarnings = true
      status.level = 'warning'
    } else {
      status.level = 'success'
    }

    results.push(status)
  })

  // Print results
  results.forEach((result) => {
    const icon = result.level === 'success' ? '✅' : result.level === 'error' ? '❌' : '⚠️'
    const statusText = result.level === 'success' ? 'OK' : result.level === 'error' ? 'MISSING' : 'OPTIONAL'
    const color = result.level === 'success' ? 'green' : result.level === 'error' ? 'red' : 'yellow'

    log(`${icon} ${result.name} - ${statusText}`, color)
    
    if (result.level !== 'success') {
      log(`   ${result.description}`, 'cyan')
      log(`   Get it: ${result.setupUrl}\n`, 'cyan')
    }
  })

  // Summary
  log('\n' + '━'.repeat(60), 'cyan')
  
  if (hasErrors) {
    log('❌ VALIDATION FAILED', 'red')
    log('Missing required environment variables.\n', 'red')
    log('📝 Fix by:', 'yellow')
    log('  1. Edit .env.local and add missing variables', 'cyan')
    log('  2. Or run: npm run setup', 'cyan')
    log('  3. See: SETUP.md for detailed guide\n', 'cyan')
    process.exit(1)
  } else if (hasWarnings) {
    log('⚠️  VALIDATION PASSED (with warnings)', 'yellow')
    log('Optional variables are not configured.\n', 'yellow')
    log('Your app will work, but some features may be limited.', 'yellow')
    log('(e.g., image uploads require BLOB_READ_WRITE_TOKEN)\n', 'yellow')
  } else {
    log('✅ ALL ENVIRONMENT VARIABLES CONFIGURED', 'green')
    log('Your app is ready to run!\n', 'green')
    log('Next steps:', 'bright')
    log('  • npm run dev - Start development server', 'cyan')
    log('  • npm run build - Build for production\n', 'cyan')
  }

  log('━'.repeat(60) + '\n', 'cyan')
}

main()
