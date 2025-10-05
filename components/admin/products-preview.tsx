"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Product, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useToast } from "@/hooks/use-toast"
import { IconEdit, IconExternalLink } from "@tabler/icons-react"

interface ProductsPreviewProps {
  initialProducts: Product[]
  categories: Category[]
}

export function ProductsPreview({ initialProducts, categories }: ProductsPreviewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    currency: "USD",
    category: "",
    image_url: "",
    is_active: true,
  })

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      currency: product.currency,
      category: product.category,
      image_url: product.image_url,
      is_active: product.is_active,
    })
  }

  const closeEditDialog = () => {
    setSelectedProduct(null)
  }

  const handleUpdate = async () => {
    if (!selectedProduct) return

    // Validation
    if (!formData.name || !formData.price || !formData.category || !formData.image_url) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      })

      if (!response.ok) throw new Error("Failed to update product")

      const { product: updatedProduct } = await response.json()

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      )

      toast({
        title: "Success",
        description: "Product berhasil diupdate",
      })

      closeEditDialog()
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengupdate product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Products</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Quick preview & edit untuk produk terbaru
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              View All
              <IconExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative">
                  <AspectRatio ratio={4 / 5}>
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </AspectRatio>
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(product.price, product.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.category}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openEditDialog(product)}
                  >
                    <IconEdit className="mr-2 h-4 w-4" />
                    Quick Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada produk. Silakan tambah produk baru.</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/admin/products">Go to Products</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quick Edit Product</DialogTitle>
            <DialogDescription>
              Edit informasi produk dengan cepat. Untuk edit lengkap, gunakan halaman products.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nike Air Max 90"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">
                  Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step={formData.currency === "IDR" ? "1" : "0.01"}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder={formData.currency === "IDR" ? "100000" : "99.99"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="edit-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="IDR">IDR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image-url">
                Image URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-image-url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Gunakan full products page untuk upload gambar baru
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is-active" className="cursor-pointer">
                Active Product
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
