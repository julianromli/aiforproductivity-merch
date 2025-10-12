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
import { ColorVariantForm } from "./color-variant-form"
import { useToast } from "@/hooks/use-toast"

export interface LocalColor {
  color_name: string
  color_hex: string
  image_url: string
  is_default: boolean
}

interface LocalColorVariantListProps {
  colors: LocalColor[]
  onColorsChange: (colors: LocalColor[]) => void
}

export function LocalColorVariantList({ colors, onColorsChange }: LocalColorVariantListProps) {
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null)
  const [colorToDeleteIndex, setColorToDeleteIndex] = useState<number | null>(null)

  const handleAddColor = () => {
    setSelectedColorIndex(null)
    setFormOpen(true)
  }

  const handleEditColor = (index: number) => {
    setSelectedColorIndex(index)
    setFormOpen(true)
  }

  const handleDeleteClick = (index: number) => {
    setColorToDeleteIndex(index)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (colorToDeleteIndex === null) return

    const filtered = colors.filter((_, i) => i !== colorToDeleteIndex)
    
    // Auto-set first as default if we deleted the default
    if (filtered.length > 0 && !filtered.some(c => c.is_default)) {
      filtered[0].is_default = true
    }
    
    onColorsChange(filtered)
    
    toast({
      title: "Success",
      description: "Color variant berhasil dihapus",
    })

    setDeleteDialogOpen(false)
    setColorToDeleteIndex(null)
  }

  const handleFormSuccess = (colorData?: LocalColor) => {
    if (!colorData) return
    
    if (selectedColorIndex === null) {
      // Adding new color
      const newColor = {
        ...colorData,
        is_default: colors.length === 0, // First color is default
      }
      onColorsChange([...colors, newColor])
    } else {
      // Editing existing color
      const updated = [...colors]
      updated[selectedColorIndex] = colorData
      onColorsChange(updated)
    }
  }

  const selectedColor = selectedColorIndex !== null ? colors[selectedColorIndex] : null
  const colorToDelete = colorToDeleteIndex !== null ? colors[colorToDeleteIndex] : null

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
                {colors.map((color, index) => (
                  <div
                    key={index}
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
                        onClick={() => handleEditColor(index)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="ml-1 hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(index)}
                        className="h-8 px-2"
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
        color={selectedColor}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setSelectedColorIndex(null)
          }
        }}
        onSuccess={handleFormSuccess}
        mode="local"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah lo yakin ingin menghapus color variant <strong>{colorToDelete?.color_name}</strong>? 
              {colorToDelete?.is_default && colors.length > 1 && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-500">
                  ⚠️ Ini adalah default color. Color pertama yang tersisa akan dijadikan default.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
