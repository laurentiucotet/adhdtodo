import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const pathname = request.nextUrl.pathname

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
          requestHeaders.set("Set-Cookie", `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}`)
        },
        remove(name: string, options: { path: string }) {
          requestHeaders.set("Set-Cookie", `${name}=; Path=${options.path}; Max-Age=0`)
        },
      },
    },
  )

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ["/tasks", "/settings"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Auth routes
  const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect logic
  if (isProtectedRoute && !session) {
    // Redirect to login if trying to access protected route without session
    const redirectUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    // Redirect to tasks if trying to access auth routes with session
    const redirectUrl = new URL("/tasks", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect root to tasks if authenticated, otherwise to login
  if (pathname === "/") {
    const redirectUrl = new URL(session ? "/tasks" : "/auth/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

