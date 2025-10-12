"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Loader2 } from "lucide-react"
import { COLOR_MAP, COLOR_OPTIONS, type ColorName } from "@/lib/color-constants"
import type { ProductColor } from "@/lib/types"
import type { LocalColor } from "./local-color-variant-list"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface ColorVariantFormProps {
  productId?: string
  color?: ProductColor | LocalColor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (colorData?: LocalColor) => void
  mode?: "api" | "local"
}

export function ColorVariantForm({ productId, color, open, onOpenChange, onSuccess, mode = "api" }: ColorVariantFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    color_name: (color?.color_name as ColorName) || ("Black" as ColorName),
    color_hex: color?.color_hex || COLOR_MAP.Black,
    image_url: color?.image_url || "",
  })
  const [hexError, setHexError] = useState<string | null>(null)
  const isCustomColor = formData.color_name === "Custom"

  // Reset form data when dialog opens/closes or color prop changes
  useEffect(() => {
    if (open) {
      setFormData({
        color_name: (color?.color_name as ColorName) || ("Black" as ColorName),
        color_hex: color?.color_hex || COLOR_MAP.Black,
        image_url: color?.image_url || "",
      })
      setHexError(null)
    }
  }, [open, color])

  const handleColorChange = (colorName: ColorName) => {
    setFormData({
      ...formData,
      color_name: colorName,
      color_hex: COLOR_MAP[colorName],
    })
    setHexError(null)
  }

  const validateHex = (hex: string): boolean => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    return hexRegex.test(hex)
  }

  const handleHexChange = (hex: string) => {
    setFormData({ ...formData, color_hex: hex })
    
    if (hex && !validateHex(hex)) {
      setHexError("Invalid hex format. Use #RRGGBB (e.g., #FF5733)")
    } else {
      setHexError(null)
    }
  }

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

      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setFormData((prev) => ({ ...prev, image_url: data.url }))

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

  const handleSubmit = async () => {
    // Validation
    if (!formData.image_url) {
      toast({
        title: "Error",
        description: "Mohon upload image untuk warna ini",
        variant: "destructive",
      })
      return
    }

    // Validate hex code for custom colors
    if (isCustomColor && !validateHex(formData.color_hex)) {
      toast({
        title: "Error",
        description: "Mohon masukkan hex code yang valid (format: #RRGGBB)",
        variant: "destructive",
      })
      return
    }

    // Local mode: return data without API call
    if (mode === "local") {
      const colorData: LocalColor = {
        color_name: formData.color_name,
        color_hex: formData.color_hex,
        image_url: formData.image_url,
        is_default: false, // Parent will handle default logic
      }
      
      toast({
        title: "Success",
        description: `Color variant berhasil ${color ? "diupdate" : "ditambahkan"}`,
      })
      
      onSuccess(colorData)
      onOpenChange(false)
      return
    }

    // API mode: existing logic
    try {
      setLoading(true)

      const url = color && 'id' in color
        ? `/api/admin/products/${productId}/colors/${color.id}`
        : `/api/admin/products/${productId}/colors`

      const response = await fetch(url, {
        method: color && 'id' in color ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save color")
      }

      toast({
        title: "Success",
        description: `Color variant berhasil ${color ? "diupdate" : "ditambahkan"}`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan color variant",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{color ? "Edit" : "Add"} Color Variant</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Color Selection */}
          <div className="space-y-2">
            <Label htmlFor="color-select">
              Color <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.color_name} onValueChange={handleColorChange}>
              <SelectTrigger id="color-select">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: COLOR_MAP[option.value] }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hex Code */}
          <div className="space-y-2">
            <Label htmlFor="color-hex">
              Hex Code {isCustomColor && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="color-hex"
                value={formData.color_hex}
                onChange={(e) => handleHexChange(e.target.value)}
                disabled={!isCustomColor}
                placeholder="#000000"
                maxLength={7}
                className={hexError ? "border-destructive" : ""}
              />
              {isCustomColor && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2"
                  style={{ backgroundColor: validateHex(formData.color_hex) ? formData.color_hex : "#CCCCCC" }}
                />
              )}
            </div>
            {hexError && <p className="text-xs text-destructive">{hexError}</p>}
            {isCustomColor && !hexError && (
              <p className="text-xs text-muted-foreground">Enter a valid hex color code (e.g., #FF5733)</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="color-image">
              Product Image for this Color <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-col gap-3">
              <Button type="button" variant="outline" disabled={uploading} className="w-full" asChild>
                <label htmlFor="color-image-input" className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </label>
              </Button>
              <input
                id="color-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />

              {formData.image_url && (
                <div className="relative w-full h-48 border rounded overflow-hidden">
                  <Image src={formData.image_url} alt="Color preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Upload image produk dengan warna yang sesuai (max 5MB)</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Color"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
