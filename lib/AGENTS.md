# AGENTS.md - Lib (Services & Utilities)

## 📦 Package Identity
Reusable utilities, services, and helpers. Includes Supabase clients, settings service, theme generator, and type definitions.

**Tech**: TypeScript 5, Supabase SSR, Zod validation

## ⚡ Setup & Run

```bash
# No separate setup - imported by other modules

# Type check
npx tsc --noEmit
```

## 📐 Patterns & Conventions

### File Organization
```
lib/
├── supabase-server.ts      # Server-side Supabase client (SSR)
├── supabase-client.ts      # Client-side Supabase client
├── supabase.ts             # Generic Supabase client helper
├── settings-service.ts     # Site settings CRUD service
├── theme-generator.ts      # Dynamic CSS theme generator
├── env-validator.ts        # Environment variable validation
├── utils.ts                # cn helper, formatters
├── types.ts                # Shared type definitions
├── color-constants.ts      # Color variant constants
└── hooks/                  # Custom React hooks
    └── use-toast.ts
```

### Supabase Client Pattern

**✅ DO**: Use Server client for Server Components and API routes
```tsx
// lib/supabase-server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Usage in Server Component
import { createClient } from "@/lib/supabase-server"

const supabase = await createClient()
const { data } = await supabase.from("products").select("*")
```

**✅ DO**: Use Client client for Client Components
```tsx
// lib/supabase-client.ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Usage in Client Component
"use client"
import { createClient } from "@/lib/supabase-client"

const supabase = createClient()
```

**✅ DO**: Use service role key for admin API routes (bypasses RLS)
```tsx
// app/api/admin/*/route.ts
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Admin privileges
)
```

### Service Pattern

**✅ DO**: Follow settings service pattern for reusable CRUD
- Example: `lib/settings-service.ts`
- Centralized database operations
- Type-safe return values
- Error handling

```tsx
// lib/settings-service.ts
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getSetting(key: string) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()  // Graceful handling of missing rows
  
  if (error) throw error
  return data?.value
}

export async function updateSetting(key: string, value: any) {
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ key, value })
  
  if (error) throw error
  return data
}
```

### Utils Pattern

**✅ DO**: Use `cn()` for conditional Tailwind classes
```tsx
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn("base-class", isActive && "active-class")} />
```

**✅ DO**: Add utility functions to `lib/utils.ts`
```tsx
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-")
}
```

### Type Definitions Pattern

**✅ DO**: Define shared types in `lib/types.ts`
```tsx
// lib/types.ts
export interface Product {
  id: string
  name: string
  price: number
  category: string
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
}
```

## 🔗 Touch Points / Key Files

- **Supabase clients**: `lib/supabase-*.ts` (SSR pattern)
- **Settings service**: `lib/settings-service.ts` (reusable CRUD)
- **Theme generator**: `lib/theme-generator.ts` (dynamic CSS)
- **Utils**: `lib/utils.ts` (cn helper, formatters)
- **Types**: `lib/types.ts` (shared interfaces)
- **Environment**: `lib/env-validator.ts` (Zod validation)

## 🔍 JIT Index Hints

```bash
# Find all exports
rg -n "export (function|const|interface|type)" lib/

# Find Supabase usage
rg -n "supabase" lib/

# Find utility functions
rg -n "export function" lib/utils.ts

# Find type definitions
rg -n "export (interface|type)" lib/types.ts
```

## ⚠️ Common Gotchas

- **SSR vs Client**: Use correct Supabase client based on context
- **Service role key**: Only use in API routes, never expose to client
- **NEXT_PUBLIC prefix**: Required for client-side env vars
- **maybeSingle()**: Use instead of single() for graceful handling of missing rows
- **Type safety**: Always define return types for public functions
- **Error handling**: Throw errors in services, catch in API routes/components

## ✅ Pre-PR Checks

```bash
npx tsc --noEmit && npm run lint
# Test imports in dependent modules
```

---

**Related**: [API Routes](../app/api/AGENTS.md) | [Components](../components/AGENTS.md) | [Root](../AGENTS.md)
