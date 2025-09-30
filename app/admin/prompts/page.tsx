"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface AIPrompt {
  id: string
  product_id: string
  prompt_template: string
  is_default: boolean
  created_at: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewPrompt, setPreviewPrompt] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    product_id: "",
    prompt_template: "",
    is_default: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [promptsRes, productsRes] = await Promise.all([fetch("/api/admin/prompts"), fetch("/api/admin/products")])

      if (!promptsRes.ok || !productsRes.ok) throw new Error("Failed to fetch")

      const promptsData = await promptsRes.json()
      const productsData = await productsRes.json()

      setPrompts(promptsData.prompts)
      setProducts(productsData.products)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_id || !formData.prompt_template) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingPrompt ? `/api/admin/prompts/${editingPrompt.id}` : "/api/admin/prompts"

      const response = await fetch(url, {
        method: editingPrompt ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save prompt")

      toast({
        title: "Success",
        description: `Prompt berhasil ${editingPrompt ? "diupdate" : "dibuat"}`,
      })

      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan prompt",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (prompt: AIPrompt) => {
    setEditingPrompt(prompt)
    setFormData({
      product_id: prompt.product_id,
      prompt_template: prompt.prompt_template,
      is_default: prompt.is_default,
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/admin/prompts/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Prompt berhasil dihapus",
      })

      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus prompt",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      product_id: "",
      prompt_template: "",
      is_default: false,
    })
    setEditingPrompt(null)
  }

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || "Unknown Product"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">AI Prompts</h1>
          <p className="text-muted-foreground">Kelola prompt template untuk setiap produk</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPrompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
              <DialogDescription>Buat atau edit prompt template untuk AI image generation</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt Template</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt_template}
                  onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                  placeholder="Create a professional product photography showing..."
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  Tip: Gunakan deskripsi yang detail untuk hasil yang lebih baik
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Set as default prompt
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingPrompt ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Prompts List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : prompts.length === 0 ? (
        <Card>
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Belum ada prompt. Klik "Add Prompt" untuk membuat yang pertama.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{getProductName(prompt.product_id)}</CardTitle>
                    <CardDescription>Created {new Date(prompt.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {prompt.is_default && <Badge variant="secondary">Default</Badge>}
                    <Button variant="ghost" size="icon" onClick={() => setPreviewPrompt(prompt.prompt_template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(prompt)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(prompt.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 font-mono text-muted-foreground text-sm">{prompt.prompt_template}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewPrompt} onOpenChange={() => setPreviewPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prompt Preview</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border bg-muted p-4">
            <p className="whitespace-pre-wrap font-mono text-sm">{previewPrompt}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the prompt template.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
