# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AI-powered merchandise storefront with Google Gemini integration for generating product mockups. Built with Next.js 15, TypeScript, Supabase, and shadcn/ui.

**Key Features:**
- AI image generation (text-to-image & model-based combining 2 images)
- Admin dashboard with Supabase authentication
- Product catalog with categories and AI prompts
- Vercel Blob storage for uploads
- shadcn/ui component system (New York style)

---

## 🚀 Common Commands

### Development
```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Type Checking
```bash
# Check TypeScript errors
npx tsc --noEmit
```

### Database Operations
Supabase SQL scripts are in `/scripts`:
1. `01-create-tables.sql` - Create database schema
2. `02-seed-categories.sql` - Seed initial categories
3. `03-migrate-products.sql` - Migrate product data
4. `04-seed-default-prompts.sql` - Seed AI prompts

Run these in Supabase Dashboard → SQL Editor in order.

---

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui (New York style)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Vercel Blob
- **AI Model:** Google Gemini 2.5 Flash Image Preview
- **Auth:** Supabase Authentication
- **Package Manager:** pnpm

### Directory Structure
```
app/
├── (auth)/              # Route groups (if needed)
├── admin/               # Admin dashboard (protected)
│   ├── login/          # Auth login page
│   ├── products/       # Product CRUD
│   ├── prompts/        # AI prompt management
│   └── layout.tsx      # Admin layout with auth
├── api/
│   ├── admin/          # Protected admin API routes
│   ├── categories/     # Public category API
│   └── generate-image/ # AI image generation endpoints
├── globals.css         # Tailwind + CSS variables
├── layout.tsx          # Root layout
└── page.tsx            # Homepage (storefront)

components/
├── ui/                 # shadcn components (atomic)
└── [feature]/          # Feature-specific components

lib/
├── supabase-client.ts  # Client-side Supabase
├── supabase-server.ts  # Server-side Supabase
├── supabase.ts         # Utilities
├── types.ts            # TypeScript types
└── utils.ts            # Utility functions (cn, etc.)

middleware.ts           # Route protection for /admin
```

### Key Concepts

#### 1. AI Image Generation (Google Gemini)
**Two modes:**
- **Text-to-Image:** Generate from description only
- **Model-Based:** Combine 2 reference images + prompt

**Implementation:** `/app/api/generate-image/route.ts`
- Uses `@google/generative-ai` package (NOT Vercel AI SDK)
- Model: `gemini-2.5-flash-image-preview`
- Supports PNG, JPEG, WebP (auto-converts others)
- Returns base64 data URL

**Environment Variable Required:**
```bash
GEMINI_API_KEY=your_google_ai_key
```

#### 2. Authentication & Authorization
**Supabase Auth protects all `/admin` routes via middleware:**
- `/admin/login` - Public login page
- `/admin/*` - Protected (requires auth)
- `/api/admin/*` - Protected API routes

**Files:**
- `middleware.ts` - Route protection & session refresh
- `lib/supabase-server.ts` - Server-side auth client
- `lib/supabase-client.ts` - Client-side auth client

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 3. Database Schema (Supabase)
**Products Table:**
- `id`, `name`, `price`, `currency`, `category`
- `description`, `image_url`, `is_active`, `sort_order`
- Foreign key to `ai_prompts`

**AI Prompts Table:**
- Linked to products (1-to-many)
- `prompt_template` - Template for AI generation
- `is_default` - Default prompt flag

**Categories Table:**
- Predefined categories for products
- `prompt_instructions` - Category-specific AI guidance

**RLS (Row Level Security):**
- Public: Read-only access to active products
- Admin: Full CRUD via service role key

#### 4. Component System
**shadcn/ui Configuration:**
- Style: `new-york`
- Base Color: `neutral`
- CSS Variables: Enabled (`app/globals.css`)
- Icon Library: `lucide-react`

**Path Aliases (`tsconfig.json`):**
```typescript
@/*           // Root directory
@/components  // components/
@/lib         // lib/
@/hooks       // hooks/
```

**ALWAYS use MCP tools for shadcn components:**
- `list_items_in_registries` - Browse available components
- `get_add_command_for_items` - Get install command
- `view_items_in_registries` - View component details
- `get_item_examples_from_registries` - See usage examples

#### 5. API Routes Pattern
**Admin APIs (`/api/admin/`):**
- Protected by middleware (requires auth)
- Use service role key for database operations
- Return JSON with proper error handling

**Public APIs:**
- `/api/categories` - List all categories
- `/api/generate-image` - AI image generation (public)

**Error Response Pattern:**
```typescript
return NextResponse.json(
  { error: "Error message" },
  { status: 400 }
)
```

---

## 🔧 Development Guidelines

### TypeScript Best Practices
- **NO `any` types** - Always use explicit types
- **Use interfaces** from `lib/types.ts` for database models
- Import types: `import type { Product } from '@/lib/types'`
- Server components: Mark async functions properly

### Component Development
1. **Check existing components first** (use MCP tools)
2. **Prefer shadcn/ui over custom components**
3. Use `'use client'` directive ONLY when:
   - Using React hooks (useState, useEffect)
   - Browser APIs (window, localStorage)
   - Event handlers (onClick, onChange)
4. **Default to Server Components** for data fetching

### Styling Standards
- **Use CSS variables** from `globals.css`:
  ```css
  --background, --foreground, --primary, --muted, etc.
  ```
- **Tailwind utility classes** with `cn()` helper:
  ```typescript
  import { cn } from '@/lib/utils'
  <div className={cn("base-classes", conditional && "extra")} />
  ```
- **Responsive design:** Mobile-first approach
- **Dark mode:** Automatic via `next-themes`

### AI Integration
**When modifying AI features:**
- Check `DOKUMENTASI_AI.md` for API details
- Log everything with `[v0]` prefix for debugging
- Handle errors gracefully (API failures, format issues)
- Consider rate limits (free tier: 15 req/min)

**Prompt Engineering Tips:**
- Be specific (colors, style, lighting)
- Include context ("product photography", "studio lighting")
- English prompts work best

### Database Operations
**Query Pattern:**
```typescript
import { createClient } from '@/lib/supabase-server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)

if (error) throw error
```

**Always:**
- Use service role key for admin operations
- Handle errors with try-catch
- Validate input before database calls
- Use RLS policies for security

### Security Checklist
- [ ] Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client code
- [ ] Validate all user inputs (FormData, query params)
- [ ] Use middleware for route protection
- [ ] Sanitize file uploads (check mime types)
- [ ] Rate limit AI endpoints if needed

---

## 📝 Code Patterns

### Server Component with Data Fetching
```typescript
// app/products/page.tsx
import { createClient } from '@/lib/supabase-server'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  
  return <ProductList products={products} />
}
```

### API Route with Auth Check
```typescript
// app/api/admin/products/route.ts
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Admin logic here
}
```

### Client Component with Form
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ProductForm() {
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Submit logic
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 🐛 Debugging

### Common Issues

**1. "GEMINI_API_KEY is not configured"**
- Add `GEMINI_API_KEY` to Vercel environment variables
- Restart dev server after adding `.env.local`

**2. "Unauthorized" on admin routes**
- Check Supabase credentials in environment variables
- Verify user exists in Supabase Auth
- Check middleware logs: `[v0] Supabase not configured`

**3. Image generation fails**
- Check console logs with `[v0]` prefix
- Verify API key is valid
- Check rate limits (15 req/min on free tier)
- Ensure image formats are supported (PNG, JPEG, WebP)

**4. Database queries fail**
- Check RLS policies in Supabase
- Use service role key for admin operations
- Verify table schemas match `lib/types.ts`

**5. "useSearchParams() should be wrapped in a suspense boundary"**
- **FIXED:** All `useSearchParams()` calls must be wrapped with `<Suspense>`
- Pattern: Create separate component for search params handling
- Example in `app/client-layout.tsx`:
  ```typescript
  function SearchParamsHandler() {
    const searchParams = useSearchParams()
    return null
  }
  
  // In parent component:
  <Suspense fallback={null}>
    <SearchParamsHandler />
  </Suspense>
  ```

### Logging Strategy
All logs use `[v0]` prefix for easy filtering:
```typescript
console.log('[v0] Starting operation...')
console.error('[v0] Error details:', error)
```

Check Vercel deployment logs for production issues.

---

## 📚 Important Files

### Must-Read Documentation
- `ARCHITECTURE.md` - Detailed technical architecture (Spanish)
- `DOKUMENTASI_AI.md` - AI integration guide (Indonesian)
- `ADMIN_AUTH_SETUP.md` - Authentication setup guide
- `SETUP_SUPABASE.md` - Database setup instructions

### Configuration Files
- `components.json` - shadcn/ui config (New York style)
- `middleware.ts` - Route protection logic
- `tsconfig.json` - TypeScript config with path aliases
- `next.config.mjs` - Next.js configuration

### Entry Points
- `app/page.tsx` - Public storefront
- `app/admin/page.tsx` - Admin dashboard
- `app/api/generate-image/route.ts` - AI generation endpoint

---

## 🔄 Deployment

**Platform:** Vercel

**Environment Variables Required:**
```bash
# Google AI
GEMINI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vercel Blob (auto-configured)
BLOB_READ_WRITE_TOKEN=
```

**Pre-Deployment Checklist:**
- [ ] All environment variables set in Vercel
- [ ] Database migrations run in Supabase
- [ ] Admin user created in Supabase Auth
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Build succeeds (`pnpm build`)

**Post-Deployment:**
- Test admin login at `/admin/login`
- Verify AI generation at `/api/generate-image`
- Check Supabase connection
- Monitor Vercel logs for errors

---

## 🎯 Agent Behavior

### When Adding Features
1. **Check existing patterns** in codebase first
2. **Use shadcn/ui components** via MCP tools
3. **Follow TypeScript standards** (no `any` types)
4. **Default to Server Components** unless interactivity needed
5. **Update types** in `lib/types.ts` if adding database fields

### When Debugging
1. **Check logs** with `[v0]` prefix first
2. **Verify environment variables** are set
3. **Test API routes** with curl/Postman before blaming frontend
4. **Check Supabase RLS policies** if database queries fail

### When Suggesting Code
- Provide **complete, working examples** (no `// ... rest of code`)
- Include **proper TypeScript types**
- Follow **existing code patterns** in the project
- Mention **security implications** if relevant

---

## 📖 External Resources

- **Next.js 15 Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Google Gemini API:** https://ai.google.dev/gemini-api/docs
- **Tailwind CSS v4:** https://tailwindcss.com/docs

---

**Last Updated:** 2025-01-30  
**Next.js Version:** 15.2.4  
**Package Manager:** pnpm