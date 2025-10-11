# 🚀 Setup Guide - AI For Productivity Merch

**Complete setup in 5 minutes!** This guide walks you through setting up your own merchandise store with AI-powered features.

---

## 📋 Prerequisites

You'll need free accounts on these platforms:

1. **[Google AI Studio](https://aistudio.google.com/)** - For AI virtual try-on
2. **[Supabase](https://supabase.com/dashboard)** - For database & authentication  
3. **[Vercel](https://vercel.com/dashboard)** - For hosting & image storage

---

## 🎯 Quick Start (Automated)

### Option A: Interactive Setup (Recommended)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd aiforproductivity-merch
npm install

# 2. Run setup wizard
npm run setup

# 3. Start development
npm run dev
```

The setup wizard will:
- ✅ Guide you through getting API keys
- ✅ Test your database connection
- ✅ Create `.env.local` automatically
- ✅ Run database migrations
- ✅ Verify everything works

---

## 📝 Manual Setup

### Step 1: Get API Keys (3 minutes)

#### 1.1 Google AI (Gemini)

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Save it for later

#### 1.2 Supabase

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Click "New Project"
3. Fill in:
   - **Project Name**: `aiforproductivity-merch` (or any name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project" (wait ~2 minutes)
5. Once ready, go to **Settings** → **API**
6. Copy these values:
   - **Project URL** (e.g., `https://abcxyz123.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)
   - **service_role key** (starts with `eyJhbGc...`)

#### 1.3 Vercel Blob (Optional for Local Dev)

**For Production:** Auto-configured when you deploy to Vercel

**For Local Development:**
1. Go to **[Vercel Storage](https://vercel.com/dashboard/stores)**
2. Click "Create Store" → "Blob"
3. Give it a name
4. Copy the `BLOB_READ_WRITE_TOKEN`

---

### Step 2: Configure Environment Variables

#### 2.1 Create `.env.local`

```bash
# Copy the example file
cp .env.example .env.local
```

#### 2.2 Edit `.env.local`

Open `.env.local` and replace all placeholder values:

```bash
# Google AI
GEMINI_API_KEY=AIza...your_actual_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcxyz123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_actual_service_key

# Vercel Blob (optional for local dev)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...your_token
```

---

### Step 3: Setup Database (2 minutes)

#### Option A: Automated (If setup wizard available)

```bash
npm run setup:db
```

#### Option B: Manual via Supabase Dashboard

1. Go to your **[Supabase Project Dashboard](https://supabase.com/dashboard)**
2. Click **SQL Editor** in the sidebar
3. Run each SQL file in order (copy-paste and click "Run"):

```
scripts/01-create-tables.sql          ← Creates database schema
scripts/02-seed-categories.sql        ← Adds default categories
scripts/03-migrate-products.sql       ← Migrates products
scripts/04-seed-default-prompts.sql   ← Adds AI prompts
scripts/05-add-buy-link-column.sql    ← Adds buy link field
scripts/06-add-product-colors-table.sql     ← Creates colors table
scripts/07-migrate-existing-products-colors.sql  ← Migrates colors
```

**Tip:** Open each file, copy all contents, paste in SQL Editor, click "Run"

---

### Step 4: Verify Setup

```bash
# Check environment variables
npm run validate

# Start development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** - you should see the storefront!

---

## 🚀 Deploy to Production

### Deploy to Vercel (Recommended)

#### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/aiforproductivity-merch&env=GEMINI_API_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=API%20keys%20for%20AI%2C%20database%2C%20and%20storage&envLink=https://github.com/YOUR_USERNAME/aiforproductivity-merch/blob/main/SETUP.md)

This will:
1. Fork the repo to your GitHub
2. Create a new Vercel project
3. Prompt you for environment variables
4. Deploy automatically

**After deployment:**
- Vercel Blob is auto-configured ✅
- Run database migrations in Supabase (Step 3 above)

#### Option B: Manual Deploy

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel dashboard
# Go to: Settings → Environment Variables
```

---

## 🔒 Security Checklist

After setup, verify these security settings:

### Supabase Security

1. **Enable Row Level Security (RLS)** - Already done by migration scripts ✅
2. **Enable Password Strength** (Optional):
   - Go to **Authentication** → **Policies**
   - Enable "Password Strength" and "Leaked Password Protection"
3. **Email Rate Limiting**:
   - Set reasonable limits (e.g., 4 per hour)

### Environment Variables

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code
- ✅ Use separate projects for staging and production

---

## 🛠️ Troubleshooting

### Error: "Missing environment variables"

**Solution:**
1. Check `.env.local` exists
2. Verify all values are filled (no `your_xxx_here` placeholders)
3. Restart dev server: `npm run dev`

### Error: "Failed to connect to Supabase"

**Solutions:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check anon key matches your project
- Ensure Supabase project is not paused (free tier auto-pauses after 7 days inactivity)

### Error: "Table does not exist"

**Solution:**
Run database migrations (Step 3)

### Database Connection Works But No Products

**Solution:**
Check these migrations ran successfully:
- `02-seed-categories.sql`
- `03-migrate-products.sql`

Verify in Supabase Dashboard → **Table Editor** → `products` table

### Image Upload Fails

**Solution:**
- For production: Ensure Vercel Blob store is connected
- For local dev: Add `BLOB_READ_WRITE_TOKEN` to `.env.local`

---

## 📚 Next Steps

After setup is complete:

1. **Customize Your Store**
   - Go to `/admin/customize` to change logo, colors, fonts
   
2. **Add Products**
   - Visit `/admin/products` to manage products
   
3. **Configure AI Prompts**
   - Go to `/admin/prompts` to customize AI generation prompts

4. **Read Documentation**
   - `AGENTS.md` - For AI coding agents (Cursor, Windsurf, etc.)
   - `WARP.md` - Technical reference
   - `docs/ADMIN_USER_GUIDE.md` - Admin panel guide

---

## 🆘 Need Help?

- **Environment Issues:** Run `npm run validate` to see what's missing
- **Database Issues:** Check Supabase logs in Dashboard → Logs
- **Deployment Issues:** Check Vercel deployment logs
- **General Issues:** See `docs/` folder for detailed guides

---

## 🎉 Success!

If you see the storefront at `http://localhost:3000`, you're all set!

**What to do next:**
1. Visit `/admin/login` to access admin dashboard
2. Upload your products
3. Customize your store appearance
4. Test the AI virtual try-on feature

Happy selling! 🛍️
