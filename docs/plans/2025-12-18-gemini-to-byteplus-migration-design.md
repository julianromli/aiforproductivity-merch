# Gemini to BytePlus SeeDream v4.5 Migration Design

**Date:** 2025-12-18  
**Project:** AI For Productivity Merch Store  
**Migration:** Google Gemini 2.5 Flash → BytePlus SeeDream v4.5

---

## 1. Overview & Migration Goals

### Current State
The system uses **Google Gemini 2.5 Flash** for AI-powered product modeling with two API routes:
- `/api/generate-image` - General image blending (2 images + prompt)
- `/api/generate-model-image` - Virtual try-on with database-driven prompts

**Key Features:**
- Image format conversion (PNG/JPEG/WEBP support)
- Database-driven prompt templates (product-specific, category-default, fallback)
- Aspect ratio: 4:5 (portrait for product modeling)
- Response: Base64-encoded images

### Target State
Migrate to **BytePlus SeeDream v4.5** with these specifications:
- **Resolution:** Fixed 4:5 aspect ratio (`2048x2560` pixels for portrait product modeling)
- **Generation mode:** Single image output (sequential generation disabled)
- **Watermarking:** Disabled for clean product images
- **Prompt optimization:** Enabled with "fast" mode for good quality balance
- **Authentication:** Complete replacement (remove Gemini SDK, use BytePlus REST API)

### Migration Benefits
- Higher resolution support (SeeDream supports up to 4K)
- Built-in prompt enhancement for better image quality
- More control over image dimensions and generation parameters
- Potentially lower costs (depending on BytePlus pricing vs Gemini)
- Broader image format support (adds BMP, TIFF, GIF)

---

## 2. Environment & Configuration Changes

### Environment Variables Updates

**Remove:**
```bash
GEMINI_API_KEY=your_google_ai_api_key_here
```

**Add:**
```bash
BYTEPLUS_API_KEY=your_byteplus_api_key_here
```

### Configuration Files to Update

#### `.env.example`
- Remove Gemini API key documentation
- Add BytePlus API key with setup instructions
- Update comment: "Get your API key: https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey"

#### `lib/env-validator.ts`
- Replace `GEMINI_API_KEY` with `BYTEPLUS_API_KEY` in ENV_VARIABLES array
- Update description: "BytePlus SeeDream API key for AI-powered virtual try-on feature"
- Update setupUrl: "https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey"

#### Package Dependencies
- **Remove:** `@google/genai` package from `package.json`
- **Add:** No new SDK needed (we'll use native `fetch` with BytePlus REST API)

### Migration Impact
- Users must obtain new BytePlus API key
- Existing `.env.local` files will need manual update
- Environment validation will catch missing BytePlus key on startup

---

## 3. API Implementation Changes

### BytePlus API Specification

**Endpoint:**
```
POST https://ark.ap-southeast.bytepluses.com/api/v3/images/generations
```

**Headers:**
```typescript
{
  "Authorization": `Bearer ${process.env.BYTEPLUS_API_KEY}`,
  "Content-Type": "application/json"
}
```

**Request Body:**
```typescript
{
  model: "seedream-4.5",
  prompt: string,
  image: [
    "data:image/png;base64,<base64Image1>",
    "data:image/jpeg;base64,<base64Image2>"
  ], // Array of data URIs
  size: "2048x2560", // Fixed 4:5 aspect ratio
  sequential_image_generation: "disabled", // Single image output
  watermark: false, // Clean images
  response_format: "b64_json", // Return base64 data
  optimize_prompt_options: {
    mode: "fast" // Good quality balance with faster generation
  }
}
```

### Image Format Handling

**Current behavior (keep):**
- Convert unsupported formats to JPEG
- Support PNG, JPEG, WEBP natively
- BytePlus also supports BMP, TIFF, GIF (bonus compatibility)

**Base64 encoding format:**
```typescript
// Current Gemini: Plain base64 string
data: base64String

// BytePlus: Requires data URI format
data: `data:image/png;base64,${base64String}`
```

### Response Handling

**BytePlus response structure:**
```typescript
{
  model: "seedream-4.5",
  created: 1234567890,
  data: [{
    b64_json: string, // Base64 image data
    size: "2048x2560"
  }],
  usage: {
    generated_images: 1,
    output_tokens: number,
    total_tokens: number
  }
}
```

**Return format (matching current API contract):**
```typescript
{
  imageUrl: `data:image/jpeg;base64,${base64Data}`,
  text: "", // BytePlus doesn't return text (Gemini compatibility)
  usage: { ... }
}
```

---

## 4. Error Handling & Retry Logic

### BytePlus Error Codes

**Common errors to handle:**
- `400` - Invalid request (missing fields, invalid image format, aspect ratio out of range)
- `401` - Authentication failed (invalid API key)
- `429` - Rate limit exceeded
- `500` - Internal server error
- Content filter rejection (image generation blocked)

### Error Handling Strategy

#### 1. API Key Validation (startup)
```typescript
// In lib/env-validator.ts
if (!process.env.BYTEPLUS_API_KEY) {
  throw new EnvironmentValidationError([...])
}
```

#### 2. Request Validation (runtime)
```typescript
// Validate before API call:
- Image format (PNG/JPEG/WEBP/BMP/TIFF/GIF)
- Image size (max 10MB per image)
- Image dimensions (width/height > 14px)
- Aspect ratio [1/16, 16]
- Total pixels <= 6000x6000
```

#### 3. BytePlus API Error Handling
```typescript
try {
  const response = await fetch(BYTEPLUS_ENDPOINT, {...})
  
  if (!response.ok) {
    const error = await response.json()
    
    switch (response.status) {
      case 400:
        return { error: "Invalid image or prompt", details: error.message }
      case 401:
        return { error: "BytePlus API authentication failed" }
      case 429:
        return { error: "Rate limit exceeded, please try again later" }
      case 500:
        return { error: "BytePlus service error, please retry" }
      default:
        return { error: "Failed to generate image" }
    }
  }
  
  // Handle successful response...
} catch (error) {
  console.error("[BytePlus] Generation error:", error)
  return { error: "Failed to generate image" }
}
```

#### 4. Response Validation
```typescript
// Check if image data exists
if (!result.data || result.data.length === 0) {
  return { error: "No image was generated" }
}

if (!result.data[0].b64_json) {
  return { error: "No image data in response" }
}
```

### Logging Strategy
Keep current verbose logging approach:
- Log all request parameters (image sizes, prompt length)
- Log BytePlus API response metadata
- Log errors with full stack traces
- Keep `[v0]` prefix for consistency with existing logs

---

## 5. Code Implementation Changes

### Files to Modify

1. **`app/api/generate-image/route.ts`** - General image blending
2. **`app/api/generate-model-image/route.ts`** - Virtual try-on with DB prompts

Both routes share similar structure with these main changes:

### Remove Gemini SDK
```typescript
// REMOVE
import { GoogleGenAI } from "@google/genai"
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
```

### Create Shared BytePlus Client

**New file: `lib/byteplus-client.ts`**

```typescript
export async function generateImageWithByteplus(params: {
  prompt: string
  images: Array<{ data: string; mimeType: string }>
}): Promise<{
  imageUrl?: string
  error?: string
  usage?: any
}> {
  const response = await fetch(
    "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BYTEPLUS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "seedream-4.5",
        prompt: params.prompt,
        image: params.images.map(img => 
          `data:${img.mimeType};base64,${img.data}`
        ),
        size: "2048x2560",
        sequential_image_generation: "disabled",
        watermark: false,
        response_format: "b64_json",
        optimize_prompt_options: {
          mode: "fast"
        }
      })
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    return { error: error.message || "BytePlus API error" }
  }
  
  const result = await response.json()
  
  if (!result.data || result.data.length === 0) {
    return { error: "No image was generated" }
  }
  
  const base64Image = `data:image/jpeg;base64,${result.data[0].b64_json}`
  
  return {
    imageUrl: base64Image,
    usage: result.usage
  }
}
```

### Replace Gemini Calls in API Routes

```typescript
// OLD (Gemini)
const result = await genAI.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: [...],
  config: { responseModalities: ["IMAGE"], ... }
})

// NEW (BytePlus)
const result = await generateImageWithByteplus({
  prompt: prompt,
  images: [
    { data: base64Image1, mimeType: convertedImage1.mimeType },
    { data: base64Image2, mimeType: convertedImage2.mimeType }
  ]
})

if (result.error) {
  return NextResponse.json({ error: result.error }, { status: 500 })
}
```

### Response Format Adjustment

```typescript
// BytePlus returns b64_json directly, already in data URI format
return NextResponse.json({
  imageUrl: result.imageUrl,
  text: "", // BytePlus doesn't return text (compatibility)
  usage: result.usage
})
```

---

## 6. Testing & Validation Plan

### Pre-Migration Testing

#### 1. Environment Validation
```bash
npm run validate  # Should fail without BYTEPLUS_API_KEY
# Add BYTEPLUS_API_KEY to .env.local
npm run validate  # Should pass
```

#### 2. API Route Testing (Manual)

**Test `/api/generate-image`:**
- Upload 2 test images + prompt
- Verify: Returns base64 image with 2048x2560 dimensions
- Verify: No watermark visible
- Verify: Usage metadata returned

**Test `/api/generate-model-image`:**
- Upload user photo + product image
- Verify: Prompt fetched from database correctly
- Verify: Color information injected properly
- Verify: Generated image matches product modeling expectations
- Verify: Facial fidelity preserved (if using real photos)

#### 3. Error Scenario Testing
- Invalid API key → Returns 401 error with clear message
- Missing images → Returns 400 error
- Invalid image format → Converts or rejects with error
- BytePlus service down → Returns 500 error with retry message

### Post-Migration Validation

#### 1. Type Checking
```bash
npx tsc --noEmit  # Must pass with no errors
```

#### 2. Linting
```bash
npm run lint  # Must pass
```

#### 3. Build Test
```bash
npm run build  # Must succeed (note: ignoreBuildErrors=true, so check logs)
```

#### 4. Manual UI Testing
- Admin dashboard → Create product → Upload images → Generate model image
- Verify generated images display correctly
- Test with different product categories
- Test with products that have color variants

### Rollback Plan

If issues discovered after deployment:
1. Revert commits to restore Gemini integration
2. Restore `GEMINI_API_KEY` in environment
3. Reinstall `@google/genai` package
4. Run `npm install`

---

## 7. Documentation & Migration Checklist

### Documentation Files to Update

1. **`README.md`**
   - Update "Features" section: Change "Gemini 2.5 Flash" → "BytePlus SeeDream v4.5"
   - Update setup instructions for BytePlus API key
   - Update any screenshots/examples if they mention Gemini

2. **`SETUP.md`**
   - Replace Gemini API key setup with BytePlus instructions
   - Update link: https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey
   - Update environment variable examples

3. **`DOKUMENTASI_AI.md`** (Indonesian docs)
   - Same changes as SETUP.md but in Indonesian
   - Update teknologi: Gemini → BytePlus SeeDream

4. **`docs/QUICK_SETUP_NO_CODE.md` and `docs/QUICK_SETUP_NO_CODE_INDO.md`**
   - Update non-technical setup guide with BytePlus instructions
   - Update screenshots if needed

5. **`DEBUG_IMAGE_GENERATION.md`**
   - Update debugging guide for BytePlus API
   - Update error codes and troubleshooting steps
   - Keep BytePlus API docs reference

6. **`ARCHITECTURE.md`**
   - Update AI integration section
   - Document BytePlus API structure
   - Update architecture diagrams if present

### Migration Execution Checklist

#### Phase 1: Environment Setup ✅ (Already completed)
- [x] Obtain BytePlus API key
- [x] Add `BYTEPLUS_API_KEY` to `.env.local`

#### Phase 2: Code Implementation
- [ ] Update `.env.example` (remove Gemini, add BytePlus)
- [ ] Update `lib/env-validator.ts` (validate BYTEPLUS_API_KEY)
- [ ] Create `lib/byteplus-client.ts` (reusable API client)
- [ ] Update `app/api/generate-image/route.ts` (replace Gemini SDK)
- [ ] Update `app/api/generate-model-image/route.ts` (replace Gemini SDK)
- [ ] Remove `@google/genai` from `package.json`
- [ ] Run `npm install` to clean up dependencies

#### Phase 3: Testing
- [ ] Run `npm run validate` (verify BytePlus key detected)
- [ ] Run `npx tsc --noEmit` (no type errors)
- [ ] Run `npm run lint` (no lint warnings)
- [ ] Test `/api/generate-image` endpoint manually
- [ ] Test `/api/generate-model-image` endpoint manually
- [ ] Test error scenarios (invalid key, missing images)
- [ ] Verify image quality and dimensions (2048x2560)
- [ ] Verify no watermarks on generated images

#### Phase 4: Documentation
- [ ] Update README.md
- [ ] Update SETUP.md
- [ ] Update DOKUMENTASI_AI.md
- [ ] Update QUICK_SETUP guides
- [ ] Update DEBUG_IMAGE_GENERATION.md
- [ ] Update ARCHITECTURE.md

#### Phase 5: Deployment
- [ ] Commit all changes with message: `feat: migrate from Gemini to BytePlus SeeDream v4.5`
- [ ] Add `BYTEPLUS_API_KEY` to production environment (Vercel/deployment platform)
- [ ] Deploy to production
- [ ] Test production deployment
- [ ] Monitor for errors in first 24 hours

### Success Criteria

Migration is successful when:
- ✅ All API routes return images without errors
- ✅ Generated images are 2048x2560 resolution
- ✅ No watermarks visible on images
- ✅ Image quality meets or exceeds Gemini results
- ✅ All tests pass (type check, lint, build)
- ✅ Documentation is updated and accurate
- ✅ Production deployment stable for 24 hours

---

## 8. Technical Considerations

### API Differences: Gemini vs BytePlus

| Feature | Gemini 2.5 Flash | BytePlus SeeDream v4.5 |
|---------|------------------|------------------------|
| SDK | `@google/genai` NPM package | Native `fetch` (REST API) |
| Authentication | API key in SDK constructor | Bearer token in Authorization header |
| Image input | Base64 string in `inlineData` | Data URI string in `image` array |
| Resolution | Aspect ratio config | Exact pixel dimensions |
| Response | `inlineData.data` (base64) | `data[0].b64_json` (base64) |
| Text output | Supported (`parts.text`) | Not supported |
| Prompt optimization | Built into model | Explicit `optimize_prompt_options` |
| Watermarking | Invisible SynthID | Optional visible watermark |

### Performance Considerations

**Expected improvements:**
- Higher resolution output capability (up to 4K)
- Faster generation with "fast" mode prompt optimization
- More control over output dimensions

**Potential trade-offs:**
- No text generation capability (Gemini can return text + image)
- Different rate limits (need to monitor)
- REST API overhead vs SDK abstraction

### Cost Considerations

**Action required:**
- Review BytePlus pricing: https://www.byteplus.com/en/product/model-ark/pricing
- Compare with Gemini API pricing
- Monitor actual usage and costs post-migration
- Consider implementing usage tracking/alerts

---

## 9. Risk Assessment

### Low Risk
- ✅ Environment setup (already completed)
- ✅ Configuration changes (straightforward replacements)
- ✅ Error handling (comprehensive coverage)

### Medium Risk
- ⚠️ Image quality differences (need to compare outputs)
- ⚠️ Rate limits (BytePlus vs Gemini may differ)
- ⚠️ Response time changes (monitor performance)

### High Risk
- ⚠️ Production deployment (requires careful monitoring)
- ⚠️ User-facing issues if API fails silently
- ⚠️ Cost implications if usage patterns differ

### Mitigation Strategies
1. **Thorough testing** before production deployment
2. **Monitor logs** closely for first 24-48 hours
3. **Keep rollback ready** (git revert + env restore)
4. **Alert on errors** (consider error monitoring service)
5. **Compare costs** regularly against Gemini baseline

---

## 10. Next Steps

After design approval:
1. ✅ Save this design document
2. → Create detailed implementation plan with step-by-step tasks
3. → Dispatch specialist droids for implementation
4. → Execute testing and validation
5. → Update documentation
6. → Deploy to production

**Design approved by:** User  
**Design date:** 2025-12-18  
**Ready for implementation planning:** Yes
