# Supabase Authentication Setup

Thi```markdown file="SUPABASE_AUTH_SETUP.md"
# Supabase Authentication Setup

This application uses Supabase Auth for admin authentication. Follow these steps to set up admin users.

## Prerequisites

- Supabase project created and configured
- Environment variables set in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Creating Admin Users

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter email and password for the admin user
5. Click **Create user**
6. The user can now log in at `/admin/login`

### Option 2: Using SQL (Advanced)

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Create admin user with email and password
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

### Option 3: Using Supabase CLI

\`\`\`bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create admin user
supabase auth users create admin@example.com --password your-secure-password
\`\`\`

## Authentication Flow

1. **Login**: Users visit `/admin/login` and enter credentials
2. **Session**: Supabase creates a session with JWT tokens stored in cookies
3. **Middleware**: All `/admin/*` routes are protected by middleware that checks for valid session
4. **Logout**: Users can sign out from the admin panel, which clears the session

## Security Features

- ✅ Password-based authentication with Supabase Auth
- ✅ Session management with HTTP-only cookies
- ✅ Automatic session refresh in middleware
- ✅ Protected admin routes and API endpoints
- ✅ Secure logout functionality

## Testing Authentication

1. Create an admin user using one of the methods above
2. Visit `http://localhost:3000/admin` (or your deployed URL)
3. You should be redirected to `/admin/login`
4. Enter the admin credentials
5. Upon successful login, you'll be redirected to the admin dashboard

## Troubleshooting

### "Invalid login credentials" error
- Verify the email and password are correct
- Check that the user exists in Supabase Dashboard → Authentication → Users
- Ensure email is confirmed (email_confirmed_at is set)

### Redirected to login page after successful login
- Check browser console for errors
- Verify environment variables are set correctly
- Clear browser cookies and try again

### Session expires too quickly
- Check Supabase project settings → Authentication → JWT expiry
- Default is 1 hour, can be increased if needed

## Password Reset (Optional)

To enable password reset functionality:

1. Configure email templates in Supabase Dashboard → Authentication → Email Templates
2. Add password reset page at `/admin/reset-password`
3. Use `supabase.auth.resetPasswordForEmail()` to send reset emails

## Multi-Factor Authentication (Optional)

To add MFA for extra security:

1. Enable MFA in Supabase Dashboard → Authentication → Providers
2. Implement MFA enrollment in admin settings
3. Use `supabase.auth.mfa.enroll()` and `supabase.auth.mfa.verify()`
