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
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
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
