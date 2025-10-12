import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Fetch logo from site_settings
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "logo")
      .maybeSingle()

    if (error) {
      console.error("Error fetching logo:", error)
      // Fallback to default favicon
      return NextResponse.redirect(new URL("/favicon.ico", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
    }

    if (!data?.value) {
      // No logo set, use default favicon
      return NextResponse.redirect(new URL("/favicon.ico", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
    }

    // Parse logo JSON to get URL
    const logoUrl = typeof data.value === "string" 
      ? JSON.parse(data.value).url 
      : data.value.url

    if (!logoUrl) {
      return NextResponse.redirect(new URL("/favicon.ico", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
    }

    // Redirect to the actual logo URL
    return NextResponse.redirect(logoUrl, { status: 307 })
  } catch (error) {
    console.error("Error in favicon route:", error)
    return NextResponse.redirect(new URL("/favicon.ico", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
  }
}
