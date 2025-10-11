# Supabase Security Improvements

## Completed Fixes (2025-01-31)

### ✅ RLS Policy Optimizations
**Issue**: Auth functions (`auth.role()`, `auth.jwt()`) were being re-evaluated for every row, causing performance degradation at scale.

**Fix**: Wrapped all auth function calls with `SELECT` subqueries:
- Before: `auth.role() = 'service_role'`
- After: `(select auth.role()) = 'service_role'`

**Impact**: Significant performance improvement for queries on `products`, `ai_prompts`, `categories`, and `product_colors` tables.

### ✅ Consolidated Multiple Permissive Policies
**Issue**: Each table had multiple overlapping SELECT policies causing redundant policy evaluations.

**Fix**: Consolidated policies per table:
- Single SELECT policy for read access
- Single ALL policy for write operations
- Reduced from 2-3 policies per table to 2 policies per table

**Impact**: Reduced policy evaluation overhead on every query.

### ✅ Removed Unused Indexes
**Issue**: 7 unused indexes consuming storage and slowing down write operations.

**Removed**:
- `idx_products_category`
- `idx_products_is_active`
- `idx_ai_prompts_is_default`
- `idx_products_buy_link`
- `idx_product_colors_is_default`
- `idx_product_colors_sort_order`
- `idx_site_settings_key`

**Impact**: Reduced storage usage and improved INSERT/UPDATE performance.

### ✅ Fixed Function Search Path Security
**Issue**: Trigger functions `update_updated_at_column` and `update_site_settings_updated_at` had mutable search_path, creating potential security vulnerabilities.

**Fix**: Added `SET search_path = ''` to both functions.

**Impact**: Functions are now protected against malicious search_path changes.

---

## Pending: Manual Configuration Required

### ⚠️ Enable Leaked Password Protection

**Issue**: Supabase Auth is not checking passwords against the HaveIBeenPwned database of compromised passwords.

**How to Enable**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **Authentication** → **Policies** → **Password**
4. Enable **"Check against HaveIBeenPwned"**

**Reference**: [Supabase Password Security Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

**Impact**: Prevents users from using compromised passwords, enhancing account security.

---

## Verification

Run these commands to verify fixes:
```bash
# Check for new advisor warnings
supabase___get_advisors --type security
supabase___get_advisors --type performance
```

Expected result: All previous warnings should be resolved except for the leaked password protection (requires manual dashboard configuration).

---

**Last Updated**: 2025-01-31
**Migration Files**:
- `optimize_rls_policies_consolidate_and_fix_auth_calls`
- `remove_unused_indexes`
- `fix_function_search_path_security`
