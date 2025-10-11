# Setup Supabase untuk Admin Dashboard

## Step 1: Jalankan SQL Scripts di Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Klik **SQL Editor** di sidebar kiri
3. Jalankan script-script berikut secara berurutan:

### Script 1: Create Tables
Copy paste isi file `scripts/01-create-tables.sql` dan klik **Run**

### Script 2: Seed Categories  
Copy paste isi file `scripts/02-seed-categories.sql` dan klik **Run**

### Script 3: Migrate Products
Copy paste isi file `scripts/03-migrate-products.sql` dan klik **Run**

### Script 4: Seed Default Prompts
Copy paste isi file `scripts/04-seed-default-prompts.sql` dan klik **Run**

## Step 2: Tambahkan Environment Variables di Vercel

Buka Project Settings di Vercel dan tambahkan environment variables berikut:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

**Note:** See `.env.example` for a complete template with detailed comments.

## Step 3: Install Supabase Package

Jalankan command berikut di terminal (atau akan otomatis terinstall saat deploy):

\`\`\`bash
npm install @supabase/supabase-js
\`\`\`

## Step 4: Verifikasi Setup

Setelah semua script dijalankan, cek di Supabase Dashboard:

1. Buka **Table Editor**
2. Pastikan ada 3 tables: `products`, `ai_prompts`, `categories`
3. Cek table `products` - harusnya ada 6 products
4. Cek table `categories` - harusnya ada 4 categories
5. Cek table `ai_prompts` - harusnya ada 6 prompts (satu untuk setiap product)

## Step 5: Test Connection

Setelah environment variables ditambahkan, restart development server:

\`\`\`bash
npm run dev
\`\`\`

Database sudah siap! Next step adalah membuat API routes untuk CRUD operations.

## Database Schema Overview

### Products Table
- `id` - UUID primary key
- `name` - Nama produk
- `price` - Harga (decimal)
- `currency` - Mata uang (default: USD)
- `category` - Kategori produk
- `description` - Deskripsi produk
- `image_url` - URL gambar produk
- `is_active` - Status aktif/nonaktif
- `sort_order` - Urutan tampilan
- `created_at`, `updated_at` - Timestamps

### AI Prompts Table
- `id` - UUID primary key
- `product_id` - Foreign key ke products
- `prompt_template` - Template prompt untuk AI
- `is_default` - Apakah ini default prompt
- `created_at`, `updated_at` - Timestamps

### Categories Table
- `id` - UUID primary key
- `name` - Nama kategori
- `slug` - URL-friendly name
- `prompt_instructions` - Default prompt untuk kategori
- `created_at` - Timestamp

## Security

- Row Level Security (RLS) sudah diaktifkan
- Public hanya bisa read active products
- Service role punya full access untuk admin operations
- Semua write operations harus pakai service role key
