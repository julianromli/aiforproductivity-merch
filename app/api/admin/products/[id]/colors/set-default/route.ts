import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// POST /api/admin/products/[id]/colors/set-default - Set default color for product
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { colorId } = body

    if (!colorId) {
      return NextResponse.json({ error: "colorId is required" }, { status: 400 })
    }

    // Verify the color belongs to this product
    const { data: color, error: colorError } = await supabase
      .from("product_colors")
      .select("id, image_url")
      .eq("id", colorId)
      .eq("product_id", productId)
      .single()

    if (colorError || !color) {
      return NextResponse.json({ error: "Color not found for this product" }, { status: 404 })
    }

    // Unset all defaults for this product
    await supabase.from("product_colors").update({ is_default: false }).eq("product_id", productId)

    // Set the new default
    const { error: updateError } = await supabase
      .from("product_colors")
      .update({ is_default: true })
      .eq("id", colorId)

    if (updateError) {
      console.error("[v0] Error setting default color:", updateError)
      return NextResponse.json({ error: "Failed to set default color", details: updateError.message }, { status: 500 })
    }

    // Also update the product's image_url to match the default color (for backwards compatibility)
    await supabase.from("products").update({ image_url: color.image_url }).eq("id", productId)

    return NextResponse.json({ message: "Default color updated successfully" })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
