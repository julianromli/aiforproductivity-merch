# Dokumentasi AI Integration - Gemini Image Generation

Halo! Ini dokumentasi lengkap buat fitur AI Image Generation yang udah diintegrasikan ke aplikasi storefront kita. Fitur ini pake Google Gemini API buat generate gambar produk secara otomatis.

## Overview

Aplikasi ini punya 2 endpoint AI yang bisa generate gambar:

1. **Text-to-Image** - Generate gambar dari deskripsi text aja
2. **Model-Based Generation** - Generate gambar baru berdasarkan 2 gambar referensi + prompt

Keduanya pake model `gemini-2.5-flash-image-preview` dari Google.

---

## Setup & Konfigurasi

### 1. API Key

Lo butuh API key dari Google AI Studio. Cara dapetinnya:

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login pake akun Google lo
3. Klik "Create API Key"
4. Copy API key yang dikasih

### 2. Environment Variable

Tambahin environment variable ini ke project Vercel lo:

\`\`\`
GEMINI_API_KEY=your_api_key_here
\`\`\`

**Cara setting di Vercel:**
- Buka project settings
- Masuk ke tab "Environment Variables"
- Tambahin variable baru dengan nama `GEMINI_API_KEY`
- Paste API key lo
- Save & redeploy

---

## Endpoint 1: Text-to-Image Generation

### Path
\`\`\`
POST /api/generate-image
\`\`\`

### Fungsi
Generate gambar produk dari deskripsi text doang. Cocok buat bikin mockup produk cepet atau eksplorasi ide visual.

### Request Format
\`\`\`typescript
// FormData
{
  prompt: string  // Deskripsi gambar yang mau di-generate
}
\`\`\`

### Contoh Request
\`\`\`javascript
const formData = new FormData()
formData.append('prompt', 'Nike running shoes, red and white color, studio lighting, product photography')

const response = await fetch('/api/generate-image', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log(data.image) // Base64 image string
\`\`\`

### Response Format
\`\`\`typescript
{
  image: string  // Base64-encoded JPEG image
}
\`\`\`

### Tips Prompt yang Bagus
- Sebutin detail produk (warna, material, style)
- Tambahin konteks lighting ("studio lighting", "natural light")
- Sebutin style foto ("product photography", "lifestyle shot")
- Makin spesifik, makin bagus hasilnya

**Contoh prompt bagus:**
\`\`\`
"White sneakers with blue swoosh logo, minimalist design, 
studio lighting, clean white background, product photography"
\`\`\`

---

## Endpoint 2: Model-Based Image Generation

### Path
\`\`\`
POST /api/generate-model-image
\`\`\`

### Fungsi
Generate gambar baru berdasarkan 2 gambar referensi yang lo upload + prompt text. Gemini bakal "belajar" dari kedua gambar itu dan bikin variasi baru sesuai prompt lo.

### Request Format
\`\`\`typescript
// FormData
{
  prompt: string,      // Instruksi untuk generate gambar baru
  image1: File,        // Gambar referensi pertama
  image2: File         // Gambar referensi kedua
}
\`\`\`

### Contoh Request
\`\`\`javascript
const formData = new FormData()
formData.append('prompt', 'Combine the style of both shoes into a new design')
formData.append('image1', file1) // File object dari input
formData.append('image2', file2) // File object dari input

const response = await fetch('/api/generate-model-image', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log(data.image) // Base64 image string
\`\`\`

### Response Format
\`\`\`typescript
{
  image: string  // Base64-encoded JPEG image
}
\`\`\`

### Use Cases
- **Style Transfer**: "Combine the color scheme of image 1 with the design of image 2"
- **Product Variations**: "Create a new shoe design inspired by both images"
- **Color Remixing**: "Apply the colors from image 1 to the product in image 2"
- **Design Fusion**: "Merge the patterns from both images into one cohesive design"

### Tips Buat Hasil Maksimal
1. **Pilih gambar yang relevan** - Kedua gambar sebaiknya produk sejenis
2. **Kualitas gambar** - Pake gambar yang jelas, ga blur
3. **Prompt yang spesifik** - Jelasin apa yang lo mau dari kombinasi kedua gambar
4. **Eksperimen** - Coba berbagai kombinasi gambar dan prompt

---

## Implementasi Technical

### Package yang Dipake
\`\`\`json
{
  "@google/generative-ai": "^0.21.0"
}
\`\`\`

### Struktur Kode

**Inisialisasi Client:**
\`\`\`typescript
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-image-preview" 
})
\`\`\`

**Format Request ke Gemini:**
\`\`\`typescript
const result = await model.generateContent({
  contents: [{
    role: "user",
    parts: [
      { text: prompt },
      // Optional: gambar dalam format base64
      { 
        inlineData: { 
          mimeType: "image/jpeg", 
          data: base64String 
        } 
      }
    ]
  }]
})
\`\`\`

**Parsing Response:**
\`\`\`typescript
// Cari part yang berisi gambar
const imagePart = result.response.candidates[0].content.parts.find(
  part => part.inlineData?.mimeType?.startsWith('image/')
)

const base64Image = imagePart.inlineData.data
\`\`\`

---

## Error Handling

### Common Errors

**1. Missing API Key**
\`\`\`
Error: GEMINI_API_KEY is not configured
\`\`\`
**Solusi:** Set environment variable `GEMINI_API_KEY`

**2. Invalid API Key**
\`\`\`
Status 401: API key not valid
\`\`\`
**Solusi:** Cek lagi API key lo, mungkin salah copy atau udah expired

**3. Rate Limit**
\`\`\`
Status 429: Resource exhausted
\`\`\`
**Solusi:** Tunggu beberapa saat, atau upgrade quota di Google AI Studio

**4. No Image Generated**
\`\`\`
Error: No image was generated in the response
\`\`\`
**Solusi:** Coba prompt yang lebih spesifik, atau cek apakah model lagi down

**5. Invalid Image Format**
\`\`\`
Error: Failed to process image
\`\`\`
**Solusi:** Pastikan gambar yang di-upload format JPEG/PNG dan ga corrupt

---

## Monitoring & Debugging

### Console Logs
Semua endpoint udah dilengkapi console.log buat debugging:

\`\`\`typescript
console.log('[v0] Generating image with prompt:', prompt)
console.log('[v0] Image generated successfully')
console.log('[v0] Gemini API error:', error)
\`\`\`

Cek logs di Vercel dashboard buat troubleshooting.

### Response Time
- Text-to-image: ~3-8 detik
- Model-based: ~5-12 detik (tergantung ukuran gambar)

---

## Best Practices

### 1. Prompt Engineering
- Pake bahasa Inggris buat hasil lebih konsisten
- Sebutin style, lighting, dan konteks
- Hindari prompt yang terlalu abstrak

### 2. Image Input
- Ukuran optimal: 512x512 sampai 1024x1024
- Format: JPEG atau PNG
- Hindari gambar terlalu besar (>5MB)

### 3. Error Handling
- Selalu handle error dengan try-catch
- Kasih feedback yang jelas ke user
- Implement retry logic untuk network errors

### 4. Performance
- Compress gambar sebelum upload
- Implement loading states di UI
- Consider caching hasil generation

---

## Contoh Implementasi di Frontend

\`\`\`typescript
'use client'

import { useState } from 'react'

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateImage = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      setImage(data.image)
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert('Gagal generate gambar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your product..."
      />
      <button onClick={generateImage} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {image && (
        <img src={`data:image/jpeg;base64,${image}`} alt="Generated" />
      )}
    </div>
  )
}
\`\`\`

---

## Limitasi & Considerations

### Limitasi Model
- Ga bisa generate text di dalam gambar dengan akurat
- Hasil bisa bervariasi (non-deterministic)
- Kadang perlu beberapa kali generate buat hasil optimal

### Quota & Pricing
- Free tier: 15 requests per minute
- Cek [Google AI Pricing](https://ai.google.dev/pricing) buat detail lengkap
- Monitor usage di Google AI Studio dashboard

### Content Policy
- Model punya content filter buat konten inappropriate
- Prompt yang melanggar policy bakal di-reject
- Baca [Google's Usage Policy](https://ai.google.dev/gemini-api/terms) buat detail

---

## Troubleshooting

### Gambar Ga Sesuai Ekspektasi
1. Coba prompt yang lebih detail dan spesifik
2. Tambahin konteks style dan lighting
3. Generate beberapa kali dengan variasi prompt
4. Pake reference images yang lebih jelas (untuk model-based)

### Response Lambat
1. Cek koneksi internet
2. Cek status Google AI API di [status page](https://status.cloud.google.com/)
3. Consider implement timeout di client side
4. Optimize ukuran gambar input

### Error Terus-terusan
1. Verify API key masih valid
2. Cek quota belum habis
3. Cek logs di Vercel dashboard
4. Test endpoint pake Postman/curl dulu

---

## Resources

- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Image Generation Guide](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google AI Studio](https://aistudio.google.com/)
- [Pricing Info](https://ai.google.dev/pricing)

---

## Changelog

### v1.0.0 (Current)
- Migrasi dari Vercel AI SDK ke Google GenAI SDK
- Support text-to-image generation
- Support model-based generation dengan 2 gambar referensi
- Pake model `gemini-2.5-flash-image-preview`
- Base64 image response format

---

Kalo ada pertanyaan atau issue, feel free buat open issue atau contact developer. Happy generating! 🚀
