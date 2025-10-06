import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// PUT /api/admin/products/[id]/colors/[colorId] - Update color variant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; colorId: string }> }
) {
  try {
    const { id, colorId } = await params
    const body = await request.json()
    const { color_name, color_hex, image_url, is_default, sort_order } = body

    // If setting as default, unset all other defaults for this product
    if (is_default === true) {
      await supabase.from("product_colors").update({ is_default: false }).eq("product_id", id)
    }

    // Build update object (only include provided fields)
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }

    if (color_name !== undefined) updateData.color_name = color_name
    if (color_hex !== undefined) updateData.color_hex = color_hex
    if (image_url !== undefined) updateData.image_url = image_url
    if (is_default !== undefined) updateData.is_default = is_default
    if (sort_order !== undefined) updateData.sort_order = sort_order

    const { data, error } = await supabase
      .from("product_colors")
      .update(updateData)
      .eq("id", colorId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Color variant not found" }, { status: 404 })
      }
      console.error("[v0] Error updating color variant:", error)
      return NextResponse.json({ error: "Failed to update color", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ color: data })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id]/colors/[colorId] - Delete color variant
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; colorId: string }> }
) {
  try {
    const { id, colorId } = await params

    // Check if this is the only color variant (prevent deletion)
    const { count } = await supabase
      .from("product_colors")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id)

    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only color variant. Each product must have at least one color." },
        { status: 400 }
      )
    }

    // Check if deleting the default color
    const { data: targetColor } = await supabase
      .from("product_colors")
      .select("is_default")
      .eq("id", colorId)
      .single()

    // Delete the color
    const { error } = await supabase.from("product_colors").delete().eq("id", colorId)

    if (error) {
      console.error("[v0] Error deleting color variant:", error)
      return NextResponse.json({ error: "Failed to delete color", details: error.message }, { status: 500 })
    }

    // If we deleted the default, set the next color as default
    if (targetColor?.is_default) {
      const { data: nextColor } = await supabase
        .from("product_colors")
        .select("id")
        .eq("product_id", id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (nextColor?.id) {
        await supabase.from("product_colors").update({ is_default: true }).eq("id", nextColor.id)
      }
    }

    return NextResponse.json({ message: "Color variant deleted successfully" })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
