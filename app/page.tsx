"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Upload, ShoppingBag, Heart, Search } from "lucide-react"
import { ImageWithLoading } from "@/components/image-with-loading"
import { ImagePreviewDialog } from "@/components/image-preview-dialog"
import useSWR from "swr"

interface Product {
  id: string
  name: string
  price: number
  currency: string
  category: string
  image_url: string
  description: string
  is_active: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const SmoothProgressBar = ({ progress, isActive }: { progress: number; isActive: boolean }) => {
  const [displayProgress, setDisplayProgress] = useState(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startProgressRef = useRef<number>(0)

  useEffect(() => {
    if (!isActive) {
      setDisplayProgress(0)
      return
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
        startProgressRef.current = displayProgress
      }

      const elapsed = currentTime - startTimeRef.current
      const duration = 100

      if (elapsed < duration) {
        const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
        const t = easeOutQuart(elapsed / duration)
        const newProgress = startProgressRef.current + (progress - startProgressRef.current) * t

        setDisplayProgress(newProgress)
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayProgress(progress)
        startTimeRef.current = undefined
      }
    }

    if (Math.abs(progress - displayProgress) > 0.01) {
      startTimeRef.current = undefined
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [progress, displayProgress, isActive])

  return (
    <div className="w-full mb-3">
      <div className="relative">
        <Progress value={displayProgress} className="h-2 bg-muted rounded-full overflow-hidden shadow-inner" />
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-muted-foreground to-primary rounded-full transition-all duration-75 ease-out shadow-lg"
          style={{
            width: `${displayProgress}%`,
            boxShadow: "0 0 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        />
      </div>
    </div>
  )
}

export default function BananaSportswearStorefront() {
  const { data: productsData, error: productsError } = useSWR<{ products: Product[] }>("/api/products", fetcher)
  const products = productsData?.products || []

  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [personalizedImages, setPersonalizedImages] = useState<{ [key: string]: string }>({})
  const [generationProgress, setGenerationProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [viewMode, setViewMode] = useState<"products" | "generated">("products")
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [showGallery, setShowGallery] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentProductName, setCurrentProductName] = useState("")
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleImageLoad = (productId: string) => {
    setLoadedImages((prev) => new Set([...prev, productId]))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handlePhotoUpload(files[0])
    }
  }

  const handlePhotoUpload = (file: File) => {
    setUserPhoto(file)
    setIsPersonalized(false)
    setPersonalizedImages({})
    setViewMode("products")
    setTimeout(() => {
      generatePersonalizedImagesWithFile(file)
    }, 100)
  }

  const generatePersonalizedImagesWithFile = async (file: File) => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentProductIndex(0)
    setShowGallery(false)
    setIsTransitioning(false)
    const newPersonalizedImages: { [key: string]: string } = {}

    try {
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        setCurrentProductIndex(i)
        setCurrentProductName(product.name)

        console.log(`[v0] Starting generation for product: ${product.name} (ID: ${product.id})`)

        const baseProgress = (i / products.length) * 100
        const targetProgress = ((i + 1) / products.length) * 100

        const animateProgress = (startProgress: number, endProgress: number, duration: number) => {
          return new Promise<void>((resolve) => {
            const startTime = Date.now()
            const updateInterval = 8

            const updateProgress = () => {
              const elapsed = Date.now() - startTime
              const progress = Math.min(elapsed / duration, 1)

              const easeInOutCubic = (t: number) => {
                if (t < 0.5) {
                  return 4 * t * t * t
                } else {
                  return 1 - Math.pow(-2 * t + 2, 3) / 2
                }
              }

              const easedProgress = easeInOutCubic(progress)
              const currentProgress = startProgress + (endProgress - startProgress) * easedProgress
              setGenerationProgress(currentProgress)

              if (progress < 1) {
                setTimeout(() => requestAnimationFrame(updateProgress), updateInterval)
              } else {
                resolve()
              }
            }

            requestAnimationFrame(updateProgress)
          })
        }

        const progressPromise = animateProgress(baseProgress, targetProgress, 4000)

        try {
          const productImageResponse = await fetch(product.image_url)
          if (!productImageResponse.ok) {
            throw new Error(`Failed to fetch product image for ${product.name}`)
          }

          const productImageBlob = await productImageResponse.blob()
          const productImageFile = new File([productImageBlob], `${product.id}.jpg`, {
            type: productImageBlob.type,
          })

          const formData = new FormData()
          formData.append("userPhoto", file)
          formData.append("productImage", productImageFile)
          formData.append("productName", product.name)
          formData.append("productCategory", product.category)
          formData.append("productId", product.id)

          console.log(`[v0] Sending request for ${product.name}...`)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 60000)

          const response = await fetch("/api/generate-model-image", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to generate image for ${product.name}: ${response.status} - ${errorText}`)
          }

          const data = await response.json()

          if (!data.imageUrl) {
            throw new Error(`No image URL returned for ${product.name}`)
          }

          newPersonalizedImages[product.id] = data.imageUrl
          console.log(`[v0] Successfully generated image for ${product.name}: ${data.imageUrl.substring(0, 50)}...`)
        } catch (productError) {
          console.error(`[v0] Error generating image for ${product.name}:`, productError)
          newPersonalizedImages[product.id] = product.image_url
        }

        await progressPromise
      }

      console.log("[v0] Final personalized images:", Object.keys(newPersonalizedImages))

      const generatedCount = Object.values(newPersonalizedImages).filter((url) => url.startsWith("data:")).length
      console.log(`[v0] Successfully generated ${generatedCount} out of ${products.length} images`)

      setPersonalizedImages(newPersonalizedImages)
      setIsPersonalized(generatedCount > 0)

      setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setViewMode("generated")
          setTimeout(() => {
            setIsTransitioning(false)
            setTimeout(() => {
              setShowGallery(true)
            }, 300)
          }, 200)
        }, 200)
      }, 300)
    } catch (error) {
      console.error("[v0] Error in generatePersonalizedImagesWithFile:", error)
      alert(
        `Failed to generate personalized images: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      )
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Failed to load products. Please try again later.</p>
      </div>
    )
  }

  if (!productsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-background text-foreground font-sans transition-all duration-1000 ${
        isPageLoaded ? "opacity-100" : "opacity-0"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`fixed bottom-8 right-8 z-40 transition-all duration-700 ${
          isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ transitionDelay: "800ms" }}
      >
        <div
          className={`border-2 border-dashed transition-all duration-300 ${
            isDragOver ? "border-primary bg-background shadow-lg scale-105" : "border-border bg-background"
          } p-8 text-center w-64 hover:shadow-md hover:scale-102`}
          onClick={() => !userPhoto && document.getElementById("user-photo")?.click()}
        >
          {!userPhoto ? (
            <>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="user-photo"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoUpload(file)
                }}
              />
              <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground animate-bounce" />
              <h3 className="text-sm font-medium mb-2 tracking-wide animate-pulse">DROP YOUR PHOTO</h3>
              <p className="text-xs text-muted-foreground font-sans tracking-wider mt-2 animate-fade-in">
                To see how the products would look on you
              </p>
            </>
          ) : isGenerating ? (
            <>
              <SmoothProgressBar progress={generationProgress} isActive={isGenerating} />
              <p className="text-xs text-muted-foreground font-sans tracking-wider animate-pulse mb-3 font-medium">
                {Math.round(generationProgress)}% COMPLETE
              </p>
              <h3 className="text-xs font-medium mb-4 tracking-wide animate-pulse transition-all duration-500 text-foreground">
                Generating image for {currentProductName}
              </h3>
              <div className="flex justify-center mt-3 space-x-1">
                <div
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground animate-pulse" />
              <h3 className="text-xs font-medium mb-2 tracking-wide animate-fade-in">PHOTOS GENERATED!</h3>
              <p className="text-xs text-muted-foreground font-sans tracking-wider mb-3 animate-fade-in">
                Drop a new photo to generate fresh samples
              </p>
              <Button
                onClick={() => {
                  const newMode = viewMode === "products" ? "generated" : "products"
                  setViewMode(newMode)
                  if (newMode === "generated") {
                    setTimeout(() => setShowGallery(true), 300)
                  } else {
                    setShowGallery(false)
                  }
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 text-xs font-medium tracking-widest uppercase px-4 py-2 mb-2 transition-all duration-300 hover:scale-105"
              >
                {viewMode === "products" ? "SHOW MY PHOTOS" : "SHOW PRODUCTS"}
              </Button>
            </>
          )}
        </div>
      </div>

      {isDragOver && (
        <div className="fixed inset-0 z-20 bg-primary/5 border-4 border-dashed border-primary pointer-events-none animate-fade-in" />
      )}

      <header
        className={`px-8 py-6 border-b border-border transition-all duration-700 ${
          isPageLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png" alt="AI FOR PRODUCTIVITY" className="h-10 w-auto" />
          <p href="https://aiforproductivity.id/" className="text-xl font-bold ms-4">AI For Productivity</p>
          </div>

          <nav className="hidden md:flex items-center space-x-12">
            {["New", "Men", "Women", "Kids"].map((item, index) => (
              <a
                key={item}
                href="#"
                className={`text-foreground hover:text-muted-foreground text-md font-bold transition-all duration-500 ${
                  isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                {item}
              </a>
            ))}
          </nav>

          <div
            className={`flex items-center space-x-6 transition-all duration-700 ${
              isPageLoaded ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="hidden md:flex items-center bg-accent rounded-full px-4 py-2 border border-border">
              <Search className="w-4 h-4 text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent text-xs outline-none placeholder-muted-foreground w-24 font-sans"
              />
            </div>
            <Heart className="w-4 h-4 text-foreground cursor-pointer hover:text-muted-foreground transition-colors" />
            <ShoppingBag className="w-4 h-4 text-foreground cursor-pointer hover:text-muted-foreground transition-colors" />
          </div>
        </div>
      </header>

      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div
            className={`flex items-center justify-between mb-16 transition-all duration-700 ${
              isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <h2 className="font-bold tracking-normal text-2xl">AI For Productivity Merch</h2>
            <Button
              variant="outline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium tracking-widest uppercase px-6 transition-all duration-300 hover:scale-105 rounded-lg"
            >
              VIEW ALL
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`group cursor-pointer transition-all duration-700 ${
                  isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                } ${
                  isTransitioning
                    ? "opacity-80"
                    : viewMode === "generated" && showGallery
                      ? "animate-fade-in-up opacity-100"
                      : viewMode === "generated"
                        ? "opacity-0"
                        : "opacity-100"
                }`}
                style={{
                  transitionDelay:
                    viewMode === "generated" && showGallery ? `${index * 100}ms` : `${500 + index * 150}ms`,
                }}
              >
                <div 
                  className="relative w-full overflow-hidden mb-4 cursor-pointer group/image"
                  onClick={() => {
                    const imageSrc = viewMode === "generated" && personalizedImages[product.id]
                      ? personalizedImages[product.id]
                      : product.image_url || "/placeholder.svg"
                    const imageAlt = viewMode === "generated" && personalizedImages[product.id]
                      ? `You modeling ${product.name}`
                      : product.name
                    setSelectedImage({ src: imageSrc, alt: imageAlt })
                  }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all duration-300 flex items-center justify-center z-10 pointer-events-none">
                    <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                      <Search className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                  <AspectRatio ratio={4 / 5}>
                    <ImageWithLoading
                      src={
                        viewMode === "generated" && personalizedImages[product.id]
                          ? personalizedImages[product.id]
                          : product.image_url || "/placeholder.svg"
                      }
                      alt={
                        viewMode === "generated" && personalizedImages[product.id]
                          ? `You modeling ${product.name}`
                          : product.name
                      }
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                        isTransitioning ? "opacity-90" : "opacity-100"
                      }`}
                      onLoad={() => handleImageLoad(product.id)}
                    />
                  </AspectRatio>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium tracking-wide">{product.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium tracking-wide">
                      {product.currency === "USD" ? "$" : product.currency}
                      {product.price.toFixed(2)}
                    </span>
                    <button className="bg-primary text-primary-foreground px-6 py-2 text-xs font-medium tracking-widest uppercase cursor-pointer hover:bg-primary/90 transition-all duration-300 hover:scale-105 rounded-lg">
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className={`border-t border-border px-8 py-16 bg-accent transition-all duration-700 ${
          isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: "1000ms" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img src="https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png" alt="BANANA SPORTSWEAR" className="h-8 w-auto opacity-40" />
          </div>

          <p className="text-muted-foreground text-sm font-bold">
            © 2025 AI For Productivity
          </p>
        </div>
      </footer>

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src || ""}
        imageAlt={selectedImage?.alt || ""}
      />
    </div>
  )
}
