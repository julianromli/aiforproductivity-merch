# 🚀 Panduan Setup Cepat untuk Pemula

**Setup lengkap dalam 10 menit - tanpa coding!**

Panduan ini dibuat khusus untuk pemilik toko yang ingin setup AI For Productivity Merch Store **tanpa perlu keahlian teknis**.

---

## 📋 Yang Perlu Disiapkan

Sebelum mulai, bikin akun di platform ini dulu (semua gratis):

1. **Akun Supabase** (Database/Basis Data)
   - Daftar di: https://supabase.com
   - Gratis: Cocok untuk pemula dan bisnis kecil

2. **Akun BytePlus Console** (Fitur AI Gambar)
   - Daftar di: https://console.byteplus.com
   - Free trial: Kuota awal 2,000 request

3. **Akun Vercel** (Opsional, untuk deploy online)
   - Daftar di: https://vercel.com
   - Gratis: Project unlimited untuk hobi

---

## 🎯 Ringkasan Proses Setup

```
1. Buat Project Supabase     (5 menit)
2. Setup Database            (2 menit) ← PALING MUDAH!
3. Dapatkan API Keys         (2 menit)
4. Konfigurasi Environment   (1 menit)
5. Jalankan Toko Online      (Selesai!)
```

---

## 📝 Langkah 1: Buat Project Supabase

### 1.1 Daftar Akun Supabase
1. Buka https://supabase.com
2. Klik **"Start your project"**
3. Login dengan GitHub (disarankan) atau email

### 1.2 Buat Project Baru
1. Klik **"New Project"**
2. Pilih organization kamu (atau buat baru)
3. Isi detail project:
   - **Name**: `toko-merch-saya` (atau nama bebas)
   - **Database Password**: Generate password yang kuat (simpan baik-baik!)
   - **Region**: Pilih yang terdekat dengan lokasi kamu (misal: Singapore)
   - **Pricing Plan**: Free
4. Klik **"Create new project"**
5. Tunggu 2-3 menit sampai setup selesai (ada loading bar)

---

## ⚡ Langkah 2: Setup Database (SUPER GAMPANG!)

### Opsi A: Setup Sekali Klik (Direkomendasikan) 🎉

**Ini cara paling mudah - cukup copy-paste sekali aja!**

1. Di Supabase Dashboard, klik **SQL Editor** (sidebar kiri)
2. Klik **"New Query"**
3. Buka file: `scripts/all-migrations.sql` di project ini (bisa pakai Notepad/VS Code)
4. **Copy seluruh isi file** (Ctrl+A untuk select all, lalu Ctrl+C)
5. **Paste ke Supabase SQL Editor** (Ctrl+V)
6. Klik tombol **"Run"** (pojok kanan bawah)
7. Tunggu 5-10 detik
8. ✅ Selesai! Akan muncul tulisan "Success. No rows returned"

**Itu aja!** Database kamu sudah lengkap dengan:
- ✅ Semua tabel database dibuat
- ✅ Data produk contoh ditambahkan
- ✅ Keamanan sudah dikonfigurasi
- ✅ Siap dipakai

### Opsi B: Script Otomatis (Alternatif)

Kalau kamu nyaman pakai terminal/command line:

```bash
# Di folder project
npm run setup
```

Ikuti petunjuk interaktif yang muncul.

---

## 🔑 Langkah 3: Dapatkan API Keys

### 3.1 Ambil Keys dari Supabase

1. Di Supabase Dashboard, klik **Settings** → **API**
2. Kamu akan lihat keys ini (jangan tutup tab ini dulu):
   - **Project URL** (dimulai dengan `https://`)
   - **anon public** key (dimulai dengan `eyJ...`)
   - **service_role** key (dimulai dengan `eyJ...`)

💡 **Tips**: Biarkan tab ini tetap terbuka, nanti butuh di Langkah 4!

### 3.2 Ambil Key BytePlus AI (SeeDream)

1. Buka https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey
2. Login dengan akun BytePlus
3. Klik **"Create API Key"**
4. Copy key-nya

---

## 🛠️ Langkah 4: Konfigurasi Environment

### 4.1 Buat File `.env.local`

1. Di folder project, cari file `.env.example`
2. Copy file itu dan rename jadi `.env.local`
3. Buka `.env.local` pakai text editor apa aja (Notepad, VS Code, dll)

### 4.2 Isi Keys-nya

Ganti nilai placeholder dengan key asli yang kamu dapat tadi:

```env
# BytePlus AI
BYTEPLUS_API_KEY=your_key_here # ← Paste BytePlus AI key di sini

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co # ← Paste Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # ← Paste anon public key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # ← Paste service_role key

# Vercel Blob (Opsional - tambahkan nanti sebelum deploy)
# BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### 4.3 Simpan File

- Save file `.env.local`
- **Penting**: Jangan share file ini ke orang lain atau upload ke GitHub!

---

## 🎉 Langkah 5: Jalankan Toko Online

### 5.1 Install Dependencies (Hanya Pertama Kali)

Buka terminal/command prompt di folder project:

```bash
npm install
```

Tunggu sampai selesai install (~2 menit).

### 5.2 Jalankan Development Server

```bash
npm run dev
```

Kamu akan lihat:

```
✓ Ready in 3.2s
○ Local:        http://localhost:3000
```

### 5.3 Buka Toko Kamu

1. Buka browser (Chrome, Firefox, dll)
2. Ketik di address bar: http://localhost:3000
3. 🎊 **Toko online kamu sudah live!**

---

## 🔐 Langkah 6: Akses Admin Panel

### 6.1 Aktifkan Email Auth di Supabase

1. Buka Supabase Dashboard → **Authentication** → **Providers**
2. Cari **Email** provider
3. Toggle ke **ON** (biasanya sudah ON by default)
4. Scroll ke bawah dan klik **"Save"**

### 6.2 Buat User Admin

1. Masih di Supabase Dashboard → **Authentication** → **Users**
2. Klik **"Add User"** → **"Create new user"**
3. Isi:
   - **Email**: Email kamu
   - **Password**: Buat password yang aman
   - Toggle **"Auto Confirm User"** ke **ON** (penting!)
4. Klik **"Create User"**

### 6.3 Login ke Admin

1. Buka: http://localhost:3000/admin/login
2. Masukkan email dan password yang tadi dibuat
3. Klik **"Sign In"**
4. 🎉 Kamu sudah masuk ke admin dashboard!

---

## 🎨 Customize Toko Kamu

Setelah login ke admin panel, kamu bisa:

### Kelola Produk (`/admin/products`)
- ✅ Tambah produk baru
- ✅ Edit detail produk
- ✅ Upload foto produk
- ✅ Set harga dan kategori
- ✅ Tambah varian warna
- ✅ Tambah link beli (Tokopedia, Shopee, dll)

### Customize Tampilan (`/admin/customize`)
- ✅ Upload logo toko
- ✅ Ganti nama website
- ✅ Pilih font/huruf
- ✅ Custom warna dan tema
- ✅ Preview real-time

### Kelola AI Prompts (`/admin/prompts`)
- ✅ Edit prompt AI untuk generate gambar
- ✅ Custom per produk
- ✅ Test berbagai style

---

## 📱 Deploy ke Production (Opsional)

### Pakai Vercel (Direkomendasikan)

1. Push code kamu ke GitHub (kalau belum punya repo, bikin dulu)
2. Buka https://vercel.com/new
3. Import repository GitHub kamu
4. Tambahkan environment variables:
   - Copy semua nilai dari `.env.local`
   - Paste ke Vercel environment settings
5. Klik **"Deploy"**
6. Tunggu 2-3 menit
7. ✅ Toko kamu sudah online!

---

## 🆘 Troubleshooting (Kalau Ada Masalah)

### ❌ "Failed to connect to Supabase"

**Solusi**:
1. Cek file `.env.local` kamu
2. Pastikan kamu copy keys yang benar dari Supabase Dashboard
3. Jangan ada spasi sebelum atau sesudah keys
4. Keys TIDAK perlu pakai tanda kutip ("")

### ❌ "Tidak ada produk yang muncul di homepage"

**Solusi**:
1. Buka Supabase Dashboard → **SQL Editor**
2. Jalankan query ini untuk cek:
   ```sql
   SELECT * FROM products;
   ```
3. Kalau kosong, jalankan ulang setup SQL dari Langkah 2

### ❌ "Tidak bisa login ke admin"

**Solusi**:
1. Cek apakah user sudah dibuat: Supabase Dashboard → **Authentication** → **Users**
2. Pastikan **"Auto Confirm User"** di-toggle ON waktu bikin user
3. Coba reset password dari Supabase Dashboard

### ❌ "Fitur AI generate gambar tidak jalan"

**Solusi**:
1. Cek `BYTEPLUS_API_KEY` di `.env.local`
2. Verifikasi key masih valid: https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey

---

## 📚 Resource Tambahan

- **Panduan Teknis Lengkap**: Lihat `SETUP.md`
- **Panduan Admin Panel**: Lihat `docs/ADMIN_USER_GUIDE.md`
- **Panduan Site Settings**: Lihat `docs/SITE_SETTINGS_TABLE.md`
- **Arsitektur System**: Lihat `ARCHITECTURE.md`

---

## 🎯 Kartu Referensi Cepat

Simpan ini untuk referensi nanti:

| Apa | Alamat |
|-----|--------|
| **Homepage** | http://localhost:3000 |
| **Login Admin** | http://localhost:3000/admin/login |
| **Dashboard Admin** | http://localhost:3000/admin |
| **Kelola Produk** | http://localhost:3000/admin/products |
| **Customize Panel** | http://localhost:3000/admin/customize |
| **AI Prompts** | http://localhost:3000/admin/prompts |
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **BytePlus Console** | https://console.byteplus.com |

---

## ✅ Setup Selesai!

Toko online AI-powered kamu sudah siap dipakai. Kamu bisa:

- ✅ Tambah dan kelola produk
- ✅ Custom tampilan toko sesuai brand
- ✅ Biarkan customer coba produk pakai AI
- ✅ Terima order lewat link eksternal (Tokopedia/Shopee)

**Butuh bantuan?** Cek bagian troubleshooting di atas atau lihat `SETUP.md` untuk dokumentasi teknis lengkap.

---

## 💡 Tips Tambahan

### Untuk Pemula Banget:

1. **Jangan takut salah** - Semua bisa di-undo/reset
2. **Test di local dulu** - Sebelum deploy online, test dulu di http://localhost:3000
3. **Backup keys** - Simpan semua API keys di tempat aman (misal: password manager)
4. **Mulai dari contoh** - Edit produk contoh yang sudah ada sebelum bikin baru

### Rekomendasi Workflow:

```
1. Setup → Test Local → Tambah Produk → Custom Tampilan → Deploy Online
```

### Keamanan:

- ❌ **JANGAN** share file `.env.local` ke siapapun
- ❌ **JANGAN** upload `.env.local` ke GitHub
- ✅ **SELALU** pakai password yang kuat
- ✅ **BACKUP** database secara berkala

---

**Terakhir Diupdate**: 31 Januari 2025  
**Tingkat Kesulitan**: ⭐ Ramah pemula  
**Waktu Dibutuhkan**: 10 menit  
**Bahasa**: 🇮🇩 Indonesia

---

> 💬 **Catatan**: Panduan ini dibuat khusus untuk non-technical users. Kalau kamu developer yang butuh panduan teknis lebih detail, lihat `SETUP.md`.
