import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET /api/admin/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const isActive = searchParams.get("is_active")

    const offset = (page - 1) * limit

    let query = supabase
      .from("products")
      .select("*, ai_prompts(*)", { count: "exact" })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq("is_active", isActive === "true")
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      products: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, currency = "USD", category, description, image_url, is_active = true, sort_order = 0 } = body

    // Validation
    if (!name || !price || !category || !image_url) {
      return NextResponse.json({ error: "Missing required fields: name, price, category, image_url" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price,
          currency,
          category,
          description,
          image_url,
          is_active,
          sort_order,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating product:", error)
      return NextResponse.json({ error: "Failed to create product", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
