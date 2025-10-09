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
- **Image preview with zoom functionality** (custom implementation, no external deps)

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
- **Framework:** Next.js 15.5.4 (App Router, latest)
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
├── image-with-loading.tsx  # Image component with loading state
├── image-preview-dialog.tsx  # Full-screen image preview with zoom
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
- `docs/ADMIN_USER_GUIDE.md` - **User guide for non-programmers (Indonesian)** 📖

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

**Last Updated:** 2025-10-06  
**Next.js Version:** 15.5.4 (upgraded 2025-01-30)  
**Package Manager:** pnpm

**Latest Feature:** Multi-color Product Variants (2025-10-06)

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

---

## 📝 Recent Changes

### 2025-10-06: Multi-color Product Variants (Black & White)
- ✅ **Full-stack implementation of product color variants**
- ✅ **Database layer:**
  - New table: `product_colors` with proper indexes, RLS policies, and auto-update trigger
  - Migration scripts: 06 (create table), 07 (migrate existing products to Black default)
  - Verified: 5 products automatically migrated with default Black color
  - Foreign key constraint with CASCADE delete
- ✅ **Backend APIs:**
  - Public: `GET /api/products` now includes `colors` array with proper ordering
  - Admin CRUD: 4 new endpoints for color management
    - `GET /POST /api/admin/products/[id]/colors`
    - `PUT /DELETE /api/admin/products/[id]/colors/[colorId]`
  - Smart default handling (auto-set next color if deleting default)
  - Prevents deletion of last color variant
  - Auto-increment sort_order
- ✅ **Admin UI components:**
  - `color-variant-list.tsx` - Visual color list with edit/delete actions
  - `color-variant-form.tsx` - Dialog with color selector, image upload, default toggle
  - Integrated into `product-form.tsx` (edit mode only)
  - Uses existing image upload API (`/api/admin/upload`)
  - Toast notifications for success/error feedback
- ✅ **Storefront enhancements:**
  - Circular color selector buttons (8x8 rounded-full with hex background)
  - Border highlight + ring effect on selected color
  - Automatic image switching based on selected color
  - State management: `selectedColors` Record<productId, colorId>
  - Default colors pre-selected on page load (is_default flag)
  - Selector only visible if product has 2+ colors
- ✅ **AI Integration:**
  - Modified `runProductGeneration` to use selected color's image_url
  - Added `colorName` field to FormData sent to `/api/generate-model-image`
  - Backend enhances prompt with color information
  - Example: "IMPORTANT: The T-shirt must be specifically in white color..."
  - Fallback images also respect selected color
- ✅ **TypeScript types:**
  - New interface: `ProductColor` in `lib/types.ts`
  - Extended `Product` interface with optional `colors` array
  - Color constants: `COLOR_MAP` in `lib/color-constants.ts`
- ✅ **Files created (8):**
  - `scripts/06-add-product-colors-table.sql`
  - `scripts/07-migrate-existing-products-colors.sql`
  - `app/api/admin/products/[id]/colors/route.ts`
  - `app/api/admin/products/[id]/colors/[colorId]/route.ts`
  - `lib/color-constants.ts`
  - `components/admin/color-variant-form.tsx`
  - `components/admin/color-variant-list.tsx`
- ✅ **Files modified (5):**
  - `lib/types.ts` - Added ProductColor interface
  - `app/api/products/route.ts` - Include colors in response
  - `components/admin/product-form.tsx` - Embedded color management
  - `app/page.tsx` - Color selector UI + state management
  - `app/api/generate-model-image/route.ts` - Color-aware prompts
  - `WARP.md` - Documentation update
- ✅ **Zero TypeScript errors** - Build verified successful
- ✅ **Future extensibility:**
  - Add more colors by editing `COLOR_MAP` constant
  - No code changes needed for existing functionality
  - Database-driven, admin-managed

### 2025-02-05: Dynamic Categories Integration (Database → Backend → Frontend)
- ✅ **Standardized product categories to 4 general merchandise types**
- ✅ **Database migration:**
  - Replaced old categories (MEN'S HOODIE, MEN'S PANTS, RUNNING SHOES, ACCESSORIES)
  - New categories: **Apparel, Accessories, Stationery, Other**
  - Migration: `update_categories_to_general_merch` via Supabase MCP
  - AI prompt instructions updated per category for better image generation
- ✅ **Backend integration:**
  - Existing `/api/categories` API already functional (no changes needed)
  - Returns categories ordered alphabetically
  - Public endpoint (no auth required)
- ✅ **Frontend updates:**
  - `components/admin/product-form.tsx`: 
    - Added `useEffect` to fetch categories from API
    - Dynamic dropdown population (no hardcoded values)
    - Loading state during fetch
    - Error handling with toast notifications
  - `app/admin/products/page.tsx`:
    - Added categories state & fetch function
    - Dynamic category filter dropdown
    - Both form and filter now use same API source
  - `components/admin/products-preview.tsx`: Already dynamic (receives categories as props)
- ✅ **Benefits:**
  - ✨ **Single source of truth:** Categories managed in database only
  - ✨ **Zero hardcoded values:** Easy to add/modify categories without code changes
  - ✨ **Consistent UX:** All dropdowns show same categories
  - ✨ **Future-proof:** Admin can manage categories via database directly
- ✅ Files modified:
  - Database: `categories` table (via migration)
  - `components/admin/product-form.tsx` - Dynamic category fetch
  - `app/admin/products/page.tsx` - Dynamic category filter
  - `WARP.md` - Documentation update
- ✅ Zero TypeScript errors
- ✅ Full integration verified: Database ↔ API ↔ Frontend
- ✅ Categories API tested: `GET /api/categories` returns 4 categories successfully

### 2025-02-05: Products Preview with Quick Edit on Dashboard
- ✅ **Added products preview section to admin dashboard**
- ✅ **ProductsPreview component** (`components/admin/products-preview.tsx`):
  - Client component with interactive edit functionality
  - Displays 6 recent products in responsive grid (2 cols mobile, 3 cols desktop)
  - Product cards with image (AspectRatio 4:5), name, price, category, status badge
  - Quick Edit button per product
  - Empty state with call-to-action link
  - "View All" button linking to full products page
- ✅ **Quick Edit Dialog:**
  - Essential fields: name, price, currency, category, image_url, is_active
  - Form validation (required fields, price > 0)
  - Switch component for active/inactive toggle
  - Dynamic currency handling (IDR with step="1", USD/EUR with step="0.01")
  - Loading states during update
  - Success/error toast notifications
  - Uses existing PUT /api/admin/products/[id] endpoint
- ✅ **Dashboard Integration:**
  - Server component fetches recent products (limit 6) and categories
  - ProductsPreview positioned between chart and quick actions
  - Preserves existing dashboard features (stats cards, chart)
  - No-cache strategy for always fresh data
- ✅ **New Components Installed:**
  - `components/ui/switch.tsx` - Toggle switch (shadcn)
  - `components/ui/toaster.tsx` - Toast notifications renderer
  - Toaster added to admin layout for global toast support
- ✅ **UX Improvements:**
  - Direct product editing from dashboard (no page navigation)
  - Fast access to recent products for admin
  - Mobile-friendly responsive design
  - Proper loading & error states
  - Visual feedback via toasts
- ✅ Files modified:
  - `app/admin/page.tsx` - Server component with data fetching
  - `app/admin/layout.tsx` - Added Toaster component
  - `components/admin/products-preview.tsx` - New component
  - `components/ui/switch.tsx` - New shadcn component
  - `components/ui/toaster.tsx` - New toast renderer
- ✅ Zero TypeScript errors, build successful
- ✅ All existing features preserved
- ✅ Ready for Playwright testing

### 2025-02-05: Admin Dashboard UI Upgrade (shadcn dashboard-01)
- ✅ **Upgraded admin dashboard with shadcn dashboard-01 block components**
- ✅ **Installed components via shadcn CLI:**
  - Interactive chart components (recharts integration)
  - Advanced UI components: sidebar, drawer, tabs, toggle-group
  - Supporting components: avatar, breadcrumb, skeleton, sonner
  - Total: 26 new component files
- ✅ **Enhanced stats cards:**
  - Gradient backgrounds (`from-primary/5 to-card`)
  - Badge indicators with trend icons (IconTrendingUp)
  - CardAction, CardDescription, CardFooter for richer content
  - Responsive container queries (`@container/card`)
  - Better visual hierarchy with proper spacing
- ✅ **Added ChartAreaInteractive component:**
  - Interactive area chart with time range filters (7d, 30d, 90d)
  - Desktop/mobile responsive toggle buttons
  - Real-time data visualization placeholder
  - Built-in chart tooltip & legend
- ✅ **Icon library transition:**
  - Switched from lucide-react to @tabler/icons-react for consistency
  - Icons used: IconPackage, IconMessages, IconSparkles, IconTrendingUp
- ✅ **Dashboard data structure:**
  - Full dashboard-01 example installed at `app/dashboard/`
  - Includes sample data table with drag-and-drop sorting
  - Sidebar navigation components (nav-main, nav-documents, nav-secondary)
  - Can be used as reference for future admin features
- ✅ **Preserved existing admin layout:**
  - Did NOT replace existing sidebar/header (kept current admin layout)
  - Only integrated chart & enhanced cards into dashboard page content
  - Maintains authentication & navigation structure
- ✅ Files modified:
  - `app/admin/page.tsx` - Dashboard page with new components
  - `app/globals.css` - Updated CSS variables for chart theming
  - `package.json`, `pnpm-lock.yaml` - New dependencies
- ✅ New components:
  - `components/chart-area-interactive.tsx` - Interactive chart
  - `components/ui/chart.tsx` - Chart container & config
  - `components/ui/tabs.tsx`, `toggle-group.tsx`, etc.
  - `hooks/use-mobile.ts` - Mobile detection hook
- ✅ Zero TypeScript errors, build successful
- ✅ Ready for future data integration (replace static data with real DB queries)

### 2025-02-05: SEO Metadata Optimization & Documentation Updates
- ✅ **Fixed metadata in `app/layout.tsx` for proper SEO:**
  - Title: "AI For Productivity Merchandise - Official Merch Store" (was: "v0 App")
  - Description: Compelling, keyword-rich description (was: "Created with v0")
  - Added keywords array: "AI for productivity", "productivity merchandise", etc.
  - Open Graph tags for Facebook/LinkedIn sharing
  - Twitter Card metadata for proper social media previews
  - Robots directives for search engine indexing
  - Author/creator metadata linking to https://aiforproductivity.id
  - Indonesian locale (id_ID) for regional optimization
- ✅ **Documentation updates:**
  - README.md: Complete rewrite with proper branding, features, tech stack
  - AGENTS.md: Created comprehensive guide for AI agents
  - WARP.md: Updated recent changes section
- ✅ **SEO Benefits:**
  - Google will properly index site with correct title & description
  - Social media sharing shows professional preview with logo
  - Targeted keywords for organic search traffic
  - Brand consistency across all metadata
- ✅ Files modified:
  - `app/layout.tsx` - Metadata object completely rewritten
  - `README.md` - Professional project documentation
  - `AGENTS.md` - AI agent configuration (new file)
  - `WARP.md` - Updated changelog
- ✅ Zero TypeScript errors
- ✅ Branding confirmed: "AI For Productivity Merchandise"

### 2025-02-05: Hybrid Parallel Image Generation (Performance Optimization)
- ✅ **Implemented hybrid lazy loading strategy for AI image generation**
- ✅ **Strategy: Priority Batch (3) + Background Parallel**
  - First 3 products generate in parallel (priority batch)
  - Remaining products generate in parallel in background
  - Auto-switch to generated view after priority batch completes
  - User sees results ~3-5x faster than sequential approach
- ✅ **Technical Implementation:**
  - Per-product timeout: 60 seconds with AbortController
  - Race condition guards via `generationRunIdRef`
  - Incremental state updates: "X of Y ready" progress
  - Promise.allSettled for graceful error handling
  - Cleanup on unmount prevents memory leaks
- ✅ **UI Improvements:**
  - Real-time progress: "3 of 10 ready" instead of percentage
  - Shows active product names being generated (max 3)
  - Background indicator: "✨ 7 more in background..."
  - Smooth transitions preserved
- ✅ **UX Behavior (Auto-Switch + Manual Control):**
  - **Auto Mode:** Priority batch completes → Auto-switch to generated view (no user action needed)
  - **Manual Mode:** Toggle button always available: "SHOW MY PHOTOS" ↔ "SHOW PRODUCTS"
  - **Best of both worlds:** Instant gratification + full user control
  - User can freely toggle between original products and generated photos anytime
- ✅ **Performance Metrics:**
  - console.time/timeEnd tracking per batch
  - Logs: `[gen] priority` and `[gen] background` timings
  - Example: 10 products @ ~8s each
    - Before: ~80s total (sequential)
    - After: ~8-10s to first view (3 parallel) + background continues
- ✅ **Error Handling:**
  - Individual product failures don't block others
  - Fallback to original product image on error
  - Progress continues even with partial failures
- ✅ Files modified:
  - `app/page.tsx` - Complete refactor of generation logic
- ✅ Zero TypeScript errors
- ✅ No rate limiting concerns (billing-enabled Gemini API)

### 2025-02-05: IDR Currency Format Standardization
- ✅ **Implemented proper IDR formatting (no decimal places)**
- ✅ Created `formatCurrency()` utility in `lib/utils.ts`:
  - IDR format: `Rp 100.000` (no decimals, dot thousand separator)
  - USD/EUR format: `$10.00` or `€10.00` (with decimals)
  - Uses `toLocaleString('id-ID')` for proper Indonesian formatting
- ✅ **Updated all currency displays:**
  - Storefront (`app/page.tsx`) - Product price display
  - Admin products table (`app/admin/products/page.tsx`)
  - Both now use `formatCurrency()` instead of manual formatting
- ✅ **Improved admin product form:**
  - Dynamic input step: `step="1"` for IDR, `step="0.01"` for USD/EUR
  - Dynamic placeholder: `"100000"` for IDR, `"99.99"` for USD/EUR
  - Helper text explaining IDR format (no decimals)
  - Adapts automatically when currency selection changes
- ✅ **Examples:**
  - Before: `IDR 100000.00` or `Rp100000,00`
  - After: `Rp 100.000` ✨
  - Maintains regional consistency (Indonesian format)
- ✅ Files modified:
  - `lib/utils.ts` - New formatCurrency function
  - `app/page.tsx` - Storefront display
  - `app/admin/products/page.tsx` - Admin table
  - `components/admin/product-form.tsx` - Form improvements
- ✅ Zero TypeScript errors
- ✅ Build successful

### 2025-02-03: Buy Button with External Links
- ✅ **Implemented external purchase link functionality**
- ✅ Database migration: Added `buy_link` column (VARCHAR 500, nullable)
  - Script: `scripts/05-add-buy-link-column.sql`
  - Applied via Supabase MCP
  - Indexed for performance
- ✅ **Backend updates:**
  - Updated Product interface in `lib/types.ts`
  - GET `/api/products` includes buy_link
  - POST `/api/admin/products` accepts buy_link
  - PUT `/api/admin/products/[id]` accepts buy_link
- ✅ **Admin form enhancements:**
  - Added "Buy Link" input field in product form
  - URL validation with placeholder
  - Helper text for external links (Tokopedia, Shopee, etc.)
- ✅ **Frontend functionality:**
  - Changed "ADD" button → "BUY" button
  - onClick redirects to external link (new tab)
  - Security: `noopener,noreferrer` attributes
  - Alert fallback for products without buy_link
  - Prevents image preview trigger with `stopPropagation()`
- ✅ Files modified:
  - `lib/types.ts` - Type definitions
  - `app/api/products/route.ts` - Public API
  - `app/api/admin/products/route.ts` - Admin create
  - `app/api/admin/products/[id]/route.ts` - Admin update
  - `components/admin/product-form.tsx` - Form input
  - `app/page.tsx` - Frontend button & interface
- ✅ Zero TypeScript errors
- ✅ Full integration: Database → Backend → Admin → Frontend

### 2025-02-03: Product Image Aspect Ratio & Dialog Accessibility Fixes
- ✅ **Implemented consistent 4:5 aspect ratio for all product images**
- ✅ Added `AspectRatio` component from shadcn/ui via MCP
- ✅ Features:
  - All product images locked to 4:5 aspect ratio (896x1152px equivalent)
  - Images with different ratios automatically fill/crop via `object-cover`
  - Maintains consistent visual grid in product catalog
  - Applies to both original product images AND AI-generated images
  - Hover zoom effect preserved
  - Image preview dialog integration maintained
- ✅ **Fixed accessibility issues in ImagePreviewDialog:**
  - Added hidden `DialogTitle` for screen reader accessibility (ARIA compliance)
  - Fixed empty string error in image src attribute
  - Prevents unnecessary page re-downloads
  - Follows Radix UI Dialog best practices
- ✅ Component files:
  - `components/ui/aspect-ratio.tsx` (new - shadcn component)
  - `components/image-preview-dialog.tsx` (updated - accessibility fixes)
  - `app/page.tsx` (updated - AspectRatio integration)
- ✅ Zero TypeScript errors, full accessibility compliance
- ✅ Mobile-friendly, responsive design maintained

### 2025-01-30: Image Preview with Zoom Feature
- ✅ **Implemented full-screen image preview with zoom functionality**
- ✅ Created `components/image-preview-dialog.tsx` (custom implementation)
- ✅ Features:
  - Zoom in/out (0.5x - 4x range) via buttons or mouse wheel
  - Pan/drag when zoomed (desktop mouse + mobile touch)
  - Reset button to restore 100% zoom
  - Dark backdrop with blur effect
  - Smooth animations & transitions
  - Keyboard accessible (ESC to close)
  - Search icon overlay on hover (indicates clickability)
- ✅ Integration in `app/page.tsx`:
  - Click handler on all product images
  - State management for selected image
  - Works for both product images AND generated images
- ✅ Zero external dependencies (pure React + CSS transforms)
- ✅ Mobile-friendly with touch gesture support
- ✅ Build successful, no TypeScript errors

### 2025-01-30: Next.js 15.5.4 Upgrade
- ✅ Upgraded Next.js from 15.2.4 → 15.5.4
- ✅ Cleaned up unused fonts in `app/layout.tsx`:
  - Removed: `Inter`, duplicate `Geist_Mono`, `Source_Serif_4`
  - Kept: `Plus_Jakarta_Sans` & `Geist_Mono` (actively used)
- ✅ Fixed Google Fonts timeout issue during build
- ✅ Build verified successful with all routes generating properly
- ⚠️ Note: Use `pnpm` (not `npm`) for package management
