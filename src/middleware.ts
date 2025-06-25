import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from './lib/supabase/server';
import { cookies } from 'next/headers';

// Route configuration
const routeConfig = {
  // Public routes that don't require authentication
  public: ['/', '/about', '/contact', '/privacy', '/terms', '/auth/callback'],
  
  // Authentication routes (login, register, etc.)
  auth: ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'],
  
  // Protected routes that require authentication
  protected: {
    // Role-based routes
    user: ['/dashboard', '/profile', '/settings'],
    admin: ['/admin', '/admin/users', '/admin/settings'],
    
    // Any authenticated user can access these
    any: ['/api/account', '/api/profile']
  },
  
  // API routes that require authentication
  api: {
    user: ['/api/user'],
    admin: ['/api/admin'],
    any: ['/api/protected']
  }
};

// Combine all protected routes for easier checking
const allProtectedRoutes = [
  ...routeConfig.protected.user,
  ...routeConfig.protected.admin,
  ...routeConfig.protected.any,
  ...routeConfig.api.user,
  ...routeConfig.api.admin,
  ...routeConfig.api.any
];

function isMatchingRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`) ||
    pathname.startsWith(`${route}?`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();
  
  // Create a Supabase client with cookies
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Get the session from Supabase
  const { data: { session }, error } = await supabase.auth.getSession();
  
  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();
  if (user && !session) {
    await supabase.auth.refreshSession();
  }
  
  // Log session for debugging
  console.log('Middleware - Session:', { 
    hasSession: !!session,
    path: pathname,
    error: error?.message
  });
  
  const userRole = session?.user?.user_metadata?.role || 'guest';
  const callbackUrl = `${pathname}${search}`;
  
  // Log session for debugging (remove in production)
  console.log('Middleware - Session:', { 
    hasSession: !!session, 
    userRole,
    pathname 
  });

  // 1. Handle authentication routes (login, register, etc.)
  if (isMatchingRoute(pathname, routeConfig.auth)) {
    if (session) {
      // Redirect to dashboard if user is already logged in
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // 2. Check if the route is public
  const isPublicRoute = isMatchingRoute(pathname, routeConfig.public);
  if (isPublicRoute) {
    return response;
  }

  // 3. Handle protected routes
  const isProtectedRoute = allProtectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    // 3.1 Check if user is authenticated
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', callbackUrl);
      return NextResponse.redirect(loginUrl);
    }

    // 3.2 Check role-based access for admin routes
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3.3 Check role-based access for API routes
    if (pathname.startsWith('/api/admin') && userRole !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP Header - adjust based on your needs
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.newsguard.ai;"
  );

  return response;
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth/callback (handled by Supabase)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth/callback).*)',
  ],
};
