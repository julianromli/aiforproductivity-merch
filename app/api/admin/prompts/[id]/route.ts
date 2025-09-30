import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET /api/admin/prompts/[id] - Get single prompt
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from("ai_prompts")
      .select("*, products(id, name, category)")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
      }
      console.error("[v0] Error fetching prompt:", error)
      return NextResponse.json({ error: "Failed to fetch prompt", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompt: data })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/prompts/[id] - Update prompt
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { prompt_template, is_default } = body

    const updateData: any = { updated_at: new Date().toISOString() }

    if (prompt_template !== undefined) updateData.prompt_template = prompt_template
    if (is_default !== undefined) updateData.is_default = is_default

    // If setting as default, first get the product_id
    if (is_default === true) {
      const { data: currentPrompt } = await supabase.from("ai_prompts").select("product_id").eq("id", id).single()

      if (currentPrompt) {
        // Unset other defaults for this product
        await supabase
          .from("ai_prompts")
          .update({ is_default: false })
          .eq("product_id", currentPrompt.product_id)
          .neq("id", id)
      }
    }

    const { data, error } = await supabase.from("ai_prompts").update(updateData).eq("id", id).select().single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
      }
      console.error("[v0] Error updating prompt:", error)
      return NextResponse.json({ error: "Failed to update prompt", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompt: data })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/prompts/[id] - Delete prompt
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabase.from("ai_prompts").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting prompt:", error)
      return NextResponse.json({ error: "Failed to delete prompt", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Prompt deleted successfully" })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
