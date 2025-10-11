/**
 * Environment Variable Validator
 * 
 * Validates all required environment variables at app startup.
 * Provides clear error messages with setup instructions if variables are missing.
 */

interface EnvConfig {
  name: string
  required: boolean
  description: string
  setupUrl: string
}

const ENV_VARIABLES: EnvConfig[] = [
  {
    name: 'GEMINI_API_KEY',
    required: true,
    description: 'Google AI API key for virtual try-on feature',
    setupUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    setupUrl: 'https://supabase.com/dashboard',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous/public key',
    setupUrl: 'https://supabase.com/dashboard',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (for admin operations)',
    setupUrl: 'https://supabase.com/dashboard',
  },
  {
    name: 'BLOB_READ_WRITE_TOKEN',
    required: false, // Optional for local dev, required for production
    description: 'Vercel Blob storage token (for image uploads)',
    setupUrl: 'https://vercel.com/dashboard/stores',
  },
]

export class EnvironmentValidationError extends Error {
  constructor(
    public missingVariables: EnvConfig[],
    public optionalMissing: EnvConfig[]
  ) {
    super('Environment validation failed')
    this.name = 'EnvironmentValidationError'
  }

  getFormattedMessage(): string {
    let message = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    message += '❌ ENVIRONMENT CONFIGURATION ERROR\n'
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'

    if (this.missingVariables.length > 0) {
      message += '🚨 Missing required environment variables:\n\n'
      this.missingVariables.forEach((config) => {
        message += `  • ${config.name}\n`
        message += `    ${config.description}\n`
        message += `    Get it: ${config.setupUrl}\n\n`
      })
    }

    if (this.optionalMissing.length > 0) {
      message += '⚠️  Missing optional environment variables:\n\n'
      this.optionalMissing.forEach((config) => {
        message += `  • ${config.name}\n`
        message += `    ${config.description}\n`
        message += `    Get it: ${config.setupUrl}\n\n`
      })
    }

    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    message += '📝 Setup Instructions:\n\n'
    message += '  1. Copy .env.example to .env.local:\n'
    message += '     cp .env.example .env.local\n\n'
    message += '  2. Fill in your credentials in .env.local\n\n'
    message += '  3. Or run the setup wizard:\n'
    message += '     npm run setup\n\n'
    message += '  4. See SETUP.md for detailed guide\n'
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    return message
  }
}

/**
 * Validates that all required environment variables are present
 * @param throwOnMissing - If true, throws error when required vars are missing
 * @param warnOnOptional - If true, logs warning for missing optional vars
 */
export function validateEnvironment(
  throwOnMissing = true,
  warnOnOptional = true
): { valid: boolean; missing: EnvConfig[]; optional: EnvConfig[] } {
  const missingRequired: EnvConfig[] = []
  const missingOptional: EnvConfig[] = []

  ENV_VARIABLES.forEach((config) => {
    const value = process.env[config.name]

    if (!value || value.includes('your_') || value.includes('_here')) {
      if (config.required) {
        missingRequired.push(config)
      } else {
        missingOptional.push(config)
      }
    }
  })

  if (missingRequired.length > 0) {
    const error = new EnvironmentValidationError(
      missingRequired,
      missingOptional
    )

    if (throwOnMissing) {
      console.error(error.getFormattedMessage())
      throw error
    }
  }

  if (warnOnOptional && missingOptional.length > 0) {
    console.warn('\n⚠️  Warning: Optional environment variables not configured:')
    missingOptional.forEach((config) => {
      console.warn(`  • ${config.name}: ${config.description}`)
    })
    console.warn('')
  }

  return {
    valid: missingRequired.length === 0,
    missing: missingRequired,
    optional: missingOptional,
  }
}

/**
 * Validates environment on server side only
 * Safe to call in server components and API routes
 */
export function validateServerEnvironment(): void {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    return
  }

  // Skip validation in build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return
  }

  validateEnvironment(true, true)
}

/**
 * Gets a formatted status report of all environment variables
 */
export function getEnvironmentStatus(): string {
  let status = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
  status += '🔧 ENVIRONMENT CONFIGURATION STATUS\n'
  status += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'

  ENV_VARIABLES.forEach((config) => {
    const value = process.env[config.name]
    const isConfigured = value && !value.includes('your_') && !value.includes('_here')
    const icon = isConfigured ? '✅' : config.required ? '❌' : '⚠️'
    const status_text = isConfigured ? 'Configured' : 'Missing'

    status += `${icon} ${config.name} - ${status_text}\n`
    if (!isConfigured) {
      status += `   ${config.description}\n`
    }
  })

  status += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

  return status
}
