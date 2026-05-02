import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login', '/register', '/verify-email', '/about']
  const pathname = request.nextUrl.pathname

  // Skip auth check for public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/verify-email')) {
    return NextResponse.next({
      request,
    })
  }

  // Create response first without setting cookies
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables in middleware');
      return supabaseResponse;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            // Don't set cookies in middleware to avoid overwriting other tab's session
            // Each tab should manage its own session via sessionStorage
            cookiesToSet.forEach(({ name, value }) => 
              request.cookies.set(name, value)
            )
          },
        },
        auth: {
          // Suppress automatic error logging from getUser() when no session exists
          throwOnError: false,
        }
      }
    )

    // Only check authentication for protected routes
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // No user - redirect to login for protected routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/kiosk')) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          if (pathname.startsWith('/dashboard/admin')) {
            url.searchParams.set('role', 'admin')
          }
          return NextResponse.redirect(url)
        }
      } else {
        // User exists - validate role matches route if on dashboard
        if (pathname.startsWith('/dashboard')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          // Check if accessing admin route without admin role
          if (pathname.startsWith('/dashboard/admin')) {
            if (profile?.role !== 'admin') {
              // Not admin - redirect to staff dashboard
              const url = request.nextUrl.clone()
              url.pathname = '/dashboard'
              return NextResponse.redirect(url)
            }
          }
          
          // Check if accessing staff dashboard with admin role
          if (pathname === '/dashboard' && profile?.role === 'admin') {
            // Admin accessing staff dashboard - redirect to admin dashboard
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard/admin'
            return NextResponse.redirect(url)
          }
        }
      }
    } catch (authError: unknown) {
      // Silently fail for auth errors on protected routes that should redirect to login anyway
      const error = authError as { code?: string; status?: number; message?: string } | null
      
      // Only log unexpected errors (not refresh token or standard auth errors)
      const isExpectedError = 
        error?.code === 'refresh_token_not_found' || 
        error?.status === 400 ||
        error?.message?.includes('refresh') ||
        error?.message?.includes('Refresh')
      
      if (!isExpectedError) {
        console.error('Middleware auth check failed:', authError);
      }
      
      // Redirect to login if auth check fails on protected routes
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/kiosk')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error);
    return supabaseResponse;
  }
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

