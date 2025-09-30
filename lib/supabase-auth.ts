import { createBrowserClient } from "@supabase/ssr"
import { createServerClient as createSSRServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log("[v0] Supabase Auth Config:", {
  url: supabaseUrl?.substring(0, 30) + "...",
  anonKeyPrefix: supabaseAnonKey?.substring(0, 20) + "...",
  anonKeyLength: supabaseAnonKey?.length,
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
})

// Browser client for client-side auth operations
export function createClient() {
  console.log("[v0] Creating browser client with:", {
    url: supabaseUrl?.substring(0, 30) + "...",
    keyPrefix: supabaseAnonKey?.substring(0, 20) + "...",
  })
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server client for server-side auth operations (middleware, server components)
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Helper to check if user is authenticated admin
export async function getAuthenticatedUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}
