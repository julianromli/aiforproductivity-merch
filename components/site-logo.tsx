"use client"

import { useEffect, useState } from "react"

type LogoSettings = {
  url: string
  alt: string
}

type SiteLogoProps = {
  className?: string
  height?: number
  showText?: boolean
  textClassName?: string
}

export function SiteLogo({ className = "h-10 w-auto", height, showText = false, textClassName = "text-xl font-bold ms-4" }: SiteLogoProps) {
  const [logo, setLogo] = useState<LogoSettings>({
    url: "https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png",
    alt: "AI For Productivity"
  })
  const [siteName, setSiteName] = useState("AI For Productivity")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch logo and site name from settings
    Promise.all([
      fetch("/api/settings/logo").then(res => res.json()),
      fetch("/api/settings/site-name").then(res => res.json())
    ])
      .then(([logoData, nameData]) => {
        if (logoData.url && logoData.url !== "/placeholder.svg") {
          setLogo(logoData)
        }
        if (nameData.name) {
          setSiteName(nameData.name)
        }
      })
      .catch(err => {
        console.error("Failed to load settings:", err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Calculate height from className if not provided
  const heightValue = height || (className.includes("h-10") ? 40 : className.includes("h-8") ? 32 : 40)

  return (
    <div className="flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={logo.url} 
        alt={logo.alt} 
        className={className}
        style={{ 
          maxHeight: `${heightValue}px`,
          height: "auto",
          width: "auto",
          objectFit: "contain"
        }}
        onError={(e) => {
          // Fallback to default if custom logo fails
          const target = e.target as HTMLImageElement
          target.src = "https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png"
        }}
      />
      {showText && (
        <a href="https://aiforproductivity.id/" className={textClassName}>
          {siteName}
        </a>
      )}
    </div>
  )
}
