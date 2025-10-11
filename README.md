# AI For Productivity Merchandise

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> Official merchandise e-commerce store for **AI For Productivity** with AI-powered virtual try-on feature.

## 🌟 Overview

An innovative e-commerce platform built with **Next.js 15** featuring:
- 🤖 **AI-Powered Virtual Try-On**: See how products look on you using Google Gemini 2.5 Flash
- 🛍️ **Modern Storefront**: Clean, professional UI built with shadcn/ui (New York style)
- 🔐 **Admin Dashboard**: Full product & prompt management with Supabase authentication
- 📱 **Mobile-First Design**: Responsive, accessible, and optimized for all devices
- 🎨 **Image Preview & Zoom**: Full-screen image viewer with zoom controls (no external deps)

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.4 (App Router, React Server Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth)
- **AI Model**: Google Gemini 2.5 Flash Image Preview
- **Storage**: Vercel Blob
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 🎯 Key Features

### 1. AI Virtual Try-On
- Upload your photo and see AI-generated images of you wearing the products
- Hybrid parallel generation (priority batch + background processing)
- Real-time progress tracking: "3 of 10 ready"
- Auto-switch to generated view when first batch completes

### 2. Product Catalog
- Browse high-quality merchandise with consistent 4:5 aspect ratio images
- External purchase links (Tokopedia, Shopee, etc.)
- IDR currency formatting (Rp 100.000 - no decimals)
- Categories with AI prompt customization

### 3. Admin Dashboard
- Secure authentication with Supabase
- Full CRUD operations for products
- AI prompt management per category
- Product image uploads via Vercel Blob

### 4. Image Preview
- Full-screen image viewer with zoom controls (0.5x - 4x)
- Pan/drag when zoomed (desktop + mobile touch support)
- Mouse wheel zoom & keyboard shortcuts
- Zero external dependencies

## 📦 Quick Start

### 🚀 Automated Setup (Recommended)

```bash
# 1. Clone and install
git clone https://github.com/julianromli/aiforproductivity-merch.git
cd aiforproductivity-merch
npm install

# 2. Run interactive setup wizard
npm run setup

# 3. Start development server
npm run dev
```

**That's it!** Visit [http://localhost:3000](http://localhost:3000)

### 📖 Detailed Setup Guide

For step-by-step instructions, troubleshooting, and deployment:

👉 **[See SETUP.md](./SETUP.md)** - Complete setup guide (5 minutes)

### Prerequisites

- Node.js 18+
- Free accounts: [Google AI](https://aistudio.google.com/), [Supabase](https://supabase.com/), [Vercel](https://vercel.com/)

## 🔧 Development

```bash
# Start dev server
pnpm dev          # localhost:3000

# Type checking (IMPORTANT: Do this before commits!)
npx tsc --noEmit

# Build for production
pnpm build

# Run linter
pnpm lint
```

## 📚 Documentation

### For Users
- **[SETUP.md](./SETUP.md)** - ⭐ **START HERE** - Complete setup guide (5 minutes)
- **[docs/ADMIN_USER_GUIDE.md](./docs/ADMIN_USER_GUIDE.md)** - Admin dashboard guide (Indonesian)

### For Developers
- **[AGENTS.md](./AGENTS.md)** - AI coding agent guidelines (Cursor, Windsurf, etc.)
- **[WARP.md](./WARP.md)** - Technical reference & architecture
- **[DOKUMENTASI_AI.md](./DOKUMENTASI_AI.md)** - AI integration details (Indonesian)

### Legacy/Advanced
- **[SETUP_SUPABASE.md](./SETUP_SUPABASE.md)** - Manual database setup (advanced)

## 🚢 Deployment

### One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/julianromli/aiforproductivity-merch&env=GEMINI_API_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=API%20keys%20for%20Google%20AI%2C%20Supabase%20database%2C%20and%20authentication&envLink=https://github.com/julianromli/aiforproductivity-merch/blob/main/SETUP.md&project-name=aiforproductivity-merch&repository-name=aiforproductivity-merch)

**This will automatically:**
- Fork the repository to your GitHub
- Create a new Vercel project
- Setup Vercel Blob storage
- Prompt for environment variables
- Deploy your store

**After clicking deploy:**
1. Fill in the 4 required environment variables (see [SETUP.md](./SETUP.md))
2. Wait for deployment (~2 minutes)
3. Run database migrations in Supabase
4. Done! 🎉

### Manual Deployment

See [SETUP.md - Deploy to Production](./SETUP.md#-deploy-to-production) for manual deployment guide.

---

**Live Demo**: [https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s](https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s)

**v0.app Project**: [https://v0.app/chat/projects/KFS0eQo54K6](https://v0.app/chat/projects/KFS0eQo54K6)

## 🎨 SEO & Metadata

✅ **Optimized for search engines:**
- Title: "AI For Productivity Merchandise - Official Merch Store"
- Meta description with keywords (AI, productivity, merch)
- Open Graph tags for social media sharing
- Twitter Card support
- Proper robots directives for indexing
- Indonesian locale (id_ID) for regional optimization

## 📄 License

Private project for **AI For Productivity**.

## 🔗 Links

- **Official Website**: [https://aiforproductivity.id](https://aiforproductivity.id)
- **GitHub**: This repository
- **Deployment**: Vercel

---

**© 2025 AI For Productivity** | Built with ❤️ using Next.js 15
