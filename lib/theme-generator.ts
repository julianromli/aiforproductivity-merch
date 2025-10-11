import type { FontSettings, ThemeSettings } from "./settings-service"

// Generate CSS for custom fonts
export function generateFontCSS(fonts: FontSettings): string {
  return `
:root, .dark {
  --font-sans: ${fonts.sans}, ui-sans-serif, sans-serif, system-ui;
  --font-serif: ${fonts.serif}, ui-serif, serif;
  --font-mono: ${fonts.mono}, ui-monospace, monospace;
}
  `.trim()
}

// Generate CSS for custom theme colors
export function generateThemeCSS(lightTheme?: ThemeSettings, darkTheme?: ThemeSettings): string {
  let css = ""

  if (lightTheme && Object.keys(lightTheme).length > 0) {
    const lightVars = Object.entries(lightTheme)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n")
    
    css += `
:root {
${lightVars}
}
    `.trim()
  }

  if (darkTheme && Object.keys(darkTheme).length > 0) {
    const darkVars = Object.entries(darkTheme)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n")
    
    css += `

.dark {
${darkVars}
}
    `.trim()
  }

  return css
}

// Generate complete custom CSS from all settings
export function generateCustomCSS(
  fonts?: FontSettings,
  lightTheme?: ThemeSettings,
  darkTheme?: ThemeSettings
): string {
  const parts: string[] = []

  if (fonts) {
    parts.push(generateFontCSS(fonts))
  }

  const themeCSS = generateThemeCSS(lightTheme, darkTheme)
  if (themeCSS) {
    parts.push(themeCSS)
  }

  return parts.join("\n\n")
}

// Parse CSS variables from pasted TweakCN output
export function parseCSSVariables(cssText: string): ThemeSettings {
  const variables: ThemeSettings = {}
  
  // Match CSS variable declarations: --variable-name: value;
  const regex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g
  let match

  while ((match = regex.exec(cssText)) !== null) {
    const [, varName, varValue] = match
    variables[varName] = varValue.trim()
  }

  return variables
}

// Validate if string contains valid CSS variables
export function isValidCSSVariables(cssText: string): boolean {
  if (!cssText || typeof cssText !== "string") return false
  
  // Check if it contains at least one CSS variable declaration
  const hasVariables = /--[a-zA-Z0-9-_]+\s*:\s*[^;]+;/.test(cssText)
  
  return hasVariables
}

// Extract :root and .dark sections separately from full CSS
export function extractThemeSections(cssText: string): {
  light: ThemeSettings | null
  dark: ThemeSettings | null
} {
  const result: { light: ThemeSettings | null; dark: ThemeSettings | null } = { light: null, dark: null }

  // Extract :root section
  const rootMatch = cssText.match(/:root\s*\{([^}]+)\}/)
  if (rootMatch) {
    result.light = parseCSSVariables(rootMatch[1])
  }

  // Extract .dark section
  const darkMatch = cssText.match(/\.dark\s*\{([^}]+)\}/)
  if (darkMatch) {
    result.dark = parseCSSVariables(darkMatch[1])
  }

  return result
}

// Get Google Fonts URL for custom fonts
export function getGoogleFontsURL(fonts: FontSettings): string {
  const families = [fonts.sans, fonts.serif, fonts.mono]
    .filter(Boolean)
    .map((font) => font.replace(/\s+/g, "+"))
    .join("&family=")

  if (!families) return ""

  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`
}
