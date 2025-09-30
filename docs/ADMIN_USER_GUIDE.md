# 📖 Panduan Penggunaan Admin System

**Versi:** 1.0  
**Terakhir Diupdate:** 30 Januari 2025  
**Untuk:** Pengguna Non-Programmer

---

## 🎯 Pengenalan

Selamat datang! Admin System ini adalah dashboard untuk mengelola produk dan AI prompts di toko online merchandise. Dengan sistem ini, kamu bisa:

- ✅ **Menambah produk baru** ke katalog toko
- ✅ **Mengedit informasi produk** yang sudah ada
- ✅ **Menghapus produk** yang tidak diperlukan lagi
- ✅ **Mengatur status produk** (aktif/nonaktif)
- ✅ **Mengelola AI prompts** untuk membuat gambar produk otomatis

**Tidak perlu khawatir!** Panduan ini akan menjelaskan semuanya langkah demi langkah dengan bahasa yang mudah dipahami. 🚀

---

## 🔐 1. Cara Login ke Admin Dashboard

### Langkah-Langkah Login:

1. **Buka browser** (Chrome, Firefox, Safari, atau Edge)

2. **Ketik alamat website admin** di address bar:
   ```
   https://nama-website-kamu.com/admin/login
   ```
   *(Ganti `nama-website-kamu.com` dengan domain website kamu yang sebenarnya)*

3. **Masukkan Email & Password:**
   - Email: Email yang sudah didaftarkan sebagai admin
   - Password: Password akun admin kamu
   
   > 💡 **Tips:** Pastikan password diketik dengan benar (huruf besar/kecil berpengaruh!)

4. **Klik tombol "Login"**

5. **Selesai!** Kamu akan masuk ke Dashboard Admin

### ⚠️ Troubleshooting Login:

| Masalah | Solusi |
|---------|--------|
| Email/Password salah | Periksa kembali email & password. Pastikan tidak ada typo |
| "Unauthorized" muncul | Hubungi administrator untuk memastikan akun kamu sudah terdaftar |
| Halaman tidak muncul | Periksa koneksi internet kamu |

---

## 🏠 2. Dashboard Admin

Setelah login berhasil, kamu akan melihat **Dashboard** dengan 3 kartu informasi:

### 📊 Statistik Dashboard:

1. **Total Products** 📦
   - Menampilkan jumlah total produk yang ada
   - Menunjukkan pertambahan produk dari bulan lalu

2. **Active Prompts** 💬
   - Menampilkan jumlah AI prompts yang aktif
   - Membedakan prompt custom dan default

3. **AI Generations** 📈
   - Menampilkan total gambar yang sudah digenerate oleh AI
   - Menunjukkan persentase kenaikan dari minggu lalu

### 🧭 Menu Navigasi (Sidebar):

Di sebelah kiri, ada menu untuk navigasi:

- **Dashboard** - Halaman utama dengan statistik
- **Products** - Kelola semua produk
- **Prompts** - Kelola AI prompts untuk generate gambar

---

## 🛍️ 3. Mengelola Produk

### 3.1 Melihat Daftar Produk

1. **Klik menu "Products"** di sidebar

2. **Kamu akan melihat tabel** dengan informasi:
   - **Image**: Gambar produk (thumbnail kecil)
   - **Name**: Nama produk
   - **Category**: Kategori produk (Footwear, Apparel, Accessories)
   - **Price**: Harga produk dengan mata uang (USD, EUR, IDR)
   - **Status**: Status aktif/nonaktif (badge hijau/abu-abu)
   - **Actions**: Tombol aksi (Edit & Delete)

### 3.2 Mencari & Filter Produk

#### 🔍 Search (Pencarian):

1. **Lihat kotak pencarian** di bagian atas (ada icon kaca pembesar 🔍)

2. **Ketik nama produk** yang ingin dicari
   - Contoh: "Nike Air Max"
   
3. **Hasil akan muncul otomatis** saat kamu mengetik

#### 🗂️ Filter by Category:

1. **Klik dropdown "All Categories"** di sebelah kanan kotak pencarian

2. **Pilih kategori:**
   - All Categories (tampilkan semua)
   - Footwear (sepatu)
   - Apparel (pakaian)
   - Accessories (aksesoris)

3. **Tabel akan otomatis update** menampilkan produk sesuai kategori

### 3.3 Menambah Produk Baru ➕

#### Langkah-Langkah:

1. **Klik tombol "Add Product"** (warna biru, di pojok kanan atas)

2. **Isi form Product Information:**

   **a) Product Name** *(Wajib diisi - ada tanda bintang merah)*
   - Nama produk yang akan ditampilkan
   - Contoh: "Nike Air Max 90"
   
   **b) Price** *(Wajib diisi)*
   - Harga produk (angka saja, tanpa simbol mata uang)
   - Contoh: 99.99
   - Bisa pakai desimal (gunakan titik, bukan koma)
   
   **c) Currency**
   - Pilih mata uang:
     - USD (Dollar Amerika)
     - EUR (Euro)
     - IDR (Rupiah Indonesia)
   
   **d) Category** *(Wajib diisi)*
   - Pilih salah satu:
     - Footwear (untuk sepatu)
     - Apparel (untuk baju/hoodie/celana)
     - Accessories (untuk topi/tas/aksesoris lain)
   
   **e) Description** *(Opsional)*
   - Deskripsi produk (boleh dikosongkan)
   - Contoh: "Sepatu casual dengan desain retro yang nyaman"

3. **Upload Product Image:**

   **a) Klik area upload** (kotak persegi dengan icon upload ⬆️)
   
   **b) Pilih file gambar** dari komputer kamu:
   - Format yang didukung: PNG, JPG, JPEG
   - Ukuran maksimal: 5MB
   
   **c) Tunggu proses upload** (ada loading spinner)
   
   **d) Preview gambar akan muncul** setelah upload berhasil
   
   > 💡 **Tips Gambar:**
   > - Gunakan gambar berkualitas bagus (minimal 500x500px)
   > - Background putih atau transparan lebih bagus
   > - Pastikan produk terlihat jelas
   
   **e) Jika ingin ganti gambar:**
   - Klik tombol X (merah) di pojok gambar
   - Upload gambar baru

4. **Pilih Status Produk:**
   - **Active**: Produk akan tampil di toko (customer bisa lihat)
   - **Inactive**: Produk disembunyikan dari toko

5. **Klik tombol "Create Product"** (warna biru, di bawah form)

6. **Selesai!** Kamu akan diarahkan kembali ke halaman Products

### 3.4 Mengedit Produk ✏️

#### Langkah-Langkah:

1. **Cari produk** yang ingin diedit di tabel

2. **Klik icon Pencil (✏️)** di kolom Actions

3. **Form edit akan muncul** (mirip dengan form tambah produk)

4. **Ubah informasi** yang ingin diupdate:
   - Nama produk
   - Harga
   - Kategori
   - Deskripsi
   - Gambar (klik X untuk hapus, lalu upload yang baru)
   - Status

5. **Klik tombol "Update Product"**

6. **Selesai!** Perubahan akan tersimpan

### 3.5 Menghapus Produk 🗑️

#### Langkah-Langkah:

1. **Cari produk** yang ingin dihapus di tabel

2. **Klik icon Trash (🗑️)** di kolom Actions

3. **Pop-up konfirmasi akan muncul:**
   ```
   Are you sure?
   This action cannot be undone. This will permanently 
   delete the product and all associated prompts.
   ```

4. **Baca peringatan dengan teliti:**
   - ⚠️ Produk yang dihapus **TIDAK BISA dikembalikan**
   - ⚠️ Semua AI prompts yang terkait juga akan **TERHAPUS**

5. **Pilih salah satu:**
   - **Cancel**: Batal menghapus (data aman)
   - **Delete**: Hapus permanen (produk hilang selamanya)

6. **Selesai!** Produk terhapus dari database

### 3.6 Mengubah Status Produk (Active/Inactive) 🔄

#### Cara Cepat Toggle Status:

1. **Lihat kolom "Status"** di tabel produk

2. **Kamu akan melihat badge:**
   - **Hijau "Active"**: Produk aktif & tampil di toko
   - **Abu-abu "Inactive"**: Produk nonaktif & disembunyikan

3. **Klik badge tersebut** (badge bisa diklik!)

4. **Status akan berubah otomatis:**
   - Active → Inactive (produk disembunyikan)
   - Inactive → Active (produk ditampilkan)

5. **Tidak perlu konfirmasi!** Perubahan langsung tersimpan

> 💡 **Kapan menggunakan Inactive?**
> - Produk stok habis (temporary)
> - Produk musiman (tidak dijual saat ini)
> - Testing produk baru (draft mode)

---

## 🤖 4. Mengelola AI Prompts

### Apa itu AI Prompt?

**AI Prompt** adalah "instruksi teks" yang diberikan ke AI untuk menghasilkan gambar produk secara otomatis. Dengan prompt yang bagus, AI bisa membuat gambar produk yang profesional tanpa perlu fotografer!

**Contoh Prompt:**
```
Create a professional product photography showing a 
Nike Air Max 90 sneaker on a white background with 
studio lighting, high quality, 8k resolution
```

### 4.1 Melihat Daftar Prompts

1. **Klik menu "Prompts"** di sidebar

2. **Kamu akan melihat daftar kartu (cards)** untuk setiap prompt:
   - **Nama Produk** (judul kartu)
   - **Tanggal dibuat**
   - **Badge "Default"** (jika prompt ini yang utama)
   - **Preview teks prompt** (2 baris pertama)
   - **Tombol aksi:**
     - 👁️ **Eye**: Lihat prompt lengkap
     - ✏️ **Pencil**: Edit prompt
     - 🗑️ **Trash**: Hapus prompt

### 4.2 Menambah Prompt Baru ➕

#### Langkah-Langkah:

1. **Klik tombol "Add Prompt"** (warna biru, di pojok kanan atas)

2. **Dialog form akan muncul** dengan judul "Create New Prompt"

3. **Isi form:**

   **a) Product** *(Wajib diisi)*
   - Pilih produk dari dropdown
   - Contoh: "Nike Air Max 90"
   
   > 💡 **Note:** Produk harus sudah dibuat terlebih dahulu di menu Products
   
   **b) Prompt Template** *(Wajib diisi)*
   - Ketik instruksi untuk AI
   - Gunakan bahasa Inggris untuk hasil terbaik
   - Semakin detail, semakin bagus hasilnya!
   
   **Contoh Prompt yang Bagus:**
   ```
   Professional product photography of [product name] 
   on white background, studio lighting, soft shadows, 
   high resolution 8k, commercial style, centered 
   composition, vibrant colors
   ```
   
   **Tips Menulis Prompt:**
   - ✅ Sebutkan: background, lighting, style, quality
   - ✅ Spesifik: "studio lighting" lebih baik dari "good lighting"
   - ✅ Tambahkan keywords: "professional", "high quality", "8k"
   - ❌ Jangan terlalu panjang (max 2-3 kalimat)
   
   **c) Set as default prompt** (checkbox)
   - ✅ **Centang**: Prompt ini jadi default untuk produk ini
   - ☐ **Tidak centang**: Prompt alternatif/backup

4. **Klik tombol "Create"**

5. **Selesai!** Prompt akan muncul di list

### 4.3 Mengedit Prompt ✏️

#### Langkah-Langkah:

1. **Cari prompt** yang ingin diedit

2. **Klik icon Pencil (✏️)** di pojok kanan kartu

3. **Dialog form akan muncul** dengan data yang sudah terisi

4. **Ubah yang perlu diubah:**
   - Ganti produk (jika salah)
   - Edit teks prompt (perbaiki instruksi)
   - Toggle checkbox "default"

5. **Klik tombol "Update"**

6. **Selesai!** Perubahan tersimpan

### 4.4 Preview Prompt (Lihat Full Text) 👁️

Karena prompt di list hanya menampilkan 2 baris pertama, gunakan fitur preview untuk melihat teks lengkap:

1. **Klik icon Eye (👁️)** di pojok kanan kartu

2. **Dialog preview akan muncul** menampilkan prompt lengkap

3. **Baca dengan teliti** untuk memastikan prompt sudah benar

4. **Klik di luar dialog** atau tekan ESC untuk menutup

### 4.5 Menghapus Prompt 🗑️

#### Langkah-Langkah:

1. **Cari prompt** yang ingin dihapus

2. **Klik icon Trash (🗑️)** di pojok kanan kartu

3. **Pop-up konfirmasi akan muncul:**
   ```
   Are you sure?
   This will permanently delete the prompt template.
   ```

4. **Pilih salah satu:**
   - **Cancel**: Batal menghapus
   - **Delete**: Hapus permanen (tidak bisa dibatalkan)

5. **Selesai!** Prompt terhapus

> ⚠️ **Perhatian:** Jika kamu hapus default prompt, pastikan sudah ada prompt lain untuk produk tersebut!

---

## 💡 Tips & Best Practices

### Tips Mengelola Produk:

1. **Upload Gambar Berkualitas**
   - Minimal 800x800 pixels
   - Background bersih (putih/transparan ideal)
   - Produk terlihat jelas & fokus

2. **Nama Produk yang Jelas**
   - Gunakan nama yang descriptive
   - Contoh: "Nike Air Max 90 White/Red" ✅
   - Hindari: "Product 1" ❌

3. **Gunakan Status Inactive dengan Bijak**
   - Produk tidak tampil di toko, tapi data tetap ada
   - Lebih baik dari delete jika mungkin butuh lagi

4. **Konsisten dalam Harga**
   - Pilih 1 mata uang untuk semua produk (jika bisa)
   - Atau kategorikan jelas per region

### Tips Menulis AI Prompt:

1. **Struktur Prompt yang Baik:**
   ```
   [Type of shot] of [product] on [background], 
   [lighting], [style], [quality]
   ```
   
   Contoh:
   ```
   Professional product photo of Nike Air Max 90 
   on white background, studio lighting, commercial 
   style, high resolution 8k
   ```

2. **Keywords yang Powerful:**
   - **Background:** white, gradient, studio, minimal
   - **Lighting:** soft, studio, natural, dramatic
   - **Style:** professional, commercial, editorial
   - **Quality:** 8k, high resolution, detailed, sharp

3. **Jangan Overthink!**
   - Mulai dengan prompt simple
   - Test & lihat hasilnya
   - Adjust kalau perlu

4. **Save Multiple Prompts per Product**
   - Satu default untuk variasi standar
   - Beberapa alternatif untuk style berbeda
   - Mudah switch tanpa edit

---

## ❓ Troubleshooting & FAQ

### Produk-related Issues:

**Q: Kenapa gambar tidak muncul setelah upload?**

A: Kemungkinan penyebab:
- File terlalu besar (max 5MB) → kompres gambar dulu
- Format tidak didukung → gunakan PNG atau JPG
- Koneksi internet lambat → tunggu hingga loading selesai

**Q: Saya hapus produk, tapi masih muncul di list?**

A: Refresh browser (tekan F5 atau Ctrl+R). Jika masih ada, hubungi admin teknis.

**Q: Bisa edit harga produk yang sudah ada?**

A: Ya! Klik icon Pencil (✏️) di produk, ubah harga, lalu klik "Update Product".

**Q: Produk inactive masih bisa diakses customer?**

A: Tidak. Produk inactive disembunyikan 100% dari toko. Customer tidak bisa lihat/beli.

### Prompt-related Issues:

**Q: Apa bedanya default prompt dengan prompt biasa?**

A: Default prompt adalah prompt yang otomatis dipakai saat generate gambar. Jika ada multiple prompts, yang default akan dipilih pertama kali.

**Q: Bisa punya lebih dari 1 default prompt per produk?**

A: Tidak. Hanya 1 prompt yang bisa default. Jika kamu set prompt baru jadi default, yang lama otomatis jadi non-default.

**Q: AI generate gambar jelek/aneh, apa yang salah?**

A: Kemungkinan besar prompt kurang spesifik. Coba:
1. Tambah detail lighting & background
2. Tambah keywords: "professional", "high quality"
3. Sebutkan style: "studio photography", "commercial"

**Q: Prompt ditulis bahasa Indonesia bisa?**

A: Bisa, tapi hasil lebih bagus kalau pakai bahasa Inggris. AI lebih terlatih dengan prompt English.

### General Issues:

**Q: Tiba-tiba ke-logout sendiri?**

A: Session expired (timeout). Login lagi dengan email & password yang sama.

**Q: Error "Unauthorized" muncul terus?**

A: Hubungi administrator untuk cek:
1. Akun kamu masih aktif
2. Permission admin masih ada
3. Email sudah benar

**Q: Data tidak tersimpan setelah klik "Create/Update"?**

A: Kemungkinan:
- Field yang wajib (*) belum diisi → cek pesan error merah
- Koneksi internet putus → cek koneksi
- Server error → hubungi admin teknis

---

## 📞 Bantuan Lebih Lanjut

Jika kamu mengalami masalah yang tidak tercantum di dokumentasi ini:

1. **Cek kembali langkah-langkah** di atas (baca dengan teliti)
2. **Screenshot error** jika ada pesan error
3. **Hubungi administrator teknis** dengan informasi:
   - Apa yang sedang kamu lakukan
   - Error message (jika ada)
   - Screenshot (sangat membantu)

---

## 📚 Lampiran: Glossary (Istilah Penting)

| Istilah | Artinya |
|---------|---------|
| **Admin Dashboard** | Halaman kontrol untuk admin mengelola website |
| **Active/Inactive** | Status produk: tampil/disembunyikan dari toko |
| **AI Prompt** | Instruksi teks untuk AI generate gambar |
| **Default Prompt** | Prompt utama yang otomatis dipakai untuk produk |
| **Category** | Pengelompokan produk (Footwear, Apparel, Accessories) |
| **Upload** | Proses mengunggah file dari komputer ke server |
| **Preview** | Melihat data lengkap tanpa edit |
| **Session** | Periode login (jika timeout, harus login lagi) |
| **CRUD** | Create (tambah), Read (lihat), Update (edit), Delete (hapus) |

---

## ✅ Checklist Pengelolaan Harian

Gunakan checklist ini untuk memastikan admin dashboard terkelola dengan baik:

### Daily Tasks (Setiap Hari):
- [ ] Cek apakah ada produk baru yang perlu ditambahkan
- [ ] Review produk yang inactive (masih relevan?)
- [ ] Pastikan semua gambar produk loading dengan baik

### Weekly Tasks (Setiap Minggu):
- [ ] Audit semua produk active (harga masih sesuai?)
- [ ] Test beberapa AI prompts (hasilnya masih bagus?)
- [ ] Bersihkan produk/prompt yang tidak terpakai

### Monthly Tasks (Setiap Bulan):
- [ ] Review performa prompt (mana yang sering dipakai?)
- [ ] Update prompt lama dengan keywords baru
- [ ] Backup data penting (hubungi admin teknis)

---

**🎉 Selamat! Kamu sekarang sudah paham cara menggunakan Admin System!**

Jangan ragu untuk eksperimen dan explore fitur-fitur lainnya. Sistem ini dibuat user-friendly, jadi tidak mudah untuk "merusak" sesuatu. Worst case, kamu bisa undo atau hapus data yang salah.

**Happy Managing! 🚀**

---

**Dokumentasi ini dibuat dengan ❤️ untuk memudahkan pengelolaan admin system.**

*Last Updated: 30 Januari 2025*