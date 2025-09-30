import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET /api/admin/prompts - List all prompts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")
    const isDefault = searchParams.get("is_default")

    let query = supabase
      .from("ai_prompts")
      .select("*, products(id, name, category)")
      .order("created_at", { ascending: false })

    // Apply filters
    if (productId) {
      query = query.eq("product_id", productId)
    }

    if (isDefault !== null && isDefault !== undefined) {
      query = query.eq("is_default", isDefault === "true")
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching prompts:", error)
      return NextResponse.json({ error: "Failed to fetch prompts", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompts: data })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/prompts - Create new prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, prompt_template, is_default = false } = body

    // Validation
    if (!product_id || !prompt_template) {
      return NextResponse.json({ error: "Missing required fields: product_id, prompt_template" }, { status: 400 })
    }

    // If setting as default, unset other defaults for this product
    if (is_default) {
      await supabase.from("ai_prompts").update({ is_default: false }).eq("product_id", product_id)
    }

    const { data, error } = await supabase
      .from("ai_prompts")
      .insert([
        {
          product_id,
          prompt_template,
          is_default,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating prompt:", error)
      return NextResponse.json({ error: "Failed to create prompt", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompt: data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
