# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AI-powered merchandise storefront with BytePlus SeeDream v4.5 integration for generating product mockups. Built with Next.js 15, TypeScript, Supabase, and shadcn/ui.

**Key Features:**
- AI image generation (Virtual Try-On powered by BytePlus)
- Admin dashboard with Supabase authentication
- Product catalog with categories and AI prompts
- Vercel Blob storage for uploads
- shadcn/ui component system (New York style)
- **Image preview with zoom functionality** (custom implementation, no external deps)

---

## 🚀 Common Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
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
- **Framework:** Next.js 15.5.4 (App Router, latest)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui (New York style)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Vercel Blob
- **AI Model:** BytePlus SeeDream v4.5 REST API
- **Auth:** Supabase Authentication
- **Package Manager:** npm

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
│   └── generate-model-image/ # AI image generation endpoints
├── globals.css         # Tailwind + CSS variables
├── layout.tsx          # Root layout
└── page.tsx            # Homepage (storefront)

components/
├── ui/                 # shadcn components (atomic)
├── image-with-loading.tsx  # Image component with loading state
├── image-preview-dialog.tsx  # Full-screen image preview with zoom
└── [feature]/          # Feature-specific components

lib/
├── byteplus-client.ts  # BytePlus REST API client
├── supabase-client.ts  # Client-side Supabase
├── supabase-server.ts  # Server-side Supabase
├── supabase.ts         # Utilities
├── types.ts            # TypeScript types
└── utils.ts            # Utility functions (cn, etc.)

middleware.ts           # Route protection for /admin
```

### Key Concepts

#### 1. AI Image Generation (BytePlus SeeDream v4.5)
**Virtual Try-On:**
- Combines user photo + product image + optimized prompt.
- High resolution output: 2048x2560.

**Implementation:** `/app/api/generate-model-image/route.ts`
- Uses native `fetch` to BytePlus REST API (no SDK needed).
- Model: `seedream-4.5`.
- Supports PNG, JPEG, WebP.
- Returns base64 data URL.

**Environment Variable Required:**
```bash
BYTEPLUS_API_KEY=your_byteplus_api_key
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
- `/api/generate-model-image` - AI image generation (public)

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
- Log everything with `[v0]` or `[BytePlus]` prefix for debugging
- Handle errors gracefully (API failures, format issues)
- Consider rate limits (BytePlus Ark Console)

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
- [ ] Never expose `BYTEPLUS_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client code
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

**1. "BYTEPLUS_API_KEY is not configured"**
- Add `BYTEPLUS_API_KEY` to Vercel environment variables
- Restart dev server after adding `.env.local`

**2. "Unauthorized" on admin routes**
- Check Supabase credentials in environment variables
- Verify user exists in Supabase Auth
- Check middleware logs: `[v0] Supabase not configured`

**3. Image generation fails**
- Check console logs with `[BytePlus]` prefix
- Verify API key is valid
- Check rate limits (BytePlus Ark Console)
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
All logs use `[v0]` or `[BytePlus]` prefix for easy filtering:
```typescript
console.log('[BytePlus] Starting operation...')
console.error('[v0] Error details:', error)
```

Check Vercel deployment logs for production issues.

---

## 📚 Important Files

### Must-Read Documentation
- `ARCHITECTURE.md` - Detailed technical architecture
- `DOKUMENTASI_AI.md` - AI integration guide (Indonesian)
- `ADMIN_AUTH_SETUP.md` - Authentication setup guide
- `SETUP_SUPABASE.md` - Database setup instructions
- `docs/ADMIN_USER_GUIDE.md` - **User guide for non-programmers (Indonesian)** 📖

### Configuration Files
- `components.json` - shadcn/ui config (New York style)
- `middleware.ts` - Route protection logic
- `tsconfig.json` - TypeScript config with path aliases
- `next.config.mjs` - Next.js configuration

### Entry Points
- `app/page.tsx` - Public storefront
- `app/admin/page.tsx` - Admin dashboard
- `app/api/generate-model-image/route.ts` - AI generation endpoint

---

## 🔄 Deployment

**Platform:** Vercel

**Environment Variables Required:**
```bash
# BytePlus AI
BYTEPLUS_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=
```

### Vercel Blob Configuration

**Current Store:**
- **Store ID:** `pRqUg3o7zo4QIMJt`
- **Base URL:** `https://prqug3o7zo4qimjt.public.blob.vercel-storage.com`
- **Token:** `vercel_blob_rw_pRqUg3o7zo4QIMJt_DmfwPwUamyDtBzKNxLsbQHltgRsddK`
- **Access Level:** Read & Write (public)

**Upload Configuration:**
- **Path Pattern:** `products/{timestamp}-{random}.{extension}`
- **Allowed Formats:** JPEG, JPG, PNG, WebP, GIF
- **Max File Size:** 5MB
- **Implementation:** `app/api/admin/upload/route.ts`

**Store Management:**
- Dashboard: https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s/stores
- Previous store ID: `OJhCKzxtQCOMYf8Z` (deprecated)
- **Last Updated:** 2025-10-09

**Pre-Deployment Checklist:**
- [ ] All environment variables set in Vercel
- [ ] Database migrations run in Supabase
- [ ] Admin user created in Supabase Auth
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)

**Post-Deployment:**
- Test admin login at `/admin/login`
- Verify AI generation at `/api/generate-model-image`
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
1. **Check logs** with `[v0]` or `[BytePlus]` prefix first
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
- **BytePlus Ark Docs:** https://docs.byteplus.com/en/docs/ModelArk/1666945
- **Tailwind CSS v4:** https://tailwindcss.com/docs

---

**Last Updated:** 2025-12-18  
**Next.js Version:** 15.5.4 (upgraded 2025-01-30)  
**Package Manager:** npm

**Latest Feature:** BytePlus SeeDream v4.5 Migration (2025-12-18)

---

#### 6. Image Preview Feature
**Custom zoom implementation (no external dependencies):**
- Full-screen modal preview for product images
- Zoom controls: buttons (0.5x - 4x) + mouse wheel
- Pan/drag when zoomed (desktop & mobile)
- Touch gestures support (mobile-friendly)
- Keyboard accessible (ESC to close)
- Works for both product images AND generated images

**Component:** `components/image-preview-dialog.tsx`

**Features:**
```typescript
// Zoom controls
- Zoom In/Out buttons (±0.5x increments)
- Mouse wheel zoom (0.1x increments)
- Reset button (back to 100%)
- Real-time percentage display

// Pan/Drag (when zoomed > 100%)
- Mouse drag on desktop
- Touch drag on mobile
- Cursor changes (grab/grabbing)

// UI/UX
- Dark backdrop with blur effect
- Smooth animations
- Dynamic instructions text
- Search icon overlay on hover
```

**Integration Pattern:**
```typescript
// State management
const [selectedImage, setSelectedImage] = useState<{
  src: string
  alt: string
} | null>(null)

// Click handler on product images
<div onClick={() => setSelectedImage({ src, alt })}>
  <ImageWithLoading src={src} alt={alt} />
</div>

// Render dialog
<ImagePreviewDialog
  isOpen={!!selectedImage}
  onClose={() => setSelectedImage(null)}
  imageSrc={selectedImage?.src || ""}
  imageAlt={selectedImage?.alt || ""}
/>
```

**Benefits:**
- ✅ Zero external dependencies (pure React + CSS)
- ✅ Lightweight (~200 lines, no bundle bloat)
- ✅ Smooth performance (CSS transforms)
- ✅ Mobile-friendly (touch support)
- ✅ Accessible (ARIA labels, keyboard nav)

---

#### 7. Multi-color Product Variants
**Support for multiple color options per product:**
- Each product can have multiple color variants (Black, White, etc.)
- Each color has its own product image
- Admin can manage colors via dashboard (add, edit, delete)
- Users can select colors on storefront with visual selector
- AI generation uses selected color for virtual try-on

**Database Schema:** `product_colors` table
```sql
CREATE TABLE product_colors (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  color_name VARCHAR(50),     -- "Black", "White"
  color_hex VARCHAR(7),        -- "#000000", "#FFFFFF"
  image_url VARCHAR(500),      -- Color-specific product image
  is_default BOOLEAN,          -- Default color on page load
  sort_order INTEGER
);
```

**API Endpoints:**
```typescript
// Public
GET /api/products           // Returns products with colors array

// Admin
GET    /api/admin/products/[id]/colors           // List colors
POST   /api/admin/products/[id]/colors           // Add color
PUT    /api/admin/products/[id]/colors/[colorId] // Update color
DELETE /api/admin/products/[id]/colors/[colorId] // Delete color
```

**Admin UI:**
- `components/admin/color-variant-list.tsx` - Color management list
- `components/admin/color-variant-form.tsx` - Add/Edit color dialog
- Integrated in product edit form (edit mode only)
- Image upload per color variant
- Set default color, prevent deleting last color

**Storefront:**
- Circular color selector buttons (8x8px, hex background)
- Border highlight on selected color (ring-2 ring-primary)
- Automatic image switch when color selected
- Default color pre-selected on page load
- Only shows selector if product has 2+ colors

**AI Integration:**
- Frontend sends colorName with generation request
- Backend uses selected color's image_url
- Prompt enhanced with color information
- Example: "IMPORTANT: The T-shirt must be specifically in white color..."

**Color Constants:** `lib/color-constants.ts`
```typescript
export const COLOR_MAP = {
  Black: '#000000',
  White: '#FFFFFF',
} as const
```

**Migration:**
- `scripts/06-add-product-colors-table.sql` - Create table, indexes, RLS, trigger
- `scripts/07-migrate-existing-products-colors.sql` - Auto-create Black variant for existing products

**Benefits:**
- ✅ Multiple color options per product without duplicate products
- ✅ Color-specific product images
- ✅ Seamless AI generation with selected color
- ✅ Easy to extend (add more colors by editing COLOR_MAP)
- ✅ Fully integrated: Database ↔ Admin ↔ Storefront ↔ AI
