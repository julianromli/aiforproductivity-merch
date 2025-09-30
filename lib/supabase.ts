// Supabase client configuration
import { createClient } from "@supabase/supabase-js"

// Environment variables yang perlu ditambahkan di Vercel:
// NEXT_PUBLIC_SUPABASE_URL=https://lowluqbfhkmhwphlwuqm.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_secret_RrWFiW6fC4rz0IH7G0Hecg_Rkwf9ODa
// SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvd2x1cWJmaGttaHdwaGx3dXFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIwNjcxNywiZXhwIjoyMDc0NzgyNzE3fQ.9KluZh6dQRjPrzN9InH5OJmWxnVti1oA0P3957tbif0

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
