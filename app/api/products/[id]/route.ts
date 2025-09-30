import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// GET /api/products/[id] - Get single product with its AI prompt
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        price,
        currency,
        category,
        description,
        image_url,
        ai_prompts!inner(
          id,
          prompt_template,
          is_default
        )
      `,
      )
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      console.error("[v0] Error fetching product:", error)
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
    }

    // Get the default prompt or first prompt
    const defaultPrompt = data.ai_prompts?.find((p: any) => p.is_default) || data.ai_prompts?.[0]

    return NextResponse.json({
      product: {
        ...data,
        prompt: defaultPrompt?.prompt_template || null,
      },
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
