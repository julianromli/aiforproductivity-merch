import { generateImageWithByteplus } from "@/lib/byteplus-client"
import { type NextRequest, NextResponse } from "next/server"

console.log("[v0] BytePlus API key available:", !!process.env.BYTEPLUS_API_KEY)

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
  } catch (error) {
    console.error("[v0] Error in generate-image POST handler:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
