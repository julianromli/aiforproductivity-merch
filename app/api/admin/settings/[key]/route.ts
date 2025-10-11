import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { getSetting, upsertSetting, deleteSetting } from "@/lib/settings-service"

// Check if user is authenticated
// Note: Middleware already protects admin routes
async function isAuthenticated(): Promise<boolean> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return !!user
}

// GET single setting by key
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params
    const value = await getSetting(key)

    if (value === null) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 })
    }

    return NextResponse.json({ key, value })
  } catch (error) {
    console.error("Error fetching setting:", error)
    return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 })
  }
}

// PUT update single setting
export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { key } = await params
    const body = await request.json()
    const { value } = body

    if (value === undefined) {
      return NextResponse.json({ error: "Missing value" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const success = await upsertSetting(key, value, user?.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
    }

    return NextResponse.json({ success: true, key, value })
  } catch (error) {
    console.error("Error updating setting:", error)
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
  }
}

// DELETE setting
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { key } = await params
    const success = await deleteSetting(key)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete setting" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting setting:", error)
    return NextResponse.json({ error: "Failed to delete setting" }, { status: 500 })
  }
}
