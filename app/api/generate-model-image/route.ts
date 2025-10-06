import { GoogleGenAI } from "@google/genai"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

console.log("[v0] Gemini API key available:", !!process.env.GEMINI_API_KEY)

async function convertImageToSupportedFormat(file: File): Promise<{ buffer: Buffer; mimeType: string }> {
  console.log("[v0] Converting image format:", file.type, "size:", file.size)

  const supportedTypes = ["image/png", "image/jpeg", "image/webp"]

  if (supportedTypes.includes(file.type)) {
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log("[v0] Image already supported, buffer size:", buffer.length)
    return {
      buffer,
      mimeType: file.type,
    }
  }

  console.log("[v0] Converting unsupported format", file.type, "to image/jpeg")
  const buffer = Buffer.from(await file.arrayBuffer())
  console.log("[v0] Converted buffer size:", buffer.length)
  return {
    buffer,
    mimeType: "image/jpeg",
  }
}

async function getPromptForProduct(productId: string, productName: string, productCategory: string): Promise<string> {
  try {
    const supabase = createServerClient()

    // Try to get product-specific prompt
    const { data: promptData, error: promptError } = await supabase
      .from("ai_prompts")
      .select("prompt_template")
      .eq("product_id", productId)
      .eq("is_default", false)
      .single()

    if (!promptError && promptData?.prompt_template) {
      console.log(`[v0] Using product-specific prompt for ${productName}`)
      // Replace template variables
      return promptData.prompt_template
        .replace(/\{\{product_name\}\}/g, productName)
        .replace(/\{\{product_category\}\}/g, productCategory)
    }

    // Try to get category default prompt
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("prompt_instructions")
      .eq("name", productCategory)
      .single()

    if (!categoryError && categoryData?.prompt_instructions) {
      console.log(`[v0] Using category default prompt for ${productCategory}`)
      return categoryData.prompt_instructions
        .replace(/\{\{product_name\}\}/g, productName)
        .replace(/\{\{product_category\}\}/g, productCategory)
    }

    // Try to get default prompt from ai_prompts table
    const { data: defaultPromptData, error: defaultPromptError } = await supabase
      .from("ai_prompts")
      .select("prompt_template")
      .eq("is_default", true)
      .single()

    if (!defaultPromptError && defaultPromptData?.prompt_template) {
      console.log(`[v0] Using default prompt from database`)
      return defaultPromptData.prompt_template
        .replace(/\{\{product_name\}\}/g, productName)
        .replace(/\{\{product_category\}\}/g, productCategory)
    }

    // Fallback to hardcoded default
    console.log(`[v0] Using hardcoded fallback prompt`)
    return getHardcodedFallbackPrompt(productName, productCategory)
  } catch (error) {
    console.error("[v0] Error fetching prompt from database:", error)
    return getHardcodedFallbackPrompt(productName, productCategory)
  }
}

function getHardcodedFallbackPrompt(productName: string, productCategory: string): string {
  if (productName.includes("Vomero")) {
    return `Create a professional product modeling photo showing the person from the first image wearing the exact Nike ZoomX Vomero Plus running shoes from the second image. The shoes must be the specific Nike Vomero Plus model - lightweight running sneakers with ZoomX foam technology, typically in colorways like blue/white, black/white, or other authentic Nike Vomero colorways. DO NOT substitute with other models. Frame the shot to show the full body with clear focus on the feet and shoes. The person should be posed naturally as a model in a running or athletic stance. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, arms, hands, legs, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across the entire body. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo showcasing specifically the Vomero Plus running shoes, not any other shoe model. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
  } else if (productName.includes("Club Cap")) {
    return `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Club Cap from the second image. The cap should be a classic Nike baseball cap with the Nike swoosh logo. Frame the shot from the chest up, focusing on the head and face area to showcase the cap clearly. The person should be posed naturally as a model. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, hands, arms, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo with a cropped, portrait-style framing. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
  } else if (productName.includes("Tech Woven") || productName.includes("Tech")) {
    return `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Tech Woven Pants from the second image. CRITICAL CLOTHING FIT REQUIREMENT: The pants MUST maintain the EXACT SAME loose, baggy, relaxed fit as shown in the reference product image. DO NOT make the pants fitted, skinny, or tapered - they should be loose and baggy exactly like the original Nike Tech design. The pants should have the same wide leg opening, loose silhouette around the thighs and calves, and relaxed drape as the reference image. NEVER alter the clothing to be more fitted or form-hugging than the original. The garment should look identical to the reference product in terms of how loosely it fits and drapes on the body. Frame the shot to show the full body to showcase the pants clearly. The person should be posed naturally as a model. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - COMPLETE BODY SKIN TONE UNITY: Every single visible part of the person's body - face, forehead, cheeks, chin, neck, throat, hands, fingers, wrists, forearms, arms, and ANY other exposed skin - must be IDENTICAL in skin tone, color, and ethnicity to the uploaded person's photo. This is NON-NEGOTIABLE: if the uploaded person has light skin, then their face AND hands AND all visible skin must be light; if they have dark skin, then their face AND hands AND all visible skin must be dark. NEVER mix skin tones on the same person - the hands must be the EXACT same color as the face. Pay special attention to the hands and fingers - they must perfectly match the facial skin tone without any variation. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo showcasing the specific camo tech pants with their original authentic loose, baggy fit. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
  } else if (productName.includes("Fleece Hoodie") || productName.includes("Hoodie")) {
    return `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Fleece Hoodie from the second image. CRITICAL CLOTHING FIT REQUIREMENT: The hoodie MUST maintain the EXACT SAME fit, proportions, and silhouette as shown in the reference product image - if it's oversized, keep it oversized; if it's fitted, keep it fitted. DO NOT alter the original Nike design characteristics or how the garment naturally fits and drapes. Frame the shot from the waist up to showcase the hoodie and upper body clearly. The person should be posed naturally as a model with hands visible. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - COMPLETE BODY SKIN TONE UNITY: Every single visible part of the person's body - face, forehead, cheeks, chin, neck, throat, hands, fingers, wrists, forearms, arms, and ANY other exposed skin - must be IDENTICAL in skin tone, color, and ethnicity to the uploaded person's photo. This is NON-NEGOTIABLE: if the uploaded person has light skin, then their face AND hands AND all visible skin must be light; if they have dark skin, then their face AND hands AND all visible skin must be dark. NEVER mix skin tones on the same person - the hands must be the EXACT same color as the face. Pay special attention to the hands and fingers - they must perfectly match the facial skin tone without any variation. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo with an upper body focus. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
  } else if (
    productCategory.toLowerCase().includes("accessories") ||
    productCategory.toLowerCase().includes("cap") ||
    productCategory.toLowerCase().includes("hat")
  ) {
    return `Create a professional product modeling photo showing the person from the first image wearing the ${productName} from the second image. Frame the shot from the chest up, focusing on the head and face area to showcase the ${productCategory.toLowerCase()} clearly. The person should be posed naturally as a model. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, hands, arms, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. The ${productCategory.toLowerCase()} should fit naturally on the person and look realistic. Make it look like a high-quality Nike advertisement photo with a cropped, portrait-style framing. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
  } else if (
    productCategory.toLowerCase().includes("clothing") ||
    productCategory.toLowerCase().includes("hoodie") ||
    productCategory.toLowerCase().includes("shirt") ||
    productCategory.toLowerCase().includes("jacket")
  ) {
    return `Create a professional product modeling photo showing the person from the first image wearing the ${productName} from the second image. CRITICAL CLOTHING FIT REQUIREMENT: The ${productCategory.toLowerCase()} MUST maintain the EXACT SAME fit, cut, silhouette, and proportions as shown in the reference product image. If the original garment is loose/baggy, keep it loose/baggy; if it's fitted, keep it fitted. DO NOT modify the clothing's original design characteristics, fit, or how it naturally drapes on the body. Preserve the authentic garment proportions exactly as designed. Frame the shot from the waist up to showcase the ${productCategory.toLowerCase()} and upper body clearly. The person should be posed naturally as a model with hands visible. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, arms, hands, legs, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. The ${productCategory.toLowerCase()} should fit naturally on the person with its original authentic design characteristics preserved. Make it look like a high-quality Nike advertisement photo with an upper body focus. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
  } else {
    return `Create a professional product modeling photo showing the person from the first image wearing or using the ${productName} from the second image. CRITICAL CLOTHING FIT REQUIREMENT: If it's clothing, the garment MUST maintain the EXACT SAME loose/baggy or fitted characteristics as shown in the reference product image. DO NOT alter the original fit - if pants are loose and baggy, keep them loose and baggy; if they're fitted, keep them fitted. Preserve the authentic garment design and proportions exactly as intended by Nike. The person should be posed naturally as a model showcasing the product. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, arms, hands, legs, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. The ${productCategory.toLowerCase()} should fit naturally on the person with its original design characteristics preserved. Make it look like a high-quality Nike advertisement photo. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === Starting POST request ===")

    const formData = await request.formData()
    console.log("[v0] FormData received, keys:", Array.from(formData.keys()))

    const userPhoto = formData.get("userPhoto") as File
    const productImage = formData.get("productImage") as File
    const productName = formData.get("productName") as string
    const productCategory = formData.get("productCategory") as string
    const productId = formData.get("productId") as string
    const colorName = formData.get("colorName") as string

    console.log("[v0] Extracted data:")
    console.log("[v0] - userPhoto:", userPhoto?.name, userPhoto?.type, userPhoto?.size)
    console.log("[v0] - productImage:", productImage?.name, productImage?.type, productImage?.size)
    console.log("[v0] - productName:", productName)
    console.log("[v0] - productCategory:", productCategory)
    console.log("[v0] - productId:", productId)
    console.log("[v0] - colorName:", colorName || "default")

    if (!userPhoto || !productImage || !productName) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Generating model image for:", productName)

    console.log("[v0] Converting user photo...")
    const convertedUserPhoto = await convertImageToSupportedFormat(userPhoto)
    console.log("[v0] User photo converted successfully")

    console.log("[v0] Converting product image...")
    const convertedProductImage = await convertImageToSupportedFormat(productImage)
    console.log("[v0] Product image converted successfully")

    // Get base prompt and enhance with color information
    let prompt = await getPromptForProduct(productId, productName, productCategory)
    
    // Inject color information into prompt if provided
    if (colorName && colorName !== "default") {
      const colorLower = colorName.toLowerCase()
      // Add color emphasis to the beginning of the prompt
      prompt = `IMPORTANT: The ${productName} must be specifically in ${colorLower} color as shown in the product image. ` + prompt
      console.log(`[v0] Enhanced prompt with color: ${colorLower}`)
    }

    console.log("[v0] Generated prompt length:", prompt.length)
    console.log("[v0] Prompt preview:", prompt.substring(0, 100) + "...")

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
  } catch (error) {
    console.error("[v0] Error in POST handler:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ error: "Failed to generate model image" }, { status: 500 })
  }
}
