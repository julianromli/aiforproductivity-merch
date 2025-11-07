# AGENTS.md - React Components

## 📦 Package Identity
React components split into ShadCN UI library (`components/ui/`) and admin-specific components (`components/admin/`). Mix of Server and Client Components.

**Tech**: React 19, ShadCN UI (New York style), Radix UI, Lucide React icons

## ⚡ Setup & Run

```bash
# Add new ShadCN component (use ShadCN MCP tools)
# 1. Search: search_items_in_registries query="button"
# 2. Example: get_item_examples_from_registries name="button"
# 3. Install: get_add_command_for_items names=["button"]
# 4. Run: npx shadcn@latest add button

# Type check
npx tsc --noEmit
```

## 📐 Patterns & Conventions

### File Organization
```
components/
├── ui/                         # ShadCN components (DO NOT edit manually)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...                     # 30+ components
├── admin/                      # Admin-specific components
│   ├── product-form.tsx        # Main product CRUD form
│   ├── color-variant-form.tsx  # Dual-mode color form
│   ├── color-variant-list.tsx  # API-based color list (edit mode)
│   ├── local-color-variant-list.tsx # Local state color list (create mode)
│   └── products-preview.tsx    # Product gallery
├── site-logo.tsx               # Reusable logo component
├── site-header.tsx             # Public site header
├── app-sidebar.tsx             # Admin sidebar
└── theme-provider.tsx          # Dark mode provider
```

### Server vs Client Components

**✅ DO**: Use Server Components by default (no directive)
```tsx
// components/site-header.tsx (Server Component)
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return <header>...</header>
}
```

**✅ DO**: Use Client Components when needed (hooks, events, browser APIs)
```tsx
// components/admin/product-form.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"

export function ProductForm() {
  const [loading, setLoading] = useState(false)
  // ... hooks and event handlers
}
```

### ShadCN Component Usage

**✅ DO**: Import from `@/components/ui/*`
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
```

**✅ DO**: Use `cn()` helper for conditional classes
```tsx
import { cn } from "@/lib/utils"

<Button className={cn("base-class", isActive && "active-class")} />
```

**❌ DON'T**: Edit ShadCN components in `components/ui/` directly
```tsx
// ❌ Bad - editing components/ui/button.tsx
// ✅ Good - wrap it or use className prop
```

### Admin Component Patterns

**✅ DO**: Follow product form pattern for complex forms
- Example: `components/admin/product-form.tsx`
- React Hook Form + Zod validation
- Handles image uploads (Vercel Blob)
- Error handling with toast notifications

**✅ DO**: Use dual-mode pattern for reusable forms
- Example: `components/admin/color-variant-form.tsx`
- `mode="api"` - Makes API calls (edit mode)
- `mode="local"` - Returns data to parent (create mode)

```tsx
// Edit mode (API calls)
<ColorVariantForm
  productId={productId}
  mode="api"
  onSuccess={() => refetch()}
/>

// Create mode (local state)
<ColorVariantForm
  mode="local"
  onSubmit={(data) => handleLocalAdd(data)}
/>
```

### Form Validation Pattern

**✅ DO**: Use Zod schemas with React Hook Form
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, "Name required"),
  price: z.number().positive("Must be positive"),
})

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", price: 0 },
})
```

### Image Upload Pattern

**✅ DO**: Upload to Vercel Blob via API
```tsx
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  
  const res = await fetch("/api/admin/upload/logo", {
    method: "POST",
    body: formData,
  })
  
  const { url } = await res.json()
  return url
}
```

## 🔗 Touch Points / Key Files

- **Product form**: `components/admin/product-form.tsx` (complex form pattern)
- **Color variant forms**: `components/admin/*-color-variant-*.tsx` (dual-mode pattern)
- **Site logo**: `components/site-logo.tsx` (reusable with API fetch)
- **Data table**: `components/data-table.tsx` (TanStack Table pattern)
- **Utils**: `lib/utils.ts` (cn helper, formatters)

## 🔍 JIT Index Hints

```bash
# Find all components
rg -n "export (function|const)" components/ --glob "*.tsx"

# Find client components
rg -n "use client" components/

# Find ShadCN components
ls components/ui/

# Find admin components
rg -n "export function" components/admin/

# Find components using hooks
rg -n "useState|useEffect|useForm" components/
```

## ⚠️ Common Gotchas

- **ShadCN UI**: Install via MCP tools, don't manually copy code
- **Server/Client boundary**: Can't use hooks in Server Components
- **Image optimization**: `next/image` requires unoptimized: true in config
- **Dark mode**: Use `next-themes` provider (already in layout)
- **Path alias**: Always use `@/*` imports (e.g., `@/components/ui/button`)
- **Icons**: Only use `lucide-react`, no other icon libraries

## ✅ Pre-PR Checks

```bash
npx tsc --noEmit && npm run lint
# Visual test in browser
```

---

**Related**: [Admin Dashboard](../app/admin/AGENTS.md) | [API Routes](../app/api/AGENTS.md) | [Root](../AGENTS.md)
