"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "@/components/admin/products/columns"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/products")
      if (!response.ok) throw new Error("Failed to fetch products")

      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Data Table */}
      <DataTable 
        columns={columns} 
        data={products} 
        isLoading={loading}
        searchKey="name"
        searchPlaceholder="Search products..."
      />
    </div>
  )
}
