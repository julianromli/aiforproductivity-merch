"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Palette, Type, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SettingsValue = 
  | { url: string; alt: string }
  | { sans: string; serif: string; mono: string }
  | Record<string, string>

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
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Logo state
  const [logoMode, setLogoMode] = useState<"upload" | "url">("url")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoAlt, setLogoAlt] = useState("Store Logo")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Font state
  const [fontSans, setFontSans] = useState("Manrope")
  const [fontSerif, setFontSerif] = useState("Instrument Serif")
  const [fontMono, setFontMono] = useState("Geist Mono")

  // Theme state
  const [lightThemeCSS, setLightThemeCSS] = useState("")
  const [darkThemeCSS, setDarkThemeCSS] = useState("")
  const [cssError, setCssError] = useState("")

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
      data.settings?.forEach((setting) => {
        if (setting.key === "logo") {
          const logo = setting.value as { url: string; alt: string }
          setLogoUrl(logo.url)
          setLogoAlt(logo.alt)
        } else if (setting.key === "fonts") {
          const fonts = setting.value as { sans: string; serif: string; mono: string }
          setFontSans(fonts.sans)
          setFontSerif(fonts.serif)
          setFontMono(fonts.mono)
        } else if (setting.key === "theme_light") {
          const theme = setting.value as Record<string, string>
          setLightThemeCSS(formatCSSVariables(theme))
        } else if (setting.key === "theme_dark") {
          const theme = setting.value as Record<string, string>
          setDarkThemeCSS(formatCSSVariables(theme))
        }
      })
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

    setLogoFile(file)

    // Auto-upload
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload/logo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json() as { url?: string; error?: string; details?: string }

      if (!response.ok) {
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
      setLogoFile(null)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSaveLogo = async () => {
    setSaving(true)
    try {
      await saveSetting("logo", { url: logoUrl, alt: logoAlt })
      toast({
        title: "Success",
        description: "Logo settings saved successfully",
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

    try {
      // Parse and validate CSS
      let lightTheme = {}
      let darkTheme = {}

      if (lightThemeCSS.trim()) {
        lightTheme = parseCSSVariables(lightThemeCSS)
        if (Object.keys(lightTheme).length === 0) {
          throw new Error("Invalid light theme CSS format")
        }
      }

      if (darkThemeCSS.trim()) {
        darkTheme = parseCSSVariables(darkThemeCSS)
        if (Object.keys(darkTheme).length === 0) {
          throw new Error("Invalid dark theme CSS format")
        }
      }

      // Save both themes
      if (Object.keys(lightTheme).length > 0) {
        await saveSetting("theme_light", lightTheme)
      }

      if (Object.keys(darkTheme).length > 0) {
        await saveSetting("theme_dark", darkTheme)
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
                <Label htmlFor="logo-alt">Logo Alt Text</Label>
                <Input
                  id="logo-alt"
                  placeholder="My Store Logo"
                  value={logoAlt}
                  onChange={(e) => setLogoAlt(e.target.value)}
                />
              </div>

              {logoUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="rounded border p-4 bg-muted/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt={logoAlt} className="h-16 object-contain" />
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
            <CardContent className="space-y-4">
              <Alert>
                <Palette className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Use TweakCN to generate your color scheme visually</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://tweakcn.com/editor/theme" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open TweakCN
                    </a>
                  </Button>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="light-theme">Light Mode CSS Variables</Label>
                <Textarea
                  id="light-theme"
                  placeholder="--background: oklch(1.0000 0 0);
--foreground: oklch(0.2367 0.0587 264.2278);
--primary: oklch(0.4640 0.1131 249.0359);
..."
                  value={lightThemeCSS}
                  onChange={(e) => {
                    setLightThemeCSS(e.target.value)
                    setCssError("")
                  }}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Copy the variables from the :root section in TweakCN
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dark-theme">Dark Mode CSS Variables</Label>
                <Textarea
                  id="dark-theme"
                  placeholder="--background: oklch(0.0800 0 0);
--foreground: oklch(0.9500 0.0025 228.7857);
--primary: oklch(0.6692 0.1607 245.0110);
..."
                  value={darkThemeCSS}
                  onChange={(e) => {
                    setDarkThemeCSS(e.target.value)
                    setCssError("")
                  }}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Copy the variables from the .dark section in TweakCN
                </p>
              </div>

              {cssError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{cssError}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSaveTheme} disabled={saving}>
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
