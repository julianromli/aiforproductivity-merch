// Supabase client configuration
import { createClient } from "@supabase/supabase-js"

// See .env.example for required environment variables
// Get your credentials from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client untuk public access (read-only untuk active products)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client dengan service role untuk full access (hanya untuk API routes)
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export function createServerClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Type definitions untuk database
export interface Product {
  id: string
  name: string
  price: number
  currency: string
  category: string
  description: string | null
  image_url: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AIPrompt {
  id: string
  product_id: string
  prompt_template: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  prompt_instructions: string | null
  created_at: string
}
