import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import ClientLayout from "./client-layout"

import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${geistMono.variable}`}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
