import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createServerClient } from "@/lib/supabase-server"

// Check if user is authenticated
// Note: Middleware already protects admin routes, this is a secondary check
async function isAuthenticated(): Promise<{ isAuthenticated: boolean; reason?: string }> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[logo] Auth check failed:", authError || "No user")
      return { isAuthenticated: false, reason: "Not authenticated" }
    }

    console.log("[logo] User authenticated:", user.id, user.email)
    return { isAuthenticated: true }
  } catch (error) {
    console.error("[logo] Error in auth check:", error)
    return { isAuthenticated: false, reason: String(error) }
  }
}

// POST /api/admin/upload/logo - Upload logo to Vercel Blob
export async function POST(request: NextRequest) {
  try {
    // Check authentication (middleware should have already handled this, but double-check)
    const authCheck = await isAuthenticated()
    if (!authCheck.isAuthenticated) {
      console.log("[logo] Auth check failed:", authCheck.reason)
      return NextResponse.json(
        { error: "Unauthorized", details: authCheck.reason || "Authentication required" },
        { status: 403 }
      )
    }

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[logo] BLOB_READ_WRITE_TOKEN not configured")
      return NextResponse.json(
        { 
          error: "Vercel Blob not configured",
          details: "Please configure Vercel Blob storage in your Vercel project settings, or use 'Use URL' mode to enter an external image URL instead.",
          action: "setup_blob"
        },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type (images and SVG)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB for logo)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 2MB limit" }, { status: 400 })
    }

    // Generate filename for logo
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `logos/logo-${timestamp}.${extension}`

    console.log("[logo] Uploading logo:", filename, "size:", file.size)

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("[logo] Logo uploaded successfully:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[logo] Error uploading logo:", error)
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isConfigError = errorMessage.toLowerCase().includes('token') || 
                         errorMessage.toLowerCase().includes('unauthorized') ||
                         errorMessage.toLowerCase().includes('blob')
    
    if (isConfigError) {
      return NextResponse.json({ 
        error: "Vercel Blob configuration error",
        details: "Please set up Vercel Blob storage or use 'Use URL' mode to enter an external image URL.",
        techDetails: errorMessage
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: "Failed to upload logo", 
      details: errorMessage 
    }, { status: 500 })
  }
}
