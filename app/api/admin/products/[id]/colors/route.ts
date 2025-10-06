import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET /api/admin/products/[id]/colors - List color variants for a product
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from("product_colors")
      .select("*")
      .eq("product_id", id)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching product colors:", error)
      return NextResponse.json({ error: "Failed to fetch colors", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ colors: data })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/products/[id]/colors - Add new color variant
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { color_name, color_hex, image_url, is_default, sort_order } = body

    // Validation
    if (!color_name || !color_hex || !image_url) {
      return NextResponse.json(
        { error: "Missing required fields: color_name, color_hex, image_url" },
        { status: 400 }
      )
    }

    // Auto-calculate sort_order if not provided
    let finalSortOrder = sort_order
    if (finalSortOrder == null) {
      const { data: maxData } = await supabase
        .from("product_colors")
        .select("sort_order")
        .eq("product_id", id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()

      finalSortOrder = (maxData?.sort_order ?? -1) + 1
    }

    // If setting as default, unset all other defaults for this product
    if (is_default) {
      await supabase.from("product_colors").update({ is_default: false }).eq("product_id", id)
    }

    // Insert new color variant
    const { data, error } = await supabase
      .from("product_colors")
      .insert({
        product_id: id,
        color_name,
        color_hex,
        image_url,
        is_default: !!is_default,
        sort_order: finalSortOrder,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating color variant:", error)
      return NextResponse.json({ error: "Failed to create color", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ color: data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
