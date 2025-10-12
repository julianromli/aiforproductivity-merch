import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import ClientLayout from "./client-layout"

import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { getFontSettings, getThemeSettings } from "@/lib/settings-service"
import { generateCustomCSS } from "@/lib/theme-generator"
import { validateServerEnvironment } from "@/lib/env-validator"

// Validate environment variables on server startup
validateServerEnvironment()

// Initialize fonts
const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "AI For Productivity Merchandise - Official Merch Store",
  description: "Shop exclusive AI For Productivity merchandise. High-quality apparel and accessories for AI enthusiasts and productivity lovers. Try our AI-powered virtual try-on feature!",
  keywords: ["AI for productivity", "productivity merchandise", "AI merch", "tech apparel", "AI clothing", "productivity gear"],
  authors: [{ name: "AI For Productivity", url: "https://aiforproductivity.id" }],
  creator: "AI For Productivity",
  publisher: "AI For Productivity",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://aiforproductivity.id",
    siteName: "AI For Productivity Merchandise",
    title: "AI For Productivity Merchandise - Official Merch Store",
    description: "Shop exclusive AI For Productivity merchandise with AI-powered virtual try-on",
    images: [
      {
        url: "https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png",
        width: 1200,
        height: 630,
        alt: "AI For Productivity Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI For Productivity Merchandise",
    description: "Shop exclusive AI For Productivity merch with AI virtual try-on",
    images: ["https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: "your-verification-code",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch customization settings
  const fonts = await getFontSettings()
  const lightTheme = await getThemeSettings("light")
  const darkTheme = await getThemeSettings("dark")

  // Generate custom CSS
  const customCSS = generateCustomCSS(fonts, lightTheme || undefined, darkTheme || undefined)

  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${geistMono.variable}`}>
      <head>
        {customCSS && (
          <style
            dangerouslySetInnerHTML={{
              __html: customCSS,
            }}
          />
        )}
        {fonts && (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${fonts.sans.replace(/\s+/g, "+")}:wght@200;300;400;500;600;700;800&family=${fonts.serif.replace(/\s+/g, "+")}:wght@400;500;600;700&family=${fonts.mono.replace(/\s+/g, "+")}:wght@100;200;300;400;500;600;700;800;900&display=swap`}
          />
        )}
        <link rel="icon" href="/api/favicon" type="image/x-icon" />
        <link rel="shortcut icon" href="/api/favicon" type="image/x-icon" />
      </head>
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
