# Gemini to BytePlus SeeDream v4.5 Migration Implementation Plan

> **For Droid:** REQUIRED SUB-SKILL: Use `executing-plans` skill to implement this plan task-by-task.

**Goal:** Migrate from Google Gemini 2.5 Flash to BytePlus SeeDream v4.5 for AI-powered product image generation.

**Architecture:** Replace Gemini SDK with BytePlus REST API client, update environment validation, modify two API routes (`/api/generate-image` and `/api/generate-model-image`), remove deprecated dependencies, update documentation.

**Tech Stack:** Next.js 15, TypeScript 5, BytePlus SeeDream v4.5 REST API, Native Fetch API

**Design Reference:** `docs/plans/2025-12-18-gemini-to-byteplus-migration-design.md`

---

## Task 1: Update Environment Configuration

**Files:**
- Modify: `.env.example`
- Modify: `lib/env-validator.ts`

### Step 1: Update .env.example to replace Gemini with BytePlus

**File:** `.env.example`

Find and replace the Gemini section (lines 9-13):

```bash
# OLD - REMOVE
# ===================
# 🤖 GOOGLE AI (Required)
# ===================
# Used for AI-powered virtual try-on feature
# Get your API key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_google_ai_api_key_here
```

With BytePlus configuration:

```bash
# NEW - ADD
# ===================
# 🤖 BYTEPLUS AI (Required)
# ===================
# Used for AI-powered virtual try-on feature with SeeDream v4.5
# Get your API key: https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey
BYTEPLUS_API_KEY=your_byteplus_api_key_here
```

Expected: `.env.example` now references BytePlus instead of Gemini.

### Step 2: Update env-validator.ts to validate BYTEPLUS_API_KEY

**File:** `lib/env-validator.ts`

Find the ENV_VARIABLES array (line 17) and replace the Gemini entry:

```typescript
// OLD - REMOVE
{
  name: 'GEMINI_API_KEY',
  required: true,
  description: 'Google AI API key for virtual try-on feature',
  setupUrl: 'https://aistudio.google.com/app/apikey',
},
```

With BytePlus entry:

```typescript
// NEW - ADD
{
  name: 'BYTEPLUS_API_KEY',
  required: true,
  description: 'BytePlus SeeDream API key for virtual try-on feature',
  setupUrl: 'https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey',
},
```

Expected: Environment validator now checks for BYTEPLUS_API_KEY.

### Step 3: Verify environment validation

Run environment validation:

```bash
npm run validate
```

Expected output:
```
✅ BYTEPLUS_API_KEY - Configured
✅ NEXT_PUBLIC_SUPABASE_URL - Configured
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY - Configured
✅ SUPABASE_SERVICE_ROLE_KEY - Configured
```

If BYTEPLUS_API_KEY is missing from .env.local, you'll see:
```
❌ BYTEPLUS_API_KEY - Missing
```

### Step 4: Commit environment configuration changes

```bash
git add .env.example lib/env-validator.ts
git commit -m "feat: replace Gemini with BytePlus environment configuration"
```

Expected: Clean commit with no errors.

---

## Task 2: Create BytePlus Client Library

**Files:**
- Create: `lib/byteplus-client.ts`

### Step 1: Create BytePlus client with TypeScript types

**File:** `lib/byteplus-client.ts` (new file)

```typescript
/**
 * BytePlus SeeDream v4.5 Client
 * 
 * REST API client for BytePlus image generation service.
 * Replaces Google Gemini 2.5 Flash SDK.
 */

const BYTEPLUS_ENDPOINT = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations"

interface BytePlusImageInput {
  data: string        // Base64 string
  mimeType: string   // e.g., "image/png", "image/jpeg"
}

interface BytePlusGenerateParams {
  prompt: string
  images: BytePlusImageInput[]
}

interface BytePlusResponse {
  model: string
  created: number
  data: Array<{
    b64_json: string
    size: string
  }>
  usage: {
    generated_images: number
    output_tokens: number
    total_tokens: number
  }
}

interface BytePlusError {
  error: {
    code: string
    message: string
  }
}

interface GenerateResult {
  imageUrl?: string
  error?: string
  usage?: {
    generated_images: number
    output_tokens: number
    total_tokens: number
  }
}

/**
 * Generate image using BytePlus SeeDream v4.5
 * 
 * @param params - Prompt and array of input images
 * @returns Generated image as data URI or error message
 */
export async function generateImageWithByteplus(
  params: BytePlusGenerateParams
): Promise<GenerateResult> {
  try {
    console.log("[BytePlus] Starting image generation")
    console.log("[BytePlus] Prompt length:", params.prompt.length)
    console.log("[BytePlus] Number of input images:", params.images.length)

    // Validate API key
    if (!process.env.BYTEPLUS_API_KEY) {
      console.error("[BytePlus] API key not configured")
      return { error: "BytePlus API key not configured" }
    }

    // Convert images to data URI format
    const imageDataUris = params.images.map(img => 
      `data:${img.mimeType};base64,${img.data}`
    )

    console.log("[BytePlus] Sending request to BytePlus API...")

    const response = await fetch(BYTEPLUS_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BYTEPLUS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "seedream-4.5",
        prompt: params.prompt,
        image: imageDataUris,
        size: "2048x2560",
        sequential_image_generation: "disabled",
        watermark: false,
        response_format: "b64_json",
        optimize_prompt_options: {
          mode: "fast"
        }
      })
    })

    console.log("[BytePlus] Response status:", response.status)

    // Handle error responses
    if (!response.ok) {
      const errorData: BytePlusError = await response.json()
      console.error("[BytePlus] API error:", errorData)

      switch (response.status) {
        case 400:
          return { 
            error: "Invalid image or prompt", 
          }
        case 401:
          return { error: "BytePlus API authentication failed" }
        case 429:
          return { error: "Rate limit exceeded, please try again later" }
        case 500:
          return { error: "BytePlus service error, please retry" }
        default:
          return { 
            error: errorData.error?.message || "Failed to generate image" 
          }
      }
    }

    // Parse successful response
    const result: BytePlusResponse = await response.json()

    console.log("[BytePlus] Response received")
    console.log("[BytePlus] Generated images:", result.data?.length || 0)

    // Validate response data
    if (!result.data || result.data.length === 0) {
      console.error("[BytePlus] No image data in response")
      return { error: "No image was generated" }
    }

    if (!result.data[0].b64_json) {
      console.error("[BytePlus] Missing b64_json in response")
      return { error: "No image data in response" }
    }

    // Convert to data URI format
    const base64Image = `data:image/jpeg;base64,${result.data[0].b64_json}`
    console.log("[BytePlus] Image generated successfully")
    console.log("[BytePlus] Image size:", result.data[0].size)
    console.log("[BytePlus] Usage:", result.usage)

    return {
      imageUrl: base64Image,
      usage: result.usage
    }

  } catch (error) {
    console.error("[BytePlus] Generation error:", error)
    console.error("[BytePlus] Error type:", typeof error)
    console.error("[BytePlus] Error message:", error instanceof Error ? error.message : String(error))
    
    return { 
      error: error instanceof Error ? error.message : "Failed to generate image" 
    }
  }
}
```

Expected: New file created with complete BytePlus client implementation.

### Step 2: Verify TypeScript compilation

```bash
npx tsc --noEmit
```

Expected: No type errors.

### Step 3: Commit BytePlus client

```bash
git add lib/byteplus-client.ts
git commit -m "feat: add BytePlus SeeDream v4.5 API client"
```

Expected: Clean commit.

---

## Task 3: Update /api/generate-image Route

**Files:**
- Modify: `app/api/generate-image/route.ts`

### Step 1: Remove Gemini imports and add BytePlus client

**File:** `app/api/generate-image/route.ts`

At the top of the file (lines 1-2), remove:

```typescript
// REMOVE
import { GoogleGenAI } from "@google/genai"
```

Add BytePlus client import:

```typescript
// ADD
import { generateImageWithByteplus } from "@/lib/byteplus-client"
```

Update the console log (line 4):

```typescript
// OLD
console.log("[v0] Gemini API key available:", !!process.env.GEMINI_API_KEY)

// NEW
console.log("[v0] BytePlus API key available:", !!process.env.BYTEPLUS_API_KEY)
```

Expected: Imports updated to use BytePlus client.

### Step 2: Replace Gemini generation call with BytePlus

**File:** `app/api/generate-image/route.ts`

Find the Gemini generation code (around lines 65-92) and remove:

```typescript
// REMOVE THIS ENTIRE BLOCK
console.log("[v0] Initializing Google GenAI SDK...")
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const base64Image1 = convertedImage1.buffer.toString("base64")
const base64Image2 = convertedImage2.buffer.toString("base64")

console.log("[v0] Preparing to call generateContent with Google GenAI...")
const result = await genAI.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: [
    {
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: convertedImage1.mimeType,
            data: base64Image1,
          },
        },
        {
          inlineData: {
            mimeType: convertedImage2.mimeType,
            data: base64Image2,
          },
        },
      ],
    },
  ],
  config: {
    responseModalities: ["IMAGE"],
    imageConfig: {
      aspectRatio: "4:5",
    },
  },
})

console.log("[v0] generateContent completed")

console.log("[v0] Response candidates:", result.candidates?.length || 0)

if (!result.candidates || result.candidates.length === 0) {
  console.log("[v0] No candidates in response")
  return NextResponse.json({ error: "No image was generated" }, { status: 500 })
}

const candidate = result.candidates[0]
const parts = candidate.content?.parts
console.log("[v0] Parts in response:", parts?.length || 0)

const imagePart = parts?.find((part: any) => part.inlineData && part.inlineData.mimeType?.startsWith("image/"))

if (!imagePart?.inlineData?.data) {
  console.log("[v0] No image data found in response")
  return NextResponse.json({ error: "No image was generated" }, { status: 500 })
}

console.log("[v0] Image data found, mimeType:", imagePart.inlineData.mimeType)

const base64Image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
console.log("[v0] Base64 image created, length:", base64Image.length)

// Extract text if available
const textPart = parts?.find((part: any) => part.text)
const generatedText = textPart?.text || ""

console.log("[v0] Successfully generated image")
console.log("[v0] Usage metadata:", result.usageMetadata)

return NextResponse.json({
  imageUrl: base64Image,
  text: generatedText,
  usage: result.usageMetadata,
})
```

Replace with BytePlus generation:

```typescript
// ADD THIS NEW BLOCK
const base64Image1 = convertedImage1.buffer.toString("base64")
const base64Image2 = convertedImage2.buffer.toString("base64")

console.log("[v0] Calling BytePlus SeeDream v4.5 API...")
const result = await generateImageWithByteplus({
  prompt: prompt,
  images: [
    { data: base64Image1, mimeType: convertedImage1.mimeType },
    { data: base64Image2, mimeType: convertedImage2.mimeType }
  ]
})

if (result.error) {
  console.log("[v0] BytePlus generation error:", result.error)
  return NextResponse.json({ error: result.error }, { status: 500 })
}

console.log("[v0] Successfully generated image")
console.log("[v0] Usage metadata:", result.usage)

return NextResponse.json({
  imageUrl: result.imageUrl,
  text: "", // BytePlus doesn't return text (compatibility with frontend)
  usage: result.usage,
})
```

Expected: Gemini code replaced with BytePlus client call.

### Step 3: Verify TypeScript compilation

```bash
npx tsc --noEmit
```

Expected: No type errors.

### Step 4: Commit generate-image route changes

```bash
git add app/api/generate-image/route.ts
git commit -m "feat: migrate /api/generate-image to BytePlus SeeDream v4.5"
```

Expected: Clean commit.

---

## Task 4: Update /api/generate-model-image Route

**Files:**
- Modify: `app/api/generate-model-image/route.ts`

### Step 1: Remove Gemini imports and add BytePlus client

**File:** `app/api/generate-model-image/route.ts`

At the top of the file (lines 1-3), remove:

```typescript
// REMOVE
import { GoogleGenAI } from "@google/genai"
```

Add BytePlus client import:

```typescript
// ADD
import { generateImageWithByteplus } from "@/lib/byteplus-client"
```

Update the console log (line 5):

```typescript
// OLD
console.log("[v0] Gemini API key available:", !!process.env.GEMINI_API_KEY)

// NEW
console.log("[v0] BytePlus API key available:", !!process.env.BYTEPLUS_API_KEY)
```

Expected: Imports updated to use BytePlus client.

### Step 2: Replace Gemini generation call with BytePlus

**File:** `app/api/generate-model-image/route.ts`

Find the Gemini generation code (around lines 207-264) and remove:

```typescript
// REMOVE THIS ENTIRE BLOCK
console.log("[v0] Initializing Google GenAI SDK...")
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const base64UserPhoto = convertedUserPhoto.buffer.toString("base64")
const base64ProductImage = convertedProductImage.buffer.toString("base64")

console.log("[v0] Preparing to call generateContent with Google GenAI...")
const result = await genAI.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: [
    {
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: convertedUserPhoto.mimeType,
            data: base64UserPhoto,
          },
        },
        {
          inlineData: {
            mimeType: convertedProductImage.mimeType,
            data: base64ProductImage,
          },
        },
      ],
    },
  ],
  config: {
    responseModalities: ["IMAGE"],
    imageConfig: {
      aspectRatio: "4:5",
    },
  },
})

console.log("[v0] generateContent completed")

console.log("[v0] Response candidates:", result.candidates?.length || 0)

if (!result.candidates || result.candidates.length === 0) {
  console.log("[v0] No candidates in response")
  return NextResponse.json({ error: "No image was generated" }, { status: 500 })
}

const candidate = result.candidates[0]
const parts = candidate.content?.parts
console.log("[v0] Parts in response:", parts?.length || 0)

const imagePart = parts?.find((part: any) => part.inlineData && part.inlineData.mimeType?.startsWith("image/"))

if (!imagePart?.inlineData?.data) {
  console.log("[v0] No image data found in response")
  return NextResponse.json({ error: "No image was generated" }, { status: 500 })
}

console.log("[v0] Image data found, mimeType:", imagePart.inlineData.mimeType)

const base64Image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
console.log("[v0] Base64 image created, length:", base64Image.length)

console.log("[v0] Successfully generated model image for:", productName)
console.log("[v0] Usage metadata:", result.usageMetadata)

return NextResponse.json({
  imageUrl: base64Image,
  productName,
  usage: result.usageMetadata,
})
```

Replace with BytePlus generation:

```typescript
// ADD THIS NEW BLOCK
const base64UserPhoto = convertedUserPhoto.buffer.toString("base64")
const base64ProductImage = convertedProductImage.buffer.toString("base64")

console.log("[v0] Calling BytePlus SeeDream v4.5 API...")
const result = await generateImageWithByteplus({
  prompt: prompt,
  images: [
    { data: base64UserPhoto, mimeType: convertedUserPhoto.mimeType },
    { data: base64ProductImage, mimeType: convertedProductImage.mimeType }
  ]
})

if (result.error) {
  console.log("[v0] BytePlus generation error:", result.error)
  return NextResponse.json({ error: result.error }, { status: 500 })
}

console.log("[v0] Successfully generated model image for:", productName)
console.log("[v0] Usage metadata:", result.usage)

return NextResponse.json({
  imageUrl: result.imageUrl,
  productName,
  usage: result.usage,
})
```

Expected: Gemini code replaced with BytePlus client call.

### Step 3: Verify TypeScript compilation

```bash
npx tsc --noEmit
```

Expected: No type errors.

### Step 4: Commit generate-model-image route changes

```bash
git add app/api/generate-model-image/route.ts
git commit -m "feat: migrate /api/generate-model-image to BytePlus SeeDream v4.5"
```

Expected: Clean commit.

---

## Task 5: Remove Gemini Dependencies

**Files:**
- Modify: `package.json`

### Step 1: Remove @google/genai package

```bash
npm uninstall @google/genai
```

Expected output:
```
removed 1 package, and audited X packages in Ys

found 0 vulnerabilities
```

This will automatically update `package.json` and `package-lock.json`.

### Step 2: Verify package.json no longer references Gemini

```bash
grep -i "genai\|gemini" package.json
```

Expected: No matches (empty output).

### Step 3: Verify TypeScript compilation after dependency removal

```bash
npx tsc --noEmit
```

Expected: No type errors.

### Step 4: Commit dependency changes

```bash
git add package.json package-lock.json
git commit -m "chore: remove @google/genai dependency"
```

Expected: Clean commit.

---

## Task 6: Validation Testing

**Files:**
- None (testing only)

### Step 1: Run environment validation

```bash
npm run validate
```

Expected output:
```
✅ BYTEPLUS_API_KEY - Configured
✅ NEXT_PUBLIC_SUPABASE_URL - Configured
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY - Configured
✅ SUPABASE_SERVICE_ROLE_KEY - Configured
⚠️  BLOB_READ_WRITE_TOKEN - Missing (optional for local dev)
```

### Step 2: Run TypeScript type checking

```bash
npx tsc --noEmit
```

Expected: No errors (exit code 0).

### Step 3: Run linting

```bash
npm run lint
```

Expected: No warnings or errors.

### Step 4: Test build (verify no build errors)

```bash
npm run build
```

Expected: Build succeeds. Check console output for any TypeScript errors (build has `ignoreBuildErrors: true`, so verify manually).

### Step 5: Manual API testing (optional but recommended)

Start dev server:

```bash
npm run dev
```

Test `/api/generate-model-image`:
1. Navigate to admin dashboard
2. Go to product creation page
3. Upload user photo + product image
4. Click "Generate Model Image"
5. Verify: Image generates successfully with 2048x2560 resolution
6. Verify: No watermark visible
7. Check browser console for BytePlus logs

If all tests pass, stop dev server (Ctrl+C).

---

## Task 7: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `SETUP.md`
- Modify: `DOKUMENTASI_AI.md`
- Modify: `DEBUG_IMAGE_GENERATION.md`
- Modify: `ARCHITECTURE.md`

### Step 1: Update README.md

**File:** `README.md`

Find references to Gemini (search for "Gemini" or "Google AI") and replace with BytePlus.

Typical changes:
- "Gemini 2.5 Flash" → "BytePlus SeeDream v4.5"
- "Google AI SDK" → "BytePlus REST API"
- Update setup instructions to reference BytePlus API key

Expected: All Gemini references replaced with BytePlus.

### Step 2: Update SETUP.md

**File:** `SETUP.md`

Find the Google AI section and replace with BytePlus instructions:

```markdown
# OLD
## Google AI Setup

1. Visit https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add to `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

# NEW
## BytePlus AI Setup

1. Visit https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey
2. Create a new API key
3. Add to `.env.local`:
   ```
   BYTEPLUS_API_KEY=your_api_key_here
   ```
```

Expected: Setup guide updated for BytePlus.

### Step 3: Update DOKUMENTASI_AI.md (Indonesian)

**File:** `DOKUMENTASI_AI.md`

Similar changes as SETUP.md, but in Indonesian:

```markdown
# OLD
## Setup Google AI

1. Kunjungi https://aistudio.google.com/app/apikey
2. Buat API key baru
3. Tambahkan ke `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

# NEW
## Setup BytePlus AI

1. Kunjungi https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey
2. Buat API key baru
3. Tambahkan ke `.env.local`:
   ```
   BYTEPLUS_API_KEY=your_api_key_here
   ```
```

Expected: Indonesian docs updated for BytePlus.

### Step 4: Update DEBUG_IMAGE_GENERATION.md

**File:** `DEBUG_IMAGE_GENERATION.md`

Update debugging guide with BytePlus error codes and API reference:

Add BytePlus error codes section:
```markdown
## BytePlus API Error Codes

- **400**: Invalid request (missing fields, invalid image format)
- **401**: Authentication failed (invalid API key)
- **429**: Rate limit exceeded
- **500**: Internal server error

## Debugging Steps

1. Check `BYTEPLUS_API_KEY` is set in `.env.local`
2. Verify API key is valid at https://console.byteplus.com
3. Check browser console for `[BytePlus]` logs
4. Verify image sizes are within limits (max 10MB per image)
5. Check BytePlus API documentation: https://docs.byteplus.com/en/docs/ModelArk/1666945
```

Expected: Debugging guide updated for BytePlus.

### Step 5: Update ARCHITECTURE.md

**File:** `ARCHITECTURE.md`

Find AI integration section and update:

```markdown
# OLD
### AI Integration

- **Provider**: Google Gemini 2.5 Flash
- **SDK**: `@google/genai`
- **Usage**: Virtual try-on feature

# NEW
### AI Integration

- **Provider**: BytePlus SeeDream v4.5
- **API**: REST API (native fetch)
- **Endpoint**: https://ark.ap-southeast.bytepluses.com/api/v3/images/generations
- **Client**: `lib/byteplus-client.ts`
- **Usage**: Virtual try-on feature with 2048x2560 resolution
```

Expected: Architecture docs reflect BytePlus integration.

### Step 6: Verify all documentation updates

Search for remaining Gemini references:

```bash
grep -ri "gemini\|google ai" *.md docs/*.md
```

Expected: Only matches in this plan file and the design document (those are intentional).

### Step 7: Commit documentation changes

```bash
git add README.md SETUP.md DOKUMENTASI_AI.md DEBUG_IMAGE_GENERATION.md ARCHITECTURE.md
git commit -m "docs: update documentation for BytePlus SeeDream v4.5 migration"
```

Expected: Clean commit.

---

## Task 8: Final Verification & Deployment

**Files:**
- None (verification only)

### Step 1: Run full test suite

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Expected: All checks pass.

### Step 2: Verify git status is clean

```bash
git status
```

Expected output:
```
On branch main
Your branch is ahead of 'origin/main' by X commits.
nothing to commit, working tree clean
```

### Step 3: Review commit history

```bash
git log --oneline -10
```

Expected: See all migration commits in order:
1. "feat: replace Gemini with BytePlus environment configuration"
2. "feat: add BytePlus SeeDream v4.5 API client"
3. "feat: migrate /api/generate-image to BytePlus SeeDream v4.5"
4. "feat: migrate /api/generate-model-image to BytePlus SeeDream v4.5"
5. "chore: remove @google/genai dependency"
6. "docs: update documentation for BytePlus SeeDream v4.5 migration"

### Step 4: Create summary commit (optional)

If you want a single commit summarizing the migration:

```bash
# Create a new branch for the migration
git checkout -b feat/migrate-to-byteplus

# Squash all commits (use interactive rebase if needed)
git rebase -i HEAD~6

# Or push as-is
git push -u origin feat/migrate-to-byteplus
```

Expected: Migration commits ready for review/merge.

### Step 5: Production deployment checklist

Before deploying to production:

- [ ] Verify `BYTEPLUS_API_KEY` is added to production environment (Vercel dashboard)
- [ ] Remove `GEMINI_API_KEY` from production environment
- [ ] Test one manual generation in staging/preview environment
- [ ] Monitor logs for first 24 hours after deployment

---

## Success Criteria

Migration is complete and successful when:

✅ All commits created without errors
✅ `npx tsc --noEmit` passes with no type errors
✅ `npm run lint` passes with no warnings
✅ `npm run build` succeeds
✅ Environment validation detects BYTEPLUS_API_KEY correctly
✅ No references to Gemini remain in code or docs (except this plan)
✅ Manual API test generates 2048x2560 images without watermarks
✅ All documentation updated to reference BytePlus

---

## Rollback Plan

If issues are discovered:

1. **Revert commits:**
   ```bash
   git revert HEAD~6..HEAD
   ```

2. **Restore Gemini SDK:**
   ```bash
   npm install @google/genai
   ```

3. **Restore environment:**
   - Re-add `GEMINI_API_KEY` to `.env.local`
   - Remove `BYTEPLUS_API_KEY`

4. **Rebuild:**
   ```bash
   npm install
   npm run build
   ```

---

## Notes for Implementation

- **TDD Not Applicable**: This is a migration task replacing one API provider with another. The existing manual testing through the UI is sufficient validation.
- **Logging**: Keep verbose `[v0]` and `[BytePlus]` logging for debugging.
- **Error Handling**: BytePlus client has comprehensive error handling covering all HTTP status codes.
- **Backward Compatibility**: API response format maintained (includes `text: ""` field for frontend compatibility even though BytePlus doesn't generate text).
- **Performance**: BytePlus "fast" mode provides good balance between quality and speed.

---

**Plan created:** 2025-12-18
**Design reference:** `docs/plans/2025-12-18-gemini-to-byteplus-migration-design.md`
**Ready for execution:** Yes
