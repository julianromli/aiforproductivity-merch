import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import ClientLayout from "./client-layout"

import { Plus_Jakarta_Sans, Geist_Mono, Inter as V0_Font_Inter, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const v0FontInter = V0_Font_Inter({ weight: ["100","200","300","400","500","600","700","800","900"], subsets: ["latin"] })
const v0FontGeistMono = V0_Font_Geist_Mono({ weight: ["100","200","300","400","500","600","700","800","900"], subsets: ["latin"] })
const v0FontSourceSerif4 = V0_Font_Source_Serif_4({ weight: ["200","300","400","500","600","700","800","900"], subsets: ["latin"] })

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
