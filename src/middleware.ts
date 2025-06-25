import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Route configuration
const routeConfig = {
  // Public routes that don't require authentication
  public: ["/", "/about", "/contact", "/privacy", "/terms", "/auth/callback"],

  // Authentication routes (login, register, etc.)
  auth: ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"],

  // Protected routes that require authentication
  protected: {
    // Role-based routes
    user: ["/dashboard", "/profile", "/settings"],
    admin: ["/admin", "/admin/users", "/admin/settings"],

    // Any authenticated user can access these
    any: ["/api/account", "/api/profile"],
  },

  // API routes that require authentication
  api: {
    user: ["/api/user"],
    admin: ["/api/admin"],
    any: ["/api/protected"],
  },
}

// Combine all protected routes for easier checking
const allProtectedRoutes = [
  ...routeConfig.protected.user,
  ...routeConfig.protected.admin,
  ...routeConfig.protected.any,
  ...routeConfig.api.user,
  ...routeConfig.api.admin,
  ...routeConfig.api.any,
]

function isMatchingRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`),
  )
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // CSP Header - adjust based on your needs
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.newsguard.ai;",
  )
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const callbackUrl = `${pathname}${search}`
  const userRole = user?.user_metadata?.role || "guest"

  // Log session for debugging (remove in production)
  console.log("Middleware - Session:", {
    hasUser: !!user,
    userRole,
    pathname,
    error: error?.message,
  })

  // 1. Handle authentication routes (login, register, etc.)
  if (isMatchingRoute(pathname, routeConfig.auth)) {
    if (user) {
      // Redirect to dashboard if user is already logged in
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
    // Add security headers and return
    addSecurityHeaders(supabaseResponse)
    return supabaseResponse
  }

  // 2. Check if the route is public
  const isPublicRoute = isMatchingRoute(pathname, routeConfig.public)
  if (isPublicRoute) {
    addSecurityHeaders(supabaseResponse)
    return supabaseResponse
  }

  // 3. Handle protected routes
  const isProtectedRoute = allProtectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isProtectedRoute) {
    // 3.1 Check if user is authenticated
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("callbackUrl", callbackUrl)
      return NextResponse.redirect(url)
    }

    // 3.2 Check role-based access for admin routes
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    // 3.3 Check role-based access for API routes
    if (pathname.startsWith("/api/admin") && userRole !== "admin") {
      return new NextResponse(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  // Add security headers to all responses
  addSecurityHeaders(supabaseResponse)

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
