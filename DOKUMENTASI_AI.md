# Dokumentasi AI Integration - BytePlus SeeDream v4.5

Halo! Ini dokumentasi lengkap buat fitur AI Image Generation yang udah diintegrasikan ke aplikasi storefront kita. Fitur ini pake BytePlus SeeDream v4.5 buat generate gambar produk secara otomatis.

## Overview

Aplikasi ini punya 2 endpoint AI yang bisa generate gambar:

1. **Virtual Try-On / Model Generation** - Generate gambar orang memakai produk berdasarkan foto user + foto produk.
2. **Product Image Generation** - Generate variasi gambar produk berdasarkan prompt.

Keduanya pake model `seedream-4.5` dari BytePlus via REST API.

---

## Setup & Konfigurasi

### 1. API Key

Lo butuh API key dari BytePlus Console. Cara dapetinnya:

1. Buka [BytePlus API Key Management](https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey)
2. Login pake akun BytePlus lo
3. Klik "Create API Key"
4. Copy API key yang dikasih

### 2. Environment Variable

Tambahin environment variable ini ke project Vercel lo:

\`\`\`
BYTEPLUS_API_KEY=your_api_key_here
\`\`\`

**Cara setting di Vercel:**
- Buka project settings
- Masuk ke tab "Environment Variables"
- Tambahin variable baru dengan nama `BYTEPLUS_API_KEY`
- Paste API key lo
- Save & redeploy

---

## Endpoint 1: Virtual Try-On / Model Generation

### Path
\`\`\`
POST /api/generate-model-image
\`\`\`

### Fungsi
Generate gambar orang memakai produk berdasarkan foto user + foto produk. BytePlus bakal memproses kedua gambar tersebut dengan prompt yang sudah di-optimize.

### Request Format
\`\`\`typescript
// FormData
{
  userPhoto: File,      // Foto orang
  productImage: File,   // Foto produk
  productName: string,
  productCategory: string,
  productId: string,
  colorName?: string    // Opsional
}
\`\`\`

### Response Format
\`\`\`typescript
{
  imageUrl: string,  // Data URI image (JPEG)
  productName: string,
  usage: {
    generated_images: number,
    output_tokens: number,
    total_tokens: number
  }
}
\`\`\`

---

## Implementasi Technical

### Client Library
\`\`\`typescript
// lib/byteplus-client.ts
export async function generateImageWithByteplus(params: BytePlusGenerateParams) {
  // Menggunakan native fetch ke BytePlus REST API
}
\`\`\`

### Konfigurasi Model
- **Model**: `seedream-4.5`
- **Resolution**: `2048x2560`
- **Watermark**: `false`
- **Response Format**: `b64_json`

---

## Error Handling

### Common Errors

**1. Missing API Key**
\`\`\`
Error: BYTEPLUS_API_KEY is not configured
\`\`\`
**Solusi:** Set environment variable `BYTEPLUS_API_KEY`

**2. Invalid API Key**
\`\`\`
Status 401: API key not valid
\`\`\`
**Solusi:** Cek lagi API key lo, mungkin salah copy atau udah expired

**3. Rate Limit**
\`\`\`
Status 429: Resource exhausted
\`\`\`
**Solusi:** Tunggu beberapa saat, atau cek quota di BytePlus Console

**4. No Image Generated**
\`\`\`
Error: No image was generated in the response
\`\`\`
**Solusi:** Coba prompt yang lebih spesifik, atau cek apakah model lagi down

**5. Invalid Image Format**
\`\`\`
Error: Failed to process image
\`\`\`
**Solusi:** Pastikan gambar yang di-upload format JPEG/PNG/WebP dan ga corrupt

---

## Monitoring & Debugging

### Console Logs
Semua endpoint udah dilengkapi console.log buat debugging:

\`\`\`typescript
console.log('[BytePlus] Starting image generation')
console.log('[v0] BytePlus API key available:', !!process.env.BYTEPLUS_API_KEY)
console.log('[v0] Successfully generated model image for:', productName)
\`\`\`

Cek logs di Vercel dashboard buat troubleshooting.

### Response Time
- Virtual Try-On: ~5-15 detik (tergantung antrian API)

---

## Best Practices

### 1. Prompt Engineering
- Pake prompt yang sudah disediakan di admin dashboard.
- Fokus pada detail pakaian (fit, silhouette, color).
- Gunakan keyword "ABSOLUTELY CRITICAL - FACIAL FIDELITY" untuk menjaga kemiripan wajah.

### 2. Image Input
- Ukuran optimal: 1024x1280 (4:5 ratio).
- Format: JPEG, PNG, atau WebP.
- Hindari gambar terlalu besar (>10MB per image).

---

## Resources

- [BytePlus Ark Console](https://console.byteplus.com/ark/)
- [BytePlus SeeDream v4.5 Docs](https://docs.byteplus.com/en/docs/ModelArk/1666945)

---

## Changelog

### v1.2.0 (Current)
- Migrasi dari Google Gemini 2.5 Flash ke BytePlus SeeDream v4.5
- Upgrade resolusi output ke 2048x2560 (Ultra High Quality)
- Menggunakan REST API native fetch (menghapus dependency SDK)
- Mendukung "use cache" dan optimasi performa baru.
