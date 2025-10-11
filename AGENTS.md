# AGENTS.md - AI For Productivity Merch Store

## Project Overview
Next.js 15 e-commerce storefront built with v0.app, featuring Supabase backend, ShadCN UI, and AI-powered personalized product image generation using Google Gemini 2.5 Flash.

## Tech Stack
- **Framework**: Next.js 15.5.4 (App Router, RSC)
- **UI**: ShadCN (New York style) + Radix UI + Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Storage**: Vercel Blob (Image uploads)
- **AI**: Google Gemini 2.5 Flash (Image Generation)
- **Language**: TypeScript 5
- **State**: React Hook Form + Zod validation
- **Deployment**: Vercel

## Quick Commands

### Development
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run lint         # ESLint check
npx tsc --noEmit     # Type check (REQUIRED before commits)
```

### Database (Supabase)
Use Supabase MCP tools for all database operations:
- `execute_sql` - Query data
- `apply_migration` - Schema changes
- `list_tables` - View schema
- `get_advisors` - Security/performance checks

### UI Components (ShadCN)
Use ShadCN MCP tools:
1. `search_items_in_registries` - Find components
2. `get_item_examples_from_registries` - See usage demos
3. `get_add_command_for_items` - Get install command
4. Run the command to add component

Example: Adding a button
```bash
# MCP will return this command:
npx shadcn@latest add button
```

## Project Structure
```
app/
  ├── page.tsx              # Homepage (storefront)
  ├── admin/                # Admin dashboard
  │   ├── customize/        # Customize panel (logo, fonts, colors)
  │   ├── products/         # Product management
  │   ├── prompts/          # AI prompt management
  │   └── layout.tsx        # Admin layout with sidebar
  ├── api/admin/
  │   ├── settings/         # Settings CRUD API
  │   └── upload/logo/      # Logo upload to Vercel Blob
  ├── layout.tsx            # Root layout (with dynamic theme injection)
  └── globals.css           # Tailwind styles (semantic tokens)

components/
  └── ui/                   # ShadCN components

lib/
  ├── utils.ts              # Utilities (cn helper)
  ├── settings-service.ts   # Settings CRUD operations
  ├── theme-generator.ts    # Dynamic CSS generation
  └── supabase-server.ts    # Supabase server client
```

## Coding Guidelines

### TypeScript Rules
- **Always** run `npx tsc --noEmit` after edits
- Do NOT rely on `npm run build` (type checking disabled in next.config.mjs)
- Use proper types, no `any` unless absolutely necessary

### Component Patterns
- Use Server Components by default
- Client Components: add `"use client"` directive
- ShadCN aliases: `@/components`, `@/lib`, `@/hooks`
- Icon library: `lucide-react`

### Styling
- Tailwind CSS 4 (PostCSS)
- Use `cn()` helper from `@/lib/utils` for conditional classes
- Follow ShadCN New York style conventions

### Database Operations
1. **ALWAYS** use Supabase MCP tools (never raw SQL in code)
2. Check RLS policies with `get_advisors` after schema changes
3. Use migrations for DDL operations
4. Follow naming: `snake_case` for tables/columns

### Environment Variables
Check `.env.local` for:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GEMINI_API_KEY` - Google Gemini API key
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

## Verification Checklist

Before committing code changes:
- [ ] Run `npx tsc --noEmit` (no errors)
- [ ] Run `npm run lint` (no warnings)
- [ ] Test in browser (components render correctly)
- [ ] Check database advisors if schema changed
- [ ] Verify ShadCN components follow demo patterns

## Git Workflow
```bash
git add .
git commit -m "type: description"  # Use Conventional Commits
git push
```

Commit types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`

## Common Tasks

### Add New Product Page
1. Create route in `app/products/[id]/page.tsx`
2. Fetch data from Supabase using MCP `execute_sql`
3. Use ShadCN Card/Button components
4. Type check before committing

### Admin Dashboard Feature
1. Work in `app/admin/` directory
2. Protect with Supabase Auth (middleware handles auth)
3. Use ShadCN Table/Form components
4. Run security advisors after DB changes

### Admin Customization (New Feature)
**Location**: `/admin/customize`

Admin can customize website appearance without coding:

1. **Logo Management**
   - Upload file (Vercel Blob) or use external URL
   - Max 2MB, supports JPEG/PNG/WebP/GIF/SVG
   - Preview before saving

2. **Font Selection**
   - Choose Sans, Serif, Mono fonts
   - Google Fonts integration
   - Changes require page reload

3. **Color Scheme**
   - Use [TweakCN](https://tweakcn.com/editor/theme) for visual theme editing
   - Paste CSS variables for light/dark mode
   - Supports semantic tokens from globals.css

**Implementation**:
- Settings stored in `site_settings` table (JSONB)
- Dynamic CSS injection in root layout
- All settings managed via `/api/admin/settings`

### Styling Changes
1. Edit Tailwind classes in components
2. Update `app/globals.css` for global styles (uses semantic tokens)
3. Use CSS variables from ShadCN theme
4. Admin can customize via `/admin/customize` panel
5. Test dark mode if applicable

### AI Image Generation Debugging
1. Check console logs with `[gen]` prefix for detailed progress
2. Monitor concurrency limits (Priority: 3, Background: 2)
3. Verify retry mechanism for timeout/network errors
4. Review `DEBUG_IMAGE_GENERATION.md` for full debugging guide
5. Expected success rate: 90%+ (with automatic retry & fallback)

## Important Notes

⚠️ **Type Checking Disabled in Build**
- next.config.mjs has `ignoreBuildErrors: true`
- MUST manually run `npx tsc --noEmit` before commits

⚠️ **Never Start Dev Server**
- Dev server likely already running
- If not, ASK user to start it

⚠️ **Use MCP Tools**
- Supabase operations → Supabase MCP
- ShadCN components → ShadCN MCP
- Don't hardcode SQL or manually install components

⚠️ **AI Image Generation**
- Concurrency limited: Priority batch (3), Background batch (2)
- Auto-retry for timeout/network errors (max 1 retry)
- 90s timeout per generation request
- Detailed logging with `[gen]` prefix in console
- See `DEBUG_IMAGE_GENERATION.md` for troubleshooting

⚠️ **Admin Access Control**
- Middleware protects all `/admin/*` and `/api/admin/*` routes
- Currently: Any authenticated user can access admin panel
- No role-based access control (RBAC) yet
- For production: Implement email whitelist or user roles table

## Debugging Resources
- **Image Generation**: See `DEBUG_IMAGE_GENERATION.md` for detailed troubleshooting guide
- **Console Logs**: Filter by `[gen]` prefix for generation progress
- **Error Tracking**: Check browser console for retry attempts and failure reasons

## Links
- **Deployment**: https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s
- **v0 Project**: https://v0.app/chat/projects/KFS0eQo54K6
- **ShadCN Docs**: Component demos via MCP `get_item_examples_from_registries`
- **Supabase Docs**: Query via MCP `search_docs`

## Recent Updates

### 2025-01-31: Admin Customize Panel
- ✅ Added `/admin/customize` panel for non-technical admins
- ✅ Logo upload via Vercel Blob storage
- ✅ Font customization with Google Fonts
- ✅ Color scheme editing via TweakCN integration
- ✅ Dynamic CSS injection in root layout
- ✅ Settings stored in `site_settings` table

**Database Tables**:
- `site_settings` - Stores logo, fonts, theme_light, theme_dark settings

**New API Routes**:
- `POST /api/admin/upload/logo` - Upload logo to Vercel Blob
- `GET/POST /api/admin/settings` - Manage all settings
- `GET/PUT/DELETE /api/admin/settings/[key]` - Manage single setting

---

**Last Updated**: 2025-01-31  
**Maintained By**: Agent + User collaboration
