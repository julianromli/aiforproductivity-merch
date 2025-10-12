"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Palette, Type, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, ExternalLink, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Settings = {
  logo?: { url: string; alt: string }
  fonts?: { sans: string; serif: string; mono: string }
  theme_light?: Record<string, string>
  theme_dark?: Record<string, string>
}

const AVAILABLE_FONTS = {
  sans: ["Manrope", "Inter", "Roboto", "Poppins", "Open Sans", "Lato", "Montserrat", "Nunito"],
  serif: ["Instrument Serif", "Playfair Display", "Merriweather", "Lora", "Crimson Text"],
  mono: ["Geist Mono", "Fira Code", "JetBrains Mono", "Source Code Pro", "IBM Plex Mono"],
}

export default function CustomizePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Logo state
  const [logoMode, setLogoMode] = useState<"upload" | "url">("url")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoAlt, setLogoAlt] = useState("Website Logo")
  const [siteName, setSiteName] = useState("AI For Productivity")
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Font state
  const [fontSans, setFontSans] = useState("Manrope")
  const [fontSerif, setFontSerif] = useState("Instrument Serif")
  const [fontMono, setFontMono] = useState("Geist Mono")

  // Theme state
  const [tweakcnCSS, setTweakcnCSS] = useState("")
  const [cssError, setCssError] = useState("")
  const [cssSuccess, setCssSuccess] = useState("")

  // Load settings on mount
  useEffect(() => {
    void fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json() as { settings: Array<{ key: string; value: unknown }> }

      // Populate form fields
      let lightVars = ""
      let darkVars = ""
      
      data.settings?.forEach((setting) => {
        if (setting.key === "logo") {
          const logo = setting.value as { url: string; alt: string }
          setLogoUrl(logo.url)
          setLogoAlt(logo.alt)
        } else if (setting.key === "site_name") {
          setSiteName(setting.value as string)
        } else if (setting.key === "fonts") {
          const fonts = setting.value as { sans: string; serif: string; mono: string }
          setFontSans(fonts.sans)
          setFontSerif(fonts.serif)
          setFontMono(fonts.mono)
        } else if (setting.key === "theme_light") {
          const theme = setting.value as Record<string, string>
          lightVars = formatCSSVariables(theme)
        } else if (setting.key === "theme_dark") {
          const theme = setting.value as Record<string, string>
          darkVars = formatCSSVariables(theme)
        }
      })
      
      // Reconstruct full TweakCN format for editing
      if (lightVars || darkVars) {
        let fullCSS = ""
        if (lightVars) {
          fullCSS += `:root {\n${lightVars}\n}`
        }
        if (darkVars) {
          if (fullCSS) fullCSS += "\n\n"
          fullCSS += `.dark {\n${darkVars}\n}`
        }
        setTweakcnCSS(fullCSS)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCSSVariables = (theme: Record<string, string>): string => {
    return Object.entries(theme)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n")
  }

  const extractThemeSections = (cssText: string): {
    light: Record<string, string> | null
    dark: Record<string, string> | null
  } => {
    const result: { light: Record<string, string> | null; dark: Record<string, string> | null } = { 
      light: null, 
      dark: null 
    }

    // Extract :root section
    const rootMatch = cssText.match(/:root\s*\{([^}]+)\}/s)
    if (rootMatch) {
      result.light = parseCSSVariables(rootMatch[1])
    }

    // Extract .dark section
    const darkMatch = cssText.match(/\.dark\s*\{([^}]+)\}/s)
    if (darkMatch) {
      result.dark = parseCSSVariables(darkMatch[1])
    }

    return result
  }
  
  const parseCSSVariables = (cssText: string): Record<string, string> => {
    const variables: Record<string, string> = {}
    const regex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g
    let match

    while ((match = regex.exec(cssText)) !== null) {
      const [, varName, varValue] = match
      variables[varName] = varValue.trim()
    }

    return variables
  }

  const saveSetting = async (key: string, value: unknown) => {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })

    if (!response.ok) {
      throw new Error("Failed to save setting")
    }

    return response.json()
  }

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload JPEG, PNG, WebP, GIF, or SVG image",
        variant: "destructive",
      })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Logo must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    // Auto-upload
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload/logo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json() as { 
        url?: string
        error?: string
        details?: string
        action?: string
      }

      if (!response.ok) {
        // Handle Vercel Blob not configured error
        if (response.status === 503 || data.action === "setup_blob") {
          toast({
            title: "Vercel Blob Not Configured",
            description: "Please use 'Use URL' mode to enter an external image URL, or contact your administrator to set up Vercel Blob storage.",
            variant: "destructive",
            duration: 8000,
          })
          // Auto-switch to URL mode
          setLogoMode("url")
          return
        }
        
        throw new Error(data.error || data.details || "Upload failed")
      }

      if (data.url) {
        setLogoUrl(data.url)
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        })
      }
    } catch (error) {
      console.error("Failed to upload logo:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload logo"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSaveLogo = async () => {
    setSaving(true)
    try {
      await saveSetting("logo", { url: logoUrl, alt: logoAlt })
      await saveSetting("site_name", siteName)
      toast({
        title: "Success",
        description: "Logo and website name saved successfully. Reload page to see changes.",
      })
    } catch (error) {
      console.error("Failed to save logo:", error)
      toast({
        title: "Error",
        description: "Failed to save logo settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFonts = async () => {
    setSaving(true)
    try {
      await saveSetting("fonts", {
        sans: fontSans,
        serif: fontSerif,
        mono: fontMono,
      })

      toast({
        title: "Success",
        description: "Font settings saved successfully. Reload page to see changes.",
      })
    } catch (error) {
      console.error("Failed to save fonts:", error)
      toast({
        title: "Error",
        description: "Failed to save font settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTheme = async () => {
    setSaving(true)
    setCssError("")
    setCssSuccess("")

    try {
      if (!tweakcnCSS.trim()) {
        throw new Error("Please paste TweakCN CSS before saving")
      }

      // Extract :root and .dark sections from the pasted CSS
      const sections = extractThemeSections(tweakcnCSS)

      if (!sections.light && !sections.dark) {
        throw new Error("No valid :root or .dark sections found. Please paste the complete CSS from TweakCN including :root { } and .dark { } blocks.")
      }

      // Validate that we have some essential variables
      const essentialVars = ["background", "foreground", "primary"]
      const hasEssentials = sections.light && essentialVars.some(v => v in sections.light!)
      
      if (!hasEssentials && sections.light) {
        throw new Error("CSS doesn't contain essential color variables like --background, --foreground, --primary. Please copy the full CSS from TweakCN.")
      }

      // Save both themes
      if (sections.light && Object.keys(sections.light).length > 0) {
        await saveSetting("theme_light", sections.light)
        setCssSuccess(`Found ${Object.keys(sections.light).length} light theme variables`)
      }

      if (sections.dark && Object.keys(sections.dark).length > 0) {
        await saveSetting("theme_dark", sections.dark)
        setCssSuccess(prev => prev + ` and ${Object.keys(sections.dark!).length} dark theme variables`)
      }

      toast({
        title: "Success",
        description: "Theme settings saved successfully. Reload page to see changes.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save theme settings"
      setCssError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customize</h1>
        <p className="text-muted-foreground">Personalize your website appearance without coding</p>
      </div>

      <Tabs defaultValue="logo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logo">
            <ImageIcon className="mr-2 h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="fonts">
            <Type className="mr-2 h-4 w-4" />
            Fonts
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="mr-2 h-4 w-4" />
            Color Scheme
          </TabsTrigger>
        </TabsList>

        {/* Logo Tab */}
        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
              <CardDescription>Upload and configure your website logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload or URL Toggle */}
              <div className="space-y-2">
                <Label>Logo Source</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={logoMode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLogoMode("upload")}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={logoMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLogoMode("url")}
                  >
                    Use URL
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Use URL mode if file upload is not available
                </p>
              </div>

              {/* Upload Mode */}
              {logoMode === "upload" && (
                <div className="space-y-2">
                  <Label htmlFor="logo-file">Upload Logo</Label>
                  <Input
                    id="logo-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleLogoFileChange}
                    disabled={uploadingLogo}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max 2MB. Supports JPEG, PNG, WebP, GIF, SVG
                  </p>
                  {uploadingLogo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading to Vercel Blob...
                    </div>
                  )}
                </div>
              )}

              {/* URL Mode */}
              {logoMode === "url" && (
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Enter a public URL for your logo</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="site-name">Website Name</Label>
                <Input
                  id="site-name"
                  placeholder="AI For Productivity"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">This will appear next to your logo in the navbar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-alt">Logo Alt Text</Label>
                <Input
                  id="logo-alt"
                  placeholder="Website Logo"
                  value={logoAlt}
                  onChange={(e) => setLogoAlt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Alternative text for accessibility (used when image fails to load)</p>
              </div>

              {logoUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="rounded border p-8 bg-muted/50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={logoUrl} 
                      alt={logoAlt} 
                      className="max-h-16 w-auto object-contain"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleSaveLogo} disabled={saving || uploadingLogo || !logoUrl}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Save Logo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fonts Tab */}
        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle>Font Settings</CardTitle>
              <CardDescription>Choose fonts for different text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="font-sans">Sans-Serif Font (Body Text)</Label>
                <Select value={fontSans} onValueChange={setFontSans}>
                  <SelectTrigger id="font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.sans.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-serif">Serif Font (Headings)</Label>
                <Select value={fontSerif} onValueChange={setFontSerif}>
                  <SelectTrigger id="font-serif">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.serif.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-mono">Monospace Font (Code)</Label>
                <Select value={fontMono} onValueChange={setFontMono}>
                  <SelectTrigger id="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.mono.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Fonts will load from Google Fonts. Changes require page reload.</AlertDescription>
              </Alert>

              <Button onClick={handleSaveFonts} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Save Fonts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize your website colors using TweakCN</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle className="font-semibold">How to customize colors with TweakCN</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Click the button below to open TweakCN theme editor</li>
                    <li>Customize your colors visually (light & dark mode)</li>
                    <li>Scroll down to the &ldquo;Copy Code&rdquo; section in TweakCN</li>
                    <li>Copy <strong>ONLY</strong> the content from the <code className="text-xs bg-muted px-1 py-0.5 rounded">:root</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded">.dark</code> blocks (including the braces)</li>
                    <li>Paste the complete CSS into the textarea below</li>
                    <li>Click &ldquo;Save Color Scheme&rdquo;</li>
                  </ol>
                  <div className="flex justify-end pt-2">
                    <Button variant="default" size="sm" asChild>
                      <a href="https://tweakcn.com/editor/theme" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open TweakCN Editor
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {/* CSS Input */}
              <div className="space-y-2">
                <Label htmlFor="tweakcn-css" className="text-base font-semibold">TweakCN CSS (Complete Output)</Label>
                <Textarea
                  id="tweakcn-css"
                  placeholder={`:root {
  --background: oklch(1.0000 0 0);
  --foreground: oklch(0.2367 0.0587 264.2278);
  --primary: oklch(0.4640 0.1131 249.0359);
  ...
}

.dark {
  --background: oklch(0.0800 0 0);
  --foreground: oklch(0.9500 0.0025 228.7857);
  --primary: oklch(0.6692 0.1607 245.0110);
  ...
}`}
                  value={tweakcnCSS}
                  onChange={(e) => {
                    setTweakcnCSS(e.target.value)
                    setCssError("")
                    setCssSuccess("")
                  }}
                  className="min-h-[400px] font-mono text-xs leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ <strong>Important:</strong> Paste the complete CSS including <code className="bg-muted px-1 py-0.5 rounded">:root &#123; ... &#125;</code> and <code className="bg-muted px-1 py-0.5 rounded">.dark &#123; ... &#125;</code> blocks from TweakCN
                </p>
              </div>

              {/* Error Messages */}
              {cssError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{cssError}</AlertDescription>
                </Alert>
              )}

              {/* Success Messages */}
              {cssSuccess && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">{cssSuccess}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSaveTheme} disabled={saving || !tweakcnCSS.trim()}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Save Color Scheme
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
