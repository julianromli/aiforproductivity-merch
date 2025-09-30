"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Login1Props {
  logo: {
    url: string
    src: string
    alt: string
    title?: string
  }
  email: string
  password: string
  loading?: boolean
  error?: string
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onSubmit: (e: React.FormEvent) => void
  buttonText?: string
}

const Login1 = ({
  logo = {
    url: "https://aiforproductivity.id",
    src: "https://aiforproductivity.id/wp-content/uploads/2025/06/AI-For-Productivity-Logo-e1752123757152.png",
    alt: "AI For Productivity",
    title: "AI For Productivity",
  },
  email,
  password,
  loading = false,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  buttonText = "Login",
}: Login1Props) => {
  return (
    <section className="bg-muted bg-background h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-10 dark:invert"
                />
              </a>
            </div>
            {logo.title && <h1 className="text-xl font-semibold">{logo.title}</h1>}
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="mt-2 w-full" disabled={loading}>
                  {loading ? "Signing in..." : buttonText}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export { Login1 }