"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Upload, Loader2, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name too long"),
  price: z.coerce.number().min(0, "Price must be positive").max(999999, "Price too high"),
  currency: z.enum(["USD", "EUR", "IDR"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  buy_link: z.string().url("Invalid URL").optional().or(z.literal("")),
  image_url: z.string().min(1, "Product image is required"),
  is_active: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  mode: "create" | "edit"
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      currency: (product?.currency as "USD" | "EUR" | "IDR") || "USD",
      category: product?.category || "",
      description: product?.description || "",
      image_url: product?.image_url || "",
      buy_link: product?.buy_link || "",
      is_active: product?.is_active ?? true,
    },
  })

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
      form.setValue("image_url", data.url)
      setImagePreview(data.url)

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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save product")

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
    }
  }

  const { isSubmitting, errors } = form.formState

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Basic details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Nike Air Max 90" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="99.99" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="IDR">IDR</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Footwear">Footwear</SelectItem>
                          <SelectItem value="Apparel">Apparel</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Product description..." 
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional product description for internal reference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buy_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Link (External URL)</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://tokopedia.com/..." 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        External purchase link (Tokopedia, Shopee, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>
        </div>

        {/* Image Upload & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>Upload product image (max 5MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        {imagePreview ? (
                          <div className="relative aspect-square overflow-hidden rounded-lg border">
                            <Image 
                              src={imagePreview} 
                              alt="Product preview" 
                              fill 
                              className="object-cover" 
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImagePreview(null)
                                form.setValue("image_url", "")
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
                            <span className="ml-2 text-sm text-muted-foreground">Uploading...</span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Product visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "active")}
                      defaultValue={field.value ? "active" : "inactive"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only active products are visible on the storefront
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="flex-1 mr-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-4 ml-auto">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Product" : "Update Product"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
