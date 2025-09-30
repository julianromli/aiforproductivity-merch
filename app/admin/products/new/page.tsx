import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Create Product</h1>
        <p className="text-muted-foreground">Tambah produk baru ke katalog</p>
      </div>

      <ProductForm mode="create" />
    </div>
  )
}
