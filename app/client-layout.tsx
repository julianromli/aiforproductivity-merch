"use client"

import type React from "react"

import { Analytics } from "@vercel/analytics/next"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { ThemeApplier } from "@/components/theme-applier"

// Separate component for search params handling
function SearchParamsHandler() {
  const searchParams = useSearchParams()
  // Add any search params handling logic here if needed
  return null
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body className="font-sans antialiased">
      <ThemeApplier />
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      <Analytics />
    </body>
  )
}
