# Admin Authentication Setup Guide

This admin panel uses **Supabase Authentication** for secure, production-ready user management.

## 🔐 How It Works

### Authentication Flow

1. **Login Page** (`/admin/login`)
   - Users enter email and password
   - Credentials are verified against Supabase Auth
   - On success, user is redirected to `/admin`

2. **Middleware Protection** (`middleware.ts`)
   - All `/admin/*` routes (except `/admin/login`) require authentication
   - Unauthenticated users are redirected to `/admin/login`
   - Session tokens are automatically refreshed

3. **Admin Layout** (`app/admin/layout.tsx`)
   - Shows user email in sidebar
   - Provides logout functionality via dropdown menu
   - Uses `AuthProvider` for client-side auth state

## 🚀 Setup Instructions

### 1. Supabase Integration

This project already has Supabase integrated with the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Create Admin User

You need to create an admin user in Supabase:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add User"
4. Enter email and password
5. Click "Create User"

**Option B: Using SQL Script**

Run this script in the v0 Scripts panel:

\`\`\`sql
-- Create admin user (replace with your email and password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com', -- Change this
  crypt('your-secure-password', gen_salt('bf')), -- Change this
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
\`\`\`

### 3. Test the Login

1. Navigate to `/admin` in your browser
2. You should be redirected to `/admin/login`
3. Enter the email and password you created
4. You should be logged in and redirected to the admin dashboard

## 📁 File Structure

\`\`\`
app/admin/
├── login/
│   └── page.tsx          # Login form
├── layout.tsx            # Admin layout with auth provider
├── page.tsx              # Dashboard
├── products/             # Product management
└── prompts/              # Prompt management

lib/
├── supabase-auth.ts      # Supabase client utilities
└── hooks/
    └── use-auth.tsx      # Auth context and hook

middleware.ts             # Route protection
\`\`\`

## 🔧 Key Components

### Supabase Client (`lib/supabase-auth.ts`)

\`\`\`typescript
// Browser client for client-side operations
const supabase = createClient()

// Server client for server-side operations
const supabase = await createServerClient()

// Get authenticated user
const user = await getAuthenticatedUser()
\`\`\`

### Auth Hook (`lib/hooks/use-auth.tsx`)

\`\`\`typescript
const { user, loading, signOut } = useAuth()
\`\`\`

### Middleware (`middleware.ts`)

- Protects all `/admin/*` routes except `/admin/login`
- Refreshes session tokens automatically
- Redirects unauthenticated users to login page

## 🛡️ Security Features

✅ **Server-side session validation** - Middleware checks auth on every request
✅ **Automatic token refresh** - Sessions stay valid without manual intervention
✅ **Secure password hashing** - Supabase handles bcrypt hashing
✅ **CSRF protection** - Built into Supabase Auth
✅ **HTTP-only cookies** - Session tokens not accessible via JavaScript

## 🔄 Common Operations

### Logout

\`\`\`typescript
const { signOut } = useAuth()
await signOut() // Redirects to /admin/login
\`\`\`

### Check if User is Logged In

\`\`\`typescript
const { user, loading } = useAuth()

if (loading) return <div>Loading...</div>
if (!user) return <div>Not logged in</div>
\`\`\`

### Get User Email

\`\`\`typescript
const { user } = useAuth()
console.log(user?.email)
\`\`\`

## 🐛 Troubleshooting

### "Invalid login credentials"
- Check that the user exists in Supabase Auth
- Verify email and password are correct
- Check Supabase dashboard for user status

### Redirected to login immediately after signing in
- Check browser console for errors
- Verify Supabase environment variables are set
- Check that middleware is not blocking the redirect

### Session expires too quickly
- Supabase sessions last 1 hour by default
- Middleware automatically refreshes tokens
- Check that middleware is running on all admin routes

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [@supabase/ssr Package](https://supabase.com/docs/guides/auth/server-side/nextjs)

## 🔐 Production Checklist

Before deploying to production:

- [ ] Create a strong admin password (16+ characters)
- [ ] Enable email confirmation in Supabase (optional)
- [ ] Set up Row Level Security (RLS) policies if using Supabase database
- [ ] Configure custom email templates in Supabase
- [ ] Set up password recovery flow (optional)
- [ ] Enable 2FA for admin accounts (optional)
- [ ] Monitor auth logs in Supabase dashboard

## 🎯 Next Steps

1. **Add Role-Based Access Control (RBAC)**
   - Create an `admin_roles` table
   - Add role checks in middleware
   - Restrict certain pages to specific roles

2. **Add Email Verification**
   - Enable email confirmation in Supabase
   - Add email verification flow

3. **Add Password Reset**
   - Create password reset page
   - Use Supabase password recovery

4. **Add Activity Logging**
   - Log admin actions to database
   - Create audit trail for compliance
