import { NextResponse } from "next/server"
import { getSetting } from "@/lib/settings-service"

export const dynamic = 'force-dynamic'

// GET default theme (public endpoint)
export async function GET() {
  try {
    const defaultTheme = await getSetting<"light" | "dark" | "system">("default_theme")
    
    // Return default if not set
    if (!defaultTheme) {
      return NextResponse.json({ theme: "system" })
    }

    return NextResponse.json({ theme: defaultTheme })
  } catch (error) {
    console.error("Error fetching default theme:", error)
    
    // Return default on error
    return NextResponse.json({ theme: "system" })
  }
}
