"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageWithLoadingProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
}

export function ImageWithLoading({
  src,
  alt,
  className,
  placeholder = "/loading-screen-animation.png",
  onLoad,
}: ImageWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Loading placeholder */}
      {isLoading && (
        <div className={cn("absolute inset-0 bg-muted animate-pulse flex items-center justify-center", className)}>
          <div className="w-8 h-8 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}

      {/* Actual image */}
      <img
        src={hasError ? placeholder : src}
        alt={alt}
        className={cn(
          "transition-all duration-500",
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  )
}
