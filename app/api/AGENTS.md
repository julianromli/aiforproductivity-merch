# AGENTS.md - API Routes

## 📦 Package Identity
Next.js 15 API routes (REST endpoints). Split into public routes (`/api/*`) and protected admin routes (`/api/admin/*`). Middleware handles auth for admin routes.

**Tech**: Next.js 15 Route Handlers, Supabase (PostgreSQL), Vercel Blob (storage)

## ⚡ Setup & Run

```bash
# API runs with dev server
npm run dev          # APIs at http://localhost:3000/api/*

# Type check
npx tsc --noEmit

# Test endpoints
curl http://localhost:3000/api/products
curl http://localhost:3000/api/categories
```

## 📐 Patterns & Conventions

### File Organization
```
app/api/
├── products/               # Public product endpoints
│   ├── route.ts            # GET /api/products (list)
│   └── [id]/route.ts       # GET /api/products/:id (single)
├── categories/route.ts     # GET /api/categories
├── settings/               # Public settings (logo, theme)
│   ├── logo/route.ts
│   └── site-name/route.ts
├── generate-image/route.ts       # AI image generation
└── admin/                  # Protected admin endpoints
    ├── products/
    │   ├── route.ts        # GET, POST /api/admin/products
    │   └── [id]/
    │       ├── route.ts    # GET, PUT, DELETE /api/admin/products/:id
    │       └── colors/     # Color variant endpoints
    ├── settings/route.ts   # Site settings CRUD
    └── upload/logo/route.ts # Logo upload to Vercel Blob
```

### Route Handler Pattern

**✅ DO**: Follow this structure (example: `app/api/admin/products/route.ts`)
```tsx
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .range((page - 1) * 10, page * 10 - 1)
    
    if (error) {
      console.error("[v0] Error:", error)
      return NextResponse.json(
        { error: "Failed to fetch", details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ products: data })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // ... validation, insertion
    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    // ... error handling
  }
}
```

**✅ DO**: Use Supabase service role key for admin routes
```tsx
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Bypasses RLS
)
```

**✅ DO**: Use Supabase anon key for public routes
```tsx
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Respects RLS
)
```

**❌ DON'T**: Write raw SQL queries
```tsx
// ❌ Bad
const { data } = await supabase.rpc("execute_sql", { query: "SELECT * FROM products" })

// ✅ Good - Use Supabase MCP tools for schema changes
// ✅ Good - Use query builder in code
const { data } = await supabase.from("products").select("*")
```

### Error Handling Pattern

**✅ DO**: Always catch errors and return proper HTTP status
```tsx
try {
  // ... operation
} catch (error) {
  console.error("[v0] Error context:", error)
  return NextResponse.json(
    { error: "User-friendly message", details: error.message },
    { status: 500 }
  )
}
```

### Query Parameters Pattern

**✅ DO**: Use searchParams for filtering, pagination, sorting
```tsx
const { searchParams } = new URL(request.url)
const page = parseInt(searchParams.get("page") || "1")
const search = searchParams.get("search") || ""
const category = searchParams.get("category") || ""
```

### Upload Pattern (Vercel Blob)

**✅ DO**: Follow upload route pattern (example: `app/api/admin/upload/logo/route.ts`)
```tsx
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File
  
  // Validate file
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 2MB" }, { status: 400 })
  }
  
  // Upload to Vercel Blob
  const blob = await put(`logos/${Date.now()}-${file.name}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
  
  return NextResponse.json({ url: blob.url })
}
```

## 🔗 Touch Points / Key Files

- **Product routes**: `app/api/admin/products/route.ts` (CRUD pattern)
- **Settings routes**: `app/api/admin/settings/route.ts` (JSONB pattern)
- **Upload route**: `app/api/admin/upload/logo/route.ts` (Vercel Blob)
- **Public settings**: `app/api/settings/logo/route.ts` (no auth)
- **AI generation**: `app/api/generate-image/route.ts` (Gemini integration)

## 🔍 JIT Index Hints

```bash
# Find all route handlers
rg -n "export async function (GET|POST|PUT|DELETE)" app/api/

# Find admin routes
rg -n "export async function" app/api/admin/

# Find public routes
rg -n "export async function" app/api/ --glob "!admin/**"

# Find Supabase queries
rg -n "supabase.from" app/api/

# Find error handling
rg -n "catch.*error" app/api/
```

## ⚠️ Common Gotchas

- **Auth**: `/api/admin/*` routes protected by middleware - don't check auth manually
- **Service role key**: Required for admin routes to bypass RLS policies
- **CORS**: Next.js handles CORS by default - don't add headers manually
- **Logging prefix**: Use `[v0]` prefix for consistent log filtering
- **Error responses**: Always return JSON with `error` field for consistency
- **File uploads**: Vercel Blob requires `BLOB_READ_WRITE_TOKEN` env var

## ✅ Pre-PR Checks

```bash
npx tsc --noEmit && npm run lint
# Test endpoints with curl or Postman
```

---

**Related**: [Admin Dashboard](../admin/AGENTS.md) | [Lib Services](../../lib/AGENTS.md) | [Root](../../AGENTS.md)
