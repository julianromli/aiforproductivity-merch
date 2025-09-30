import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow access (development mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase not configured - allowing access")
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow access to login page
    if (request.nextUrl.pathname === "/admin/login") {
      // If already logged in, redirect to admin dashboard
      if (user) {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return supabaseResponse
    }

    // For all other admin routes, require authentication
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized - Authentication required" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
