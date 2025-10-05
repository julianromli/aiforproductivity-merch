# AGENTS.md - AI For Productivity Merch Store

## Project Overview
Next.js 15 e-commerce storefront built with v0.app, featuring Supabase backend and ShadCN UI components.

## Tech Stack
- **Framework**: Next.js 15.5.4 (App Router, RSC)
- **UI**: ShadCN (New York style) + Radix UI + Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Auth + Storage)
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
  ├── layout.tsx            # Root layout
  └── globals.css           # Tailwind styles

components/
  └── ui/                   # ShadCN components

lib/
  ├── utils.ts              # Utilities (cn helper)
  └── supabase/             # Supabase client setup
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
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Other API keys as needed

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
2. Protect with Supabase Auth
3. Use ShadCN Table/Form components
4. Run security advisors after DB changes

### Styling Changes
1. Edit Tailwind classes in components
2. Update `app/globals.css` for global styles
3. Use CSS variables from ShadCN theme
4. Test dark mode if applicable

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

## Links
- **Deployment**: https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s
- **v0 Project**: https://v0.app/chat/projects/KFS0eQo54K6
- **ShadCN Docs**: Component demos via MCP `get_item_examples_from_registries`
- **Supabase Docs**: Query via MCP `search_docs`

---

**Last Updated**: 2025-01-30  
**Maintained By**: Agent + User collaboration
