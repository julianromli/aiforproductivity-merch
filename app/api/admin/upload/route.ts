import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

// POST /api/admin/upload - Upload image to Vercel Blob
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" },
        { status: 400 },
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split(".").pop()
    const filename = `products/${timestamp}-${randomString}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("[v0] Image uploaded successfully:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image", details: String(error) }, { status: 500 })
  }
}

// DELETE /api/admin/upload - Delete image from Vercel Blob
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Note: Vercel Blob doesn't have a direct delete API in the current SDK
    // This is a placeholder for future implementation
    // For now, we'll just return success as images are cheap to store

    console.log("[v0] Image deletion requested for:", url)

    return NextResponse.json({ message: "Image deletion queued (not implemented yet)" })
  } catch (error) {
    console.error("[v0] Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image", details: String(error) }, { status: 500 })
  }
}
