import { NextResponse } from "next/server"
import { getSetting } from "@/lib/settings-service"

export const dynamic = 'force-dynamic'

// GET site name (public endpoint)
export async function GET() {
  try {
    const siteName = await getSetting<string>("site_name")
    
    // Return default if not set
    if (!siteName) {
      return NextResponse.json({ name: "AI For Productivity" })
    }

    return NextResponse.json({ name: siteName })
  } catch (error) {
    console.error("Error fetching site name:", error)
    
    // Return default on error
    return NextResponse.json({ name: "AI For Productivity" })
  }
}
