# AGENTS.md - Admin Dashboard

## 📦 Package Identity
Admin dashboard for managing products, AI prompts, and site customization. Protected by Supabase auth middleware (any authenticated user can access - no RBAC yet).

**Tech**: Next.js 15 App Router, React 19, ShadCN UI, React Hook Form + Zod

## ⚡ Setup & Run

```bash
# From project root
npm run dev          # Admin at http://localhost:3000/admin

# Type check (required before commits)
npx tsc --noEmit

# Lint
npm run lint
```

## 📐 Patterns & Conventions

### File Organization
```
app/admin/
├── layout.tsx              # Admin layout with sidebar
├── page.tsx                # Dashboard home
├── products/
│   ├── page.tsx            # Product list (Client Component)
│   ├── new/page.tsx        # Create product form
│   └── [id]/edit/page.tsx  # Edit product form
├── prompts/page.tsx        # AI prompt management
└── customize/page.tsx      # Site customization (logo, fonts, colors)
```

### Component Patterns

**✅ DO**: Use Client Components for interactive pages
```tsx
// app/admin/products/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
// ... fetch data, handle interactions
```

**✅ DO**: Use Server Components for static pages (when possible)
```tsx
// app/admin/layout.tsx (Server Component)
import { AppSidebar } from "@/components/app-sidebar"
```

**✅ DO**: Use admin-specific components from `components/admin/`
```tsx
import { ProductForm } from "@/components/admin/product-form"
import { ColorVariantList } from "@/components/admin/color-variant-list"
```

**❌ DON'T**: Make raw API calls - use fetch with proper error handling
```tsx
// ❌ Bad
const res = await fetch("/api/admin/products")
const data = await res.json()

// ✅ Good (with error handling)
try {
  const res = await fetch("/api/admin/products")
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  setProducts(data.products)
} catch (error) {
  toast({ title: "Error", description: error.message, variant: "destructive" })
}
```

### Form Patterns

**✅ DO**: Follow product form pattern for complex forms
- Example: `components/admin/product-form.tsx`
- Uses React Hook Form + Zod validation
- Handles image uploads to Vercel Blob
- Supports color variants (optional toggle)

**✅ DO**: Use ShadCN Form components
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/field"
```

### Color Variants Feature

**Creating products with colors**:
- Toggle "Use Color Variants" ON (default)
- Use `LocalColorVariantList` component (create mode)
- First color auto-set as default
- Submit creates product + all colors in one transaction

**Creating products without colors** (accessories, single-image items):
- Toggle "Use Color Variants" OFF
- Upload single main image
- Color section hides

**Editing existing products**:
- Use `ColorVariantList` component (API-based)
- Set default color via dropdown
- Add/edit/delete colors independently

## 🔗 Touch Points / Key Files

- **Layout**: `app/admin/layout.tsx` (sidebar, auth state)
- **Product list**: `app/admin/products/page.tsx` (data table, search, filters)
- **Product form**: `components/admin/product-form.tsx` (create/edit pattern)
- **Color variant form**: `components/admin/color-variant-form.tsx` (dual mode: api/local)
- **Sidebar navigation**: `components/app-sidebar.tsx` (reusable)

## 🔍 JIT Index Hints

```bash
# Find admin pages
rg -n "export default function" app/admin/ --glob "page.tsx"

# Find admin API routes
rg -n "export async function" app/api/admin/

# Find admin components
rg -n "export" components/admin/

# Find form schemas
rg -n "z.object" components/admin/
```

## ⚠️ Common Gotchas

- **Auth**: Middleware already protects `/admin/*` routes - don't duplicate auth checks
- **Type checking**: Build ignores errors → always run `npx tsc --noEmit`
- **Color variants**: Toggle locked in edit mode if product already has colors
- **Image uploads**: Use Vercel Blob API (see `app/api/admin/upload/logo/route.ts`)
- **Site settings**: Stored in `site_settings` table with JSONB (use settings service)

## ✅ Pre-PR Checks

```bash
npx tsc --noEmit && npm run lint && npm run dev
# Test in browser: http://localhost:3000/admin
```

---

**Related**: [API Routes](../api/AGENTS.md) | [Components](../../components/AGENTS.md) | [Root](../../AGENTS.md)
