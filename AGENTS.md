# AGENTS.md - AI For Productivity Merch Store

## 🎯 Project Snapshot
- **Type**: Next.js 15 e-commerce storefront (single project, not monorepo)
- **Stack**: Next.js 15 + TypeScript 5 + Supabase + ShadCN UI + Tailwind CSS 4
- **Features**: Admin dashboard, AI-powered product image generation (Gemini 2.5 Flash)
- **Note**: Sub-directories have detailed AGENTS.md → always check nearest file first

## ⚡ Root Setup Commands

```bash
# Install
npm install

# Development (NEVER start without permission - likely already running)
npm run dev          # localhost:3000

# Type checking (CRITICAL - build ignores errors!)
npx tsc --noEmit     # MUST run before commits

# Linting
npm run lint

# Build
npm run build        # ⚠️ Has ignoreBuildErrors: true - doesn't catch type errors

# Database setup
npm run setup        # Interactive setup wizard
npm run setup:db     # Run migrations only
npm run validate     # Validate environment variables
```

## 📐 Universal Conventions

**TypeScript**:
- Strict mode enabled
- NEVER use `any` (use `unknown` if needed)
- Always run `npx tsc --noEmit` after code changes (build won't catch errors)

**Code Style**:
- Path alias: `@/*` imports (e.g., `@/components/ui/button`)
- Server Components by default (no directive)
- Client Components: add `"use client"` at top
- Icon library: `lucide-react` only

**Git Commits**:
- Format: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- Always commit after completing a full task

## 🔒 Security & Secrets

- **Never commit**: API keys, tokens, `.env.local`
- **Environment**: Use `.env.local` (never `.env`)
- **Auth**: Middleware protects `/admin/*` and `/api/admin/*` routes
- **Public vars**: Prefix with `NEXT_PUBLIC_` for client-side access

## 🗂️ JIT Index - Directory Map

### Package Structure
- **Admin Dashboard**: `app/admin/` → [see app/admin/AGENTS.md](app/admin/AGENTS.md)
- **API Routes**: `app/api/` → [see app/api/AGENTS.md](app/api/AGENTS.md)
- **React Components**: `components/` → [see components/AGENTS.md](components/AGENTS.md)
- **Services & Utils**: `lib/` → [see lib/AGENTS.md](lib/AGENTS.md)
- **Database Migrations**: `scripts/` → [see scripts/AGENTS.md](scripts/AGENTS.md)
- **Documentation**: `docs/` (setup guides, technical specs)

### Quick Find Commands

```bash
# Find a component by name
rg -n "export.*ComponentName" components/ app/

# Find an API route
rg -n "export async function (GET|POST|PUT|DELETE)" app/api/

# Find a function/hook
rg -n "export (function|const)" lib/ hooks/

# Find pages
rg -n "export default function.*Page" app/

# Find client components
rg -n "use client" app/ components/
```

### Key Files (Examples)
- **Auth middleware**: `middleware.ts` (protects admin routes)
- **Root layout**: `app/layout.tsx` (dynamic theme injection)
- **Supabase clients**: `lib/supabase-server.ts`, `lib/supabase-client.ts`
- **Settings service**: `lib/settings-service.ts` (reusable CRUD)
- **Utils**: `lib/utils.ts` (cn helper, formatters)

## ✅ Definition of Done

Before creating a PR or committing:
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] Test in browser (pages render, no console errors)
- [ ] If database schema changed: run `npm run setup:db` and check advisors
- [ ] No secrets or sensitive data in code/logs
- [ ] Commit message follows Conventional Commits

## 🛠️ MCP Tool Usage

**Supabase MCP** (required for database operations):
- Schema changes → `apply_migration`
- Queries → `execute_sql`
- Security checks → `get_advisors`

**ShadCN MCP** (required for UI components):
1. `search_items_in_registries` - Find components
2. `get_item_examples_from_registries` - See usage
3. `get_add_command_for_items` - Get install command
4. Run the command to add

**Never**:
- Write raw SQL in code
- Manually install ShadCN components
- Rely on build for type checking

---

**Last Updated**: 2025-11-07
