"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Plus } from "lucide-react"
import type { ProductColor } from "@/lib/types"
import { ColorVariantForm } from "./color-variant-form"
import { useToast } from "@/hooks/use-toast"

interface ColorVariantListProps {
  productId: string
  colors: ProductColor[]
  onColorsChange: () => void
}

export function ColorVariantList({ productId, colors, onColorsChange }: ColorVariantListProps) {
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [colorToDelete, setColorToDelete] = useState<ProductColor | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleAddColor = () => {
    setSelectedColor(null)
    setFormOpen(true)
  }

  const handleEditColor = (color: ProductColor) => {
    setSelectedColor(color)
    setFormOpen(true)
  }

  const handleDeleteClick = (color: ProductColor) => {
    setColorToDelete(color)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!colorToDelete) return

    try {
      setDeleting(true)

      const response = await fetch(`/api/admin/products/${productId}/colors/${colorToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete color")
      }

      toast({
        title: "Success",
        description: "Color variant berhasil dihapus",
      })

      onColorsChange()
      setDeleteDialogOpen(false)
      setColorToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus color variant",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Product Colors</span>
            <Badge variant="secondary">{colors.length} variant{colors.length !== 1 ? "s" : ""}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {colors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-3">Belum ada color variant</p>
              <Button type="button" onClick={handleAddColor} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add First Color
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {colors.map((color) => (
                  <div
                    key={color.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Color Circle */}
                    <div
                      className="w-10 h-10 rounded-full border-2 flex-shrink-0"
                      style={{ backgroundColor: color.color_hex }}
                      title={color.color_hex}
                    />

                    {/* Color Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{color.color_name}</p>
                        {color.is_default && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{color.image_url}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditColor(color)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="ml-1 hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(color)}
                        className="h-8 px-2"
                        disabled={colors.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="ml-1 hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="button" onClick={handleAddColor} className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Color
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Color Form Dialog */}
      <ColorVariantForm
        productId={productId}
        color={selectedColor}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            // Reset selectedColor when dialog closes
            setSelectedColor(null)
          }
        }}
        onSuccess={onColorsChange}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah lo yakin ingin menghapus color variant <strong>{colorToDelete?.color_name}</strong>? Action ini
              tidak bisa di-undo.
              {colorToDelete?.is_default && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-500">
                  ⚠️ Ini adalah default color. Color lain akan otomatis dijadikan default.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
