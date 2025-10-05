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

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Google AI API key (Gemini)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/aiforproductivity-merch.git
cd aiforproductivity-merch

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations (see SETUP_SUPABASE.md)
# Then start dev server
pnpm dev
```

### Environment Variables

Create `.env.local` with:

```bash
# Google AI
GEMINI_API_KEY=your_google_ai_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vercel Blob (auto-configured in production)
BLOB_READ_WRITE_TOKEN=your_blob_token
```

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

- **[WARP.md](./WARP.md)** - Complete project knowledge base (technical reference)
- **[AGENTS.md](./AGENTS.md)** - AI agent configuration & quick commands
- **[SETUP_SUPABASE.md](./SETUP_SUPABASE.md)** - Database setup guide
- **[DOKUMENTASI_AI.md](./DOKUMENTASI_AI.md)** - AI integration guide (Indonesian)
- **[docs/ADMIN_USER_GUIDE.md](./docs/ADMIN_USER_GUIDE.md)** - Admin dashboard guide (Indonesian)

## 🚢 Deployment

**Live Site**: [https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s](https://vercel.com/faiz-intifadas-projects-666b7de0/v0-storefront-w-nano-banana-ai-s)

**v0.app Project**: [https://v0.app/chat/projects/KFS0eQo54K6](https://v0.app/chat/projects/KFS0eQo54K6)

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [Deployment Checklist](./WARP.md#-deployment) for details.

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
