import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Upload,
  Settings,
  Activity
} from "lucide-react"

export default function AdminDashboard() {
  // Mock data - in real app, fetch from API
  const stats = [
    {
      title: "Total Products",
      value: "12",
      description: "Active products in catalog",
      trend: "+2",
      trendLabel: "from last month",
      isPositive: true,
      icon: Package,
    },
    {
      title: "Active Prompts",
      value: "8",
      description: "AI prompt templates",
      trend: "+3",
      trendLabel: "from last week",
      isPositive: true,
      icon: MessageSquare,
    },
    {
      title: "AI Generations",
      value: "234",
      description: "Images generated this month",
      trend: "+18%",
      trendLabel: "from last period",
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: "Avg. Generation Time",
      value: "2.4s",
      description: "Per image generation",
      trend: "-0.3s",
      trendLabel: "faster than before",
      isPositive: true,
      icon: Activity,
    },
  ]

  const quickActions = [
    {
      title: "Add Product",
      description: "Create new product listing",
      href: "/admin/products/new",
      icon: Plus,
      variant: "default" as const,
    },
    {
      title: "Add Prompt",
      description: "Create AI prompt template",
      href: "/admin/prompts?action=new",
      icon: MessageSquare,
      variant: "outline" as const,
    },
    {
      title: "Upload Media",
      description: "Bulk upload product images",
      href: "/admin/products",
      icon: Upload,
      variant: "outline" as const,
    },
    {
      title: "Settings",
      description: "Configure admin preferences",
      href: "/admin",
      icon: Settings,
      variant: "outline" as const,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "Product created",
      item: "Nike Air Max 90",
      timestamp: "2 hours ago",
      type: "product",
    },
    {
      id: 2,
      action: "Prompt updated",
      item: "Product Photography",
      timestamp: "5 hours ago",
      type: "prompt",
    },
    {
      id: 3,
      action: "Image generated",
      item: "Adidas Sneakers",
      timestamp: "1 day ago",
      type: "generation",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview produk dan prompt management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl tabular-nums">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge 
                    variant="outline" 
                    className={stat.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                  >
                    {stat.isPositive ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {stat.trend}
                  </Badge>
                  <span className="text-muted-foreground">{stat.trendLabel}</span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <Button
                    variant={action.variant}
                    className="w-full justify-start h-auto py-3"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">{action.title}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {action.description}
                      </span>
                    </div>
                  </Button>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest changes and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    {activity.type === "product" && <Package className="h-3 w-3 text-primary" />}
                    {activity.type === "prompt" && <MessageSquare className="h-3 w-3 text-primary" />}
                    {activity.type === "generation" && <Activity className="h-3 w-3 text-primary" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
