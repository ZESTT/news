import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // This is a minimal setup to just pass the request through
  // but still initialize Supabase to test environment variables
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
          // This part is for Supabase to manage session cookies
          // You still need it for createServerClient to work correctly
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request, }) // This line could be slightly inefficient
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Attempt to get user to ensure Supabase client is working
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log("Middleware - User status:", user ? "Authenticated" : "Unauthenticated", "Error:", error?.message);
  } catch (e) {
    console.error("Middleware - Supabase getUser failed:", e);
  }

  // Just pass the request through for now
  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}