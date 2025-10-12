"use client"

import { useEffect } from "react"

export function ThemeApplier() {
  useEffect(() => {
    // Fetch default theme from admin settings
    fetch("/api/settings/default-theme")
      .then(res => res.json())
      .then(data => {
        const theme = data.theme as "light" | "dark" | "system"
        applyTheme(theme)
      })
      .catch(err => {
        console.error("Failed to load default theme:", err)
        // Fallback to system preference
        applyTheme("system")
      })
  }, [])

  return null // This component doesn't render anything
}

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement

  if (theme === "system") {
    // Follow system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (prefersDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    
    // Listen for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (e.matches) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    })
  } else if (theme === "dark") {
    // Always dark
    root.classList.add("dark")
  } else {
    // Always light
    root.classList.remove("dark")
  }
}
