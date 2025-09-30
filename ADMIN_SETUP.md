# Admin Dashboard Setup (DEPRECATED)

> ⚠️ **This document is outdated.** The admin panel now uses **Supabase Authentication** instead of API keys.
> 
> **Please refer to [ADMIN_AUTH_SETUP.md](./ADMIN_AUTH_SETUP.md) for current setup instructions.**

---

## Migration Notice

This project has been upgraded from simple API key authentication to **Supabase Auth** for better security and user management.

### What Changed

- ❌ **Old System**: API key in headers via browser extension
- ✅ **New System**: Email/password login with Supabase Auth

### Migration Steps

1. Read the new setup guide: [ADMIN_AUTH_SETUP.md](./ADMIN_AUTH_SETUP.md)
2. Create an admin user in Supabase (see guide for instructions)
3. Login at `/admin/login` with your credentials
4. Remove any browser extensions that were adding Authorization headers

### Why We Migrated

- **Better Security**: Proper session management and token refresh
- **User Management**: Multiple admin users with different emails
- **No Browser Extensions**: Built-in login page
- **Production Ready**: Industry-standard authentication
- **Better UX**: No need to manually add headers

---

## Old Documentation (For Reference Only)

<details>
<summary>Click to expand old API key authentication docs</summary>

# Admin Dashboard Setup

## Authentication

Admin dashboard menggunakan simple API key authentication untuk melindungi routes `/admin` dan `/api/admin`.

### Setup Environment Variable

Tambahkan environment variable berikut di Vercel Project Settings:

\`\`\`
ADMIN_API_KEY=your-secure-random-key-here
\`\`\`

**Generate secure key:**
\`\`\`bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Using online generator
# https://www.uuidgenerator.net/
\`\`\`

### Mengakses Admin Dashboard

#### Option 1: Browser Extension (Recommended)

Install browser extension untuk menambahkan Authorization header:
- Chrome: [ModHeader](https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj)
- Firefox: [Modify Header Value](https://addons.mozilla.org/en-US/firefox/addon/modify-header-value/)

Tambahkan header:
\`\`\`
Authorization: Bearer your-admin-api-key-here
\`\`\`

#### Option 2: Custom Admin Login Page (Future Enhancement)

Buat halaman login sederhana di `/admin/login` yang:
1. User input API key
2. Store di localStorage atau cookie
3. Attach ke semua admin requests

#### Option 3: Development Mode

Jika `ADMIN_API_KEY` tidak di-set, admin routes akan terbuka (unprotected).
**JANGAN deploy ke production tanpa set ADMIN_API_KEY!**

### How Authentication Works

Authentication is handled **entirely server-side** via Next.js middleware:

1. **Middleware Protection** (`middleware.ts`):
   - Intercepts all requests to `/admin/*` and `/api/admin/*`
   - Validates `Authorization: Bearer <key>` header
   - Returns 401 if invalid or missing

2. **Client-Side Requests**:
   - Admin pages make regular fetch requests (no auth headers needed in code)
   - Browser extension adds the Authorization header to all requests
   - Middleware validates before reaching the API routes

3. **Security Benefits**:
   - No sensitive keys exposed to client-side JavaScript
   - All authentication logic server-side only
   - Simple to implement and maintain

### Security Notes

1. **NEVER commit ADMIN_API_KEY ke git**
2. **NEVER use NEXT_PUBLIC_ prefix** - this exposes keys to the client
3. **Rotate key secara berkala** (setiap 3-6 bulan)
4. **Gunakan HTTPS** di production
5. **Consider upgrade ke NextAuth.js** untuk production dengan multiple admins

### Upgrade Path (Future)

Untuk production yang lebih robust, consider:

1. **NextAuth.js** - Full authentication dengan session management
2. **Clerk** - Modern auth dengan UI components
3. **Supabase Auth** - Karena sudah pakai Supabase
4. **Role-Based Access Control (RBAC)** - Admin, Editor, Viewer roles

### Troubleshooting

**401 Unauthorized Error:**
- Check ADMIN_API_KEY di environment variables
- Verify Authorization header format: `Bearer <key>`
- Check browser extension configuration
- Make sure browser extension is enabled for your domain

**Admin routes terbuka tanpa auth:**
- ADMIN_API_KEY belum di-set
- Set di Vercel Project Settings → Environment Variables
- Redeploy setelah menambahkan env var

**"Sensitive environment variable" warning:**
- Make sure you're NOT using `NEXT_PUBLIC_ADMIN_API_KEY`
- Only use `ADMIN_API_KEY` (server-side only)
- Authentication should be handled by middleware, not client code

</details>
