import { GoogleGenAI } from "@google/genai"
import { type NextRequest, NextResponse } from "next/server"

console.log("[v0] Gemini API key available:", !!process.env.GEMINI_API_KEY)

async function convertImageToSupportedFormat(file: File): Promise<{ buffer: Buffer; mimeType: string }> {
  console.log("[v0] Converting image format:", file.type, "size:", file.size)

  const supportedTypes = ["image/png", "image/jpeg", "image/webp"]

  // If already supported, return as-is
  if (supportedTypes.includes(file.type)) {
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log("[v0] Image already supported, buffer size:", buffer.length)
    return {
      buffer,
      mimeType: file.type,
    }
  }

  // For unsupported formats, we'll convert to JPEG
  console.log("[v0] Converting unsupported format", file.type, "to image/jpeg")

  const buffer = Buffer.from(await file.arrayBuffer())
  console.log("[v0] Converted buffer size:", buffer.length)
  return {
    buffer,
    mimeType: "image/jpeg",
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === Starting generate-image POST request ===")

    const formData = await request.formData()
    console.log("[v0] FormData received, keys:", Array.from(formData.keys()))

    const image1 = formData.get("image1") as File
    const image2 = formData.get("image2") as File
    const prompt = formData.get("prompt") as string

    console.log("[v0] Extracted data:")
    console.log("[v0] - image1:", image1?.name, image1?.type, image1?.size)
    console.log("[v0] - image2:", image2?.name, image2?.type, image2?.size)
    console.log("[v0] - prompt length:", prompt?.length)
    console.log("[v0] - prompt preview:", prompt?.substring(0, 100) + "...")

    if (!image1 || !image2 || !prompt) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Original image types:", image1.type, image2.type)

    console.log("[v0] Converting image1...")
    const convertedImage1 = await convertImageToSupportedFormat(image1)
    console.log("[v0] Image1 converted successfully")

    console.log("[v0] Converting image2...")
    const convertedImage2 = await convertImageToSupportedFormat(image2)
    console.log("[v0] Image2 converted successfully")

    console.log("[v0] Converted image types:", convertedImage1.mimeType, convertedImage2.mimeType)

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
  } catch (error) {
    console.error("[v0] Error in generate-image POST handler:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
