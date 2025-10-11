import { createServerClient } from "./supabase-server"

export type SiteSetting = {
  id: string
  key: string
  value: unknown
  updated_at: string
  updated_by: string | null
}

export type LogoSettings = {
  url: string
  alt: string
}

export type FontSettings = {
  sans: string
  serif: string
  mono: string
}

export type ThemeSettings = Record<string, string>

// Get all settings
export async function getAllSettings(): Promise<SiteSetting[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key")

  if (error) {
    console.error("Error fetching settings:", error)
    return []
  }

  return data || []
}

// Get single setting by key
export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single()

  if (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return null
  }

  return data?.value as T
}

// Update or insert setting
export async function upsertSetting(key: string, value: unknown, userId?: string): Promise<boolean> {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        key,
        value,
        updated_by: userId || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "key",
      }
    )

  if (error) {
    console.error(`Error upserting setting ${key}:`, error)
    return false
  }

  return true
}

// Delete setting
export async function deleteSetting(key: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("site_settings")
    .delete()
    .eq("key", key)

  if (error) {
    console.error(`Error deleting setting ${key}:`, error)
    return false
  }

  return true
}

// Specific getters for typed settings
export async function getLogoSettings(): Promise<LogoSettings> {
  const settings = await getSetting<LogoSettings>("logo")
  return settings || { url: "/placeholder.svg", alt: "Store Logo" }
}

export async function getFontSettings(): Promise<FontSettings> {
  const settings = await getSetting<FontSettings>("fonts")
  return settings || { sans: "Manrope", serif: "Instrument Serif", mono: "Geist Mono" }
}

export async function getThemeSettings(mode: "light" | "dark"): Promise<ThemeSettings | null> {
  return await getSetting<ThemeSettings>(`theme_${mode}`)
}
