import { IconPackage, IconMessages, IconSparkles, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ProductsPreview } from "@/components/admin/products-preview"
import type { Product, Category } from "@/lib/types"

export default async function AdminDashboard() {
  // Fetch recent products
  const productsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/products?limit=6`,
    { cache: "no-store" }
  )
  const productsData = await productsResponse.json()
  const products: Product[] = productsData.products || []

  // Fetch categories
  const categoriesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`,
    { cache: "no-store" }
  )
  const categories: Category[] = await categoriesResponse.json()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Overview produk dan prompt management</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="@container grid grid-cols-1 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconPackage className="h-4 w-4" />
              Total Products
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              12
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="h-3 w-3" />
                +16.7%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Growing steadily <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              +2 produk dari bulan lalu
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconMessages className="h-4 w-4" />
              Active Prompts
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              8
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="h-3 w-3" />
                +33%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Prompt library expanding <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              6 custom, 2 default prompts
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconSparkles className="h-4 w-4" />
              AI Generations
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              234
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp className="h-3 w-3" />
                +18%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              High engagement <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              +18% dari minggu lalu
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Interactive Chart */}
      <div>
        <ChartAreaInteractive />
      </div>

      {/* Products Preview */}
      <ProductsPreview initialProducts={products} categories={categories} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manajemen cepat untuk produk dan prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Gunakan menu di sidebar untuk mengelola products dan prompts. Dashboard menampilkan statistik real-time dari aktivitas AI generation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
