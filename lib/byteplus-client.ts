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
        model: "seedream-4-5-251128",
        prompt: params.prompt,
        image: imageDataUris,
        size: "2048x2560",
        sequential_image_generation: "disabled",
        watermark: false,
        response_format: "b64_json",
        optimize_prompt_options: {
          mode: "standard"
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
