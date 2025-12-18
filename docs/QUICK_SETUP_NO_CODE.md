# 🚀 Quick Setup Guide for Non-Technical Users

**Complete setup in 10 minutes - no coding required!**

This guide is designed for store owners who want to set up the AI For Productivity Merch store **without technical knowledge**.

---

## 📋 What You'll Need

Before starting, get these accounts (all free):

1. **Supabase Account** (Database)
   - Sign up: https://supabase.com
   - Free tier: Perfect for starting

2. **BytePlus Console Account** (AI Image Generation)
   - Sign up: https://console.byteplus.com
   - Free trial available: 2,000 requests initial quota

3. **Vercel Account** (Optional, for deployment)
   - Sign up: https://vercel.com
   - Free tier: Unlimited hobby projects

---

## 🎯 Setup Process Overview

```
1. Create Supabase Project    (5 minutes)
2. Setup Database             (2 minutes) ← EASIEST PART!
3. Get API Keys               (2 minutes)
4. Configure Environment      (1 minute)
5. Start Your Store           (Done!)
```

---

## 📝 Step 1: Create Supabase Project

### 1.1 Sign Up for Supabase
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub (recommended)

### 1.2 Create New Project
1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `ai-productivity-merch` (or any name you like)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

---

## ⚡ Step 2: Setup Database (SUPER EASY!)

### Option A: One-Click Setup (Recommended) 🎉

**This is the easiest way - just copy and paste once!**

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file: `scripts/all-migrations.sql` in this project
4. **Copy the entire file** (Ctrl+A, Ctrl+C)
5. **Paste into Supabase SQL Editor** (Ctrl+V)
6. Click **"Run"** button (bottom right)
7. Wait 5-10 seconds
8. ✅ Done! You should see "Success. No rows returned"

**That's it!** Your database is fully set up with:
- ✅ All tables created
- ✅ Sample products added
- ✅ Security configured
- ✅ Ready to use

### Option B: Automated Script (Alternative)

If you're comfortable with terminal/command line:

```bash
# In project folder
npm run setup
```

Follow the interactive prompts.

---

## 🔑 Step 3: Get Your API Keys

### 3.1 Get Supabase Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. You'll see these keys (keep this tab open):
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

💡 **Tip**: Don't close this tab yet, you'll need these in Step 4!

### 3.2 Get BytePlus AI (SeeDream) Key

1. Go to https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey
2. Sign in with BytePlus account
3. Click **"Create API Key"**
4. Copy the key

---

## 🛠️ Step 4: Configure Environment

### 4.1 Create `.env.local` File

1. In your project folder, find `.env.example`
2. Make a copy and rename it to `.env.local`
3. Open `.env.local` with any text editor (Notepad, VS Code, etc.)

### 4.2 Fill in Your Keys

Replace the placeholder values with your actual keys:

```env
# BytePlus AI
BYTEPLUS_API_KEY=your_key_here # ← Paste your BytePlus AI key here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co # ← Paste Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # ← Paste anon public key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # ← Paste service_role key

# Vercel Blob (Optional - add this later before deploying)
# BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### 4.3 Save the File

- Save `.env.local` 
- **Important**: Never share this file publicly!

---

## 🎉 Step 5: Start Your Store

### 5.1 Install Dependencies (First Time Only)

Open terminal in project folder:

```bash
npm install
```

Wait for installation to complete (~2 minutes).

### 5.2 Start Development Server

```bash
npm run dev
```

You'll see:

```
✓ Ready in 3.2s
○ Local:        http://localhost:3000
```

### 5.3 Open Your Store

1. Open browser
2. Go to: http://localhost:3000
3. 🎊 **Your store is live!**

---

## 🔐 Step 6: Access Admin Panel

### 6.1 Enable Email Auth in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Email** provider
3. Toggle it **ON** (should be enabled by default)
4. Scroll down and click **"Save"**

### 6.2 Create Admin User

1. Still in Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - **Email**: Your email
   - **Password**: Choose a secure password
   - Toggle **"Auto Confirm User"** to **ON**
4. Click **"Create User"**

### 6.3 Login to Admin

1. Go to: http://localhost:3000/admin/login
2. Enter your email and password
3. Click **"Sign In"**
4. 🎉 You're in the admin dashboard!

---

## 🎨 Customize Your Store

Once logged in to admin panel, you can:

### Products Management (`/admin/products`)
- ✅ Add new products
- ✅ Edit product details
- ✅ Upload product images
- ✅ Set prices and categories
- ✅ Add color variants
- ✅ Add buy links (Tokopedia, Shopee, etc.)

### Customize Appearance (`/admin/customize`)
- ✅ Upload your logo
- ✅ Change website name
- ✅ Select fonts
- ✅ Customize colors and theme
- ✅ Real-time preview

### AI Prompts Management (`/admin/prompts`)
- ✅ Edit AI generation prompts
- ✅ Customize per product
- ✅ Test different styles

---

## 📱 Deploy to Production (Optional)

### Using Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables:
   - Copy all values from `.env.local`
   - Paste into Vercel environment settings
5. Click **"Deploy"**
6. Wait 2-3 minutes
7. ✅ Your store is live!

---

## 🆘 Troubleshooting

### ❌ "Failed to connect to Supabase"

**Solution**:
1. Check your `.env.local` file
2. Make sure you copied the correct keys from Supabase Dashboard
3. No extra spaces before or after the keys
4. Keys should NOT be wrapped in quotes

### ❌ "No products showing on homepage"

**Solution**:
1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query to check:
   ```sql
   SELECT * FROM products;
   ```
3. If empty, re-run the setup SQL from Step 2

### ❌ "Cannot login to admin"

**Solution**:
1. Check if user exists: Supabase Dashboard → **Authentication** → **Users**
2. Make sure **"Auto Confirm User"** was toggled ON when creating user
3. Try resetting password from Supabase Dashboard

### ❌ "AI image generation not working"

**Solution**:
1. Check `BYTEPLUS_API_KEY` in `.env.local`
2. Verify key is valid: https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey

---

## 📚 Additional Resources

- **Complete Technical Guide**: See `SETUP.md`
- **Admin Panel Guide**: See `docs/ADMIN_USER_GUIDE.md`
- **Site Settings Guide**: See `docs/SITE_SETTINGS_TABLE.md`
- **Architecture Overview**: See `ARCHITECTURE.md`

---

## 🎯 Quick Reference Card

Save this for future reference:

| What | Where |
|------|-------|
| **Homepage** | http://localhost:3000 |
| **Admin Login** | http://localhost:3000/admin/login |
| **Admin Dashboard** | http://localhost:3000/admin |
| **Products Management** | http://localhost:3000/admin/products |
| **Customize Panel** | http://localhost:3000/admin/customize |
| **AI Prompts** | http://localhost:3000/admin/prompts |
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **BytePlus Console** | https://console.byteplus.com |

---

## ✅ Setup Complete!

Your AI-powered merch store is now ready to use. You can:

- ✅ Add and manage products
- ✅ Customize your store's appearance
- ✅ Let customers try products with AI
- ✅ Accept orders via external links

**Need help?** Check the troubleshooting section above or refer to `SETUP.md` for detailed technical documentation.

---

**Last Updated**: 2025-01-31  
**Difficulty**: ⭐ Beginner-friendly  
**Time Required**: 10 minutes
