"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt: string
}

export function ImagePreviewDialog({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
}: ImagePreviewDialogProps) {
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setIsDragging(false)
    }
  }, [isOpen])

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.5))
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 4))
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Don't render if no image source
  if (!imageSrc) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden border-0 bg-black/95 backdrop-blur-md">
        {/* Hidden Dialog Title for accessibility */}
        <DialogTitle className="sr-only">{imageAlt || "Image preview"}</DialogTitle>
        
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
          aria-label="Close preview"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 z-50 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
            disabled={scale <= 0.5}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          
          <span className="text-white text-sm font-medium min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
            disabled={scale >= 4}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handleReset}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 ml-2"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Image Container */}
        <div
          ref={imageRef}
          className="w-full h-[95vh] flex items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className={cn(
              "max-w-full max-h-full object-contain select-none transition-transform",
              isDragging ? "duration-0" : "duration-300 ease-out"
            )}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }}
            draggable={false}
          />
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-xs text-center">
            {scale > 1 
              ? "Drag to pan • Scroll to zoom • Click reset to fit" 
              : "Click zoom buttons or scroll to zoom in"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}