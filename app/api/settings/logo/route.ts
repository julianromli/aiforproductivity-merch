import { NextResponse } from "next/server"
import { getSetting } from "@/lib/settings-service"

export const dynamic = 'force-dynamic'

// GET logo settings (public endpoint)
export async function GET() {
  try {
    const logo = await getSetting<{ url: string; alt: string }>("logo")
    
    // Return default if not set
    if (!logo) {
      return NextResponse.json({
        url: "https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png",
        alt: "AI For Productivity"
      })
    }

    return NextResponse.json(logo)
  } catch (error) {
    console.error("Error fetching logo:", error)
    
    // Return default on error
    return NextResponse.json({
      url: "https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png",
      alt: "AI For Productivity"
    })
  }
}
