"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Upload, Loader2, X } from "lucide-react"
import type { Product, ProductColor } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ColorVariantList } from "./color-variant-list"
import { LocalColorVariantList, type LocalColor } from "./local-color-variant-list"

interface ProductFormProps {
  product?: Product
  mode: "create" | "edit"
}

interface Category {
  id: string
  name: string
  slug: string
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [colors, setColors] = useState<ProductColor[]>(product?.colors || [])
  const [loadingColors, setLoadingColors] = useState(false)
  const [defaultColorId, setDefaultColorId] = useState<string | null>(null)
  
  // Create mode: local color management
  const [useColorVariants, setUseColorVariants] = useState(true)
  const [pendingColors, setPendingColors] = useState<LocalColor[]>([])

  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    currency: product?.currency || "USD",
    category: product?.category || "",
    description: product?.description || "",
    image_url: product?.image_url || "",
    buy_link: product?.buy_link || "",
    is_active: product?.is_active ?? true,
  })

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error("[v0] Error fetching categories:", error)
        toast({
          title: "Warning",
          description: "Gagal memuat categories. Coba refresh page.",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch colors for existing product
  const fetchColors = async () => {
    if (mode !== "edit" || !product?.id) return

    try {
      setLoadingColors(true)
      const response = await fetch(`/api/admin/products/${product.id}/colors`)
      if (!response.ok) throw new Error("Failed to fetch colors")
      const data = await response.json()
      const fetchedColors = data.colors || []
      setColors(fetchedColors)
      
      // Set default color ID
      const defaultColor = fetchedColors.find((c: ProductColor) => c.is_default)
      if (defaultColor) {
        setDefaultColorId(defaultColor.id)
        // Update image preview to default color's image
        setImagePreview(defaultColor.image_url)
        setFormData((prev) => ({ ...prev, image_url: defaultColor.image_url }))
      }
      
      // Set color variants toggle based on whether product has colors
      setUseColorVariants(fetchedColors.length > 0)
    } catch (error) {
      console.error("[v0] Error fetching colors:", error)
      toast({
        title: "Warning",
        description: "Gagal memuat color variants. Coba refresh page.",
        variant: "destructive",
      })
    } finally {
      setLoadingColors(false)
    }
  }

  useEffect(() => {
    fetchColors()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setFormData((prev) => ({ ...prev, image_url: data.url }))
      setImagePreview(data.url)

      // If in edit mode and there's a default color, update its image
      if (mode === "edit" && product?.id && defaultColorId) {
        try {
          await fetch(`/api/admin/products/${product.id}/colors/${defaultColorId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_url: data.url }),
          })
        } catch (err) {
          console.error("[v0] Failed to update default color image:", err)
        }
      }

      toast({
        title: "Success",
        description: "Image berhasil diupload",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengupload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang required",
        variant: "destructive",
      })
      return
    }

    // Validate based on color variants toggle
    if (useColorVariants) {
      // If using color variants, require at least 1 color in create mode
      if (mode === "create" && pendingColors.length === 0) {
        toast({
          title: "Error",
          description: "Mohon tambahkan minimal 1 color variant",
          variant: "destructive",
        })
        return
      }
      // In edit mode, colors should exist in DB
      if (mode === "edit" && colors.length === 0) {
        toast({
          title: "Error",
          description: "Mohon tambahkan minimal 1 color variant",
          variant: "destructive",
        })
        return
      }
    } else {
      // If NOT using color variants, require main image
      if (!formData.image_url) {
        toast({
          title: "Error",
          description: "Mohon upload image produk",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setLoading(true)

      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
        }),
      })

      if (!response.ok) throw new Error("Failed to save product")

      const { product: savedProduct } = await response.json()

      // If create mode and using color variants, create colors
      if (mode === "create" && useColorVariants && pendingColors.length > 0) {
        try {
          await Promise.all(
            pendingColors.map((color, index) =>
              fetch(`/api/admin/products/${savedProduct.id}/colors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...color,
                  is_default: index === 0, // First color is default
                  sort_order: index,
                }),
              })
            )
          )
        } catch (colorError) {
          console.error("[v0] Error creating colors:", colorError)
          toast({
            title: "Partial Success",
            description: "Product dibuat, tapi gagal menambahkan beberapa colors. Silakan tambahkan secara manual.",
            variant: "destructive",
          })
          router.push(`/admin/products/${savedProduct.id}/edit`)
          router.refresh()
          return
        }
      }

      toast({
        title: "Success",
        description: `Product berhasil ${mode === "create" ? "dibuat" : "diupdate"}`,
      })

      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal ${mode === "create" ? "membuat" : "mengupdate"} product`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nike Air Max 90"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step={formData.currency === "IDR" ? "1" : "0.01"}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder={formData.currency === "IDR" ? "100000" : "99.99"}
                    required
                  />
                  {formData.currency === "IDR" && (
                    <p className="text-xs text-muted-foreground">
                      Format: tanpa desimal (contoh: 100000 untuk Rp 100.000)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger id="currency">
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
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={loadingCategories}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy_link">Buy Link (External URL)</Label>
                <Input
                  id="buy_link"
                  type="url"
                  value={formData.buy_link || ""}
                  onChange={(e) => setFormData({ ...formData, buy_link: e.target.value })}
                  placeholder="https://tokopedia.com/..."
                />
                <p className="text-xs text-muted-foreground">Link eksternal untuk pembelian (Tokopedia, Shopee, dll.)</p>
              </div>

              {/* Color Variants Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="use-color-variants" className="cursor-pointer">
                    Use Color Variants
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this for products with different color options
                  </p>
                </div>
                <Switch
                  id="use-color-variants"
                  checked={useColorVariants}
                  onCheckedChange={(checked) => {
                    // Warn if switching off with existing colors
                    if (!checked && ((mode === "create" && pendingColors.length > 0) || (mode === "edit" && colors.length > 0))) {
                      if (!confirm("Menonaktifkan color variants akan mengabaikan semua warna yang sudah ditambahkan. Lanjutkan?")) {
                        return
                      }
                    }
                    setUseColorVariants(checked)
                  }}
                  disabled={mode === "edit" && colors.length > 0}
                />
              </div>
              {mode === "edit" && colors.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  ⚠️ Toggle disabled: Product sudah memiliki color variants. Hapus semua colors terlebih dahulu untuk menonaktifkan.
                </p>
              )}

              {/* Default Color Selector (Edit Mode Only, when using color variants) */}
              {mode === "edit" && useColorVariants && (
                <div className="space-y-2">
                  <Label htmlFor="default-color">
                    Default Color <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={defaultColorId || ""}
                    onValueChange={async (colorId) => {
                      if (!product?.id) return
                      
                      try {
                        // Update all colors: set new default, unset others
                        await fetch(`/api/admin/products/${product.id}/colors/set-default`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ colorId }),
                        })
                        
                        setDefaultColorId(colorId)
                        
                        // Update image preview to new default color
                        const newDefaultColor = colors.find((c) => c.id === colorId)
                        if (newDefaultColor) {
                          setImagePreview(newDefaultColor.image_url)
                          setFormData((prev) => ({ ...prev, image_url: newDefaultColor.image_url }))
                        }
                        
                        // Refresh colors to get updated is_default flags
                        await fetchColors()
                        
                        toast({
                          title: "Success",
                          description: "Default color updated",
                        })
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update default color",
                          variant: "destructive",
                        })
                      }
                    }}
                    disabled={loadingColors || colors.length === 0}
                  >
                    <SelectTrigger id="default-color">
                      <SelectValue placeholder={colors.length === 0 ? "Add color variants first" : "Select default color"} />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.color_hex }}
                            />
                            {color.color_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This color will be displayed first on the product page
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Image Upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  <Image src={imagePreview || "/placeholder.svg"} alt="Product preview" fill className="object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData({ ...formData, image_url: "" })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary"
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">Click to upload</p>
                  <p className="text-muted-foreground text-xs">PNG, JPG up to 5MB</p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}

              {uploading && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Color Variants Section - Show in BOTH modes when enabled */}
      {useColorVariants && (
        <div className="space-y-4">
          {mode === "create" ? (
            <LocalColorVariantList colors={pendingColors} onColorsChange={setPendingColors} />
          ) : product?.id ? (
            <ColorVariantList productId={product.id} colors={colors} onColorsChange={fetchColors} />
          ) : null}
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> {mode === "create" ? "Tambahkan minimal 1 color variant. " : ""}
            Upload image yang berbeda untuk setiap warna.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Product" : "Update Product"}
        </Button>
      </div>
    </form>
  )
}
