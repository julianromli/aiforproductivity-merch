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
import { formatCurrency } from "@/lib/utils"
import useSWR from "swr"

interface Product {
  id: string
  name: string
  price: number
  currency: string
  category: string
  image_url: string
  description: string
  buy_link: string | null
  is_active: boolean
}

type GenerationStatus = 'pending' | 'generating' | 'ready' | 'error'
type ProductStatusMap = Record<string, GenerationStatus>

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const SmoothProgressBar = ({ progress, isActive }: { progress: number; isActive: boolean }) => {
  const [displayProgress, setDisplayProgress] = useState(0)
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)
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
  
  // Hybrid parallel generation state
  const [readyCount, setReadyCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isPriorityBatchDone, setIsPriorityBatchDone] = useState(false)
  const [backgroundInProgress, setBackgroundInProgress] = useState(false)
  const [productStatus, setProductStatus] = useState<ProductStatusMap>({})
  const [inFlightNames, setInFlightNames] = useState<string[]>([])
  
  // Refs for race condition guards and abort controllers
  const generationRunIdRef = useRef<number>(0)
  const controllersRef = useRef<Map<string, AbortController>>(new Map())
  const didAutoSwitchRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Cleanup on unmount: abort all controllers
  useEffect(() => {
    return () => {
      controllersRef.current.forEach(c => {
        try {
          c.abort()
        } catch {}
      })
      controllersRef.current.clear()
    }
  }, [])
  
  // Derived values for UI
  const progressPercent = Math.round((readyCount / Math.max(1, totalCount)) * 100)
  const progressText = `${readyCount} of ${totalCount} ready`
  const displayProductName = inFlightNames.length > 0
    ? inFlightNames.slice(0, 3).join(', ') + (inFlightNames.length > 3 ? ` +${inFlightNames.length - 3} more` : '')
    : currentProductName
  const showBackgroundIndicator = isPriorityBatchDone && readyCount < totalCount

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
    didAutoSwitchRef.current = false
    setTimeout(() => {
      generatePersonalizedImagesWithFile(file)
    }, 100)
  }
  
  // Helper: abort all controllers
  const abortAllControllers = () => {
    controllersRef.current.forEach(c => {
      try {
        c.abort()
      } catch {}
    })
    controllersRef.current.clear()
  }
  
  // Helper: timeout wrapper
  function withTimeout<T>(p: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        onTimeout?.()
        reject(new Error('timeout'))
      }, ms)
      p.then(v => { clearTimeout(id); resolve(v) })
       .catch(err => { clearTimeout(id); reject(err) })
    })
  }
  
  // Helper: Generate single product
  const runProductGeneration = async (
    product: Product,
    file: File,
    runId: number
  ): Promise<{ success: boolean; url?: string; productId: string }> => {
    const guard = () => runId !== generationRunIdRef.current
    
    setProductStatus(prev => ({ ...prev, [product.id]: 'generating' }))
    setInFlightNames(prev => Array.from(new Set([...prev, product.name])))
    
    const controller = new AbortController()
    controllersRef.current.set(product.id, controller)
    
    try {
      console.log(`[gen] Starting generation for product: ${product.name} (ID: ${product.id}, runId: ${runId})`)
      
      // Fetch product image
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
      
      // Call API with 60s timeout
      const response = await withTimeout(
        fetch("/api/generate-model-image", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }),
        60000,
        () => controller.abort()
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate image for ${product.name}: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.imageUrl) {
        throw new Error(`No image URL returned for ${product.name}`)
      }
      
      if (guard()) return { success: false, productId: product.id }
      
      setPersonalizedImages(prev => ({ ...prev, [product.id]: data.imageUrl }))
      setReadyCount(prev => prev + 1)
      setProductStatus(prev => ({ ...prev, [product.id]: 'ready' }))
      console.log(`[gen] Success: ${product.name} (runId: ${runId})`)
      
      return { success: true, url: data.imageUrl, productId: product.id }
    } catch (err) {
      if (guard()) return { success: false, productId: product.id }
      
      console.error(`[gen] Error for ${product.name}:`, err)
      
      // Fallback to original image
      setPersonalizedImages(prev => ({ ...prev, [product.id]: product.image_url }))
      setReadyCount(prev => prev + 1)
      setProductStatus(prev => ({ ...prev, [product.id]: 'error' }))
      
      return { success: false, productId: product.id }
    } finally {
      controllersRef.current.delete(product.id)
      if (!guard()) {
        setInFlightNames(prev => prev.filter(n => n !== product.name))
      }
    }
  }

  const generatePersonalizedImagesWithFile = async (file: File) => {
    const runId = Date.now()
    generationRunIdRef.current = runId
    
    // Abort any ongoing generations
    abortAllControllers()
    
    const total = products.length
    
    // Reset state
    setIsGenerating(true)
    setTotalCount(total)
    setReadyCount(0)
    setIsPriorityBatchDone(false)
    setBackgroundInProgress(false)
    setProductStatus(Object.fromEntries(products.map(p => [p.id, 'pending'])))
    setInFlightNames([])
    setShowGallery(false)
    setIsTransitioning(false)
    setGenerationProgress(0)
    
    console.log(`[gen] Start runId=${runId}, total=${total} products`)
    console.time('[gen] priority')
    console.time('[gen] background')
    
    if (total === 0) {
      setIsGenerating(false)
      return
    }
    
    const priority = products.slice(0, 3)
    const background = products.slice(3)
    
    // Start PRIORITY batch (first 3 products in parallel)
    const priorityPromises = priority.map(p => runProductGeneration(p, file, runId))
    
    // Start BACKGROUND batch (remaining products in parallel)
    const bgPromises = background.map(p => runProductGeneration(p, file, runId))
    if (background.length > 0) setBackgroundInProgress(true)
    
    // Auto-switch after priority batch settles
    void Promise.allSettled(priorityPromises).then(() => {
      if (runId !== generationRunIdRef.current) return
      
      console.timeEnd('[gen] priority')
      setIsPriorityBatchDone(true)
      
      // Auto-switch to generated view
      if (!didAutoSwitchRef.current) {
        didAutoSwitchRef.current = true
        console.log('[gen] Priority done, auto-switching to generated view')
        
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
      }
      
      const successCount = priorityPromises.filter((p: any) => p.status === 'fulfilled').length
      console.log(`[gen] Priority batch: ${successCount}/${priority.length} succeeded`)
    })
    
    // Background batch completion
    void Promise.allSettled(bgPromises).then(() => {
      if (runId !== generationRunIdRef.current) return
      
      console.timeEnd('[gen] background')
      setBackgroundInProgress(false)
      setIsGenerating(false)
      
      const allResults = Object.values(productStatus)
      const readyResults = allResults.filter(s => s === 'ready').length
      const errorResults = allResults.filter(s => s === 'error').length
      
      setIsPersonalized(readyResults > 0)
      console.log(`[gen] All done: ${readyResults} ready, ${errorResults} errors, runId=${runId}`)
    })
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
              <SmoothProgressBar progress={progressPercent} isActive={isGenerating} />
              <p className="text-xs text-muted-foreground font-sans tracking-wider animate-pulse mb-3 font-medium">
                {progressText}
              </p>
              <h3 className="text-xs font-medium mb-4 tracking-wide animate-pulse transition-all duration-500 text-foreground">
                {displayProductName ? `Generating: ${displayProductName}` : 'Generating images...'}
              </h3>
              {showBackgroundIndicator && (
                <p className="text-xs text-muted-foreground font-sans tracking-wider mb-2">
                  ✨ {totalCount - readyCount} more in background...
                </p>
              )}
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
                {viewMode === "generated" 
                  ? "Viewing your personalized photos"
                  : "Drop a new photo to generate fresh samples"
                }
              </p>
              {viewMode === "generated" && (
                <Button
                  onClick={() => {
                    setViewMode("products")
                    setShowGallery(false)
                  }}
                  variant="outline"
                  className="w-full border-border hover:bg-accent text-xs font-medium tracking-widest uppercase px-4 py-2 mb-2 transition-all duration-300 hover:scale-105"
                >
                  SHOW ORIGINAL PRODUCTS
                </Button>
              )}
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
          <a href="https://aiforproductivity.id/" className="text-xl font-bold ms-4">AI For Productivity</a>
          </div>

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
                      {formatCurrency(product.price, product.currency)}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (product.buy_link) {
                          window.open(product.buy_link, '_blank', 'noopener,noreferrer')
                        } else {
                          alert('Link pembelian belum tersedia untuk produk ini')
                        }
                      }}
                      className="bg-primary text-primary-foreground px-6 py-2 text-xs font-medium tracking-widest uppercase cursor-pointer hover:bg-primary/90 transition-all duration-300 hover:scale-105 rounded-lg"
                    >
                      BUY
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
