import { ProductForm } from "@/components/admin/product-form"
import { createServerClient } from "@/lib/supabase"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single()

  if (!product) {
    return (
      <div className="space-y-6">
        <h1 className="font-bold text-3xl">Product Not Found</h1>
        <p className="text-muted-foreground">Product dengan ID tersebut tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Edit Product</h1>
        <p className="text-muted-foreground">Update informasi produk</p>
      </div>

      <ProductForm product={product} mode="edit" />
    </div>
  )
}
