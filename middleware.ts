import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

    // Refreshes the session if it's expired
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // No user - check if accessing protected routes
        if (request.nextUrl.pathname.startsWith('/dashboard')) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
            url.searchParams.set('role', 'admin')
          }
          return NextResponse.redirect(url)
        }
      } else {
        // User exists - validate role matches route
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Check if accessing admin route without admin role
        if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
          if (profile?.role !== 'admin') {
            // Not admin - redirect to staff dashboard
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          }
        }
        
        // Check if accessing staff dashboard with admin role
        if (request.nextUrl.pathname === '/dashboard' && profile?.role === 'admin') {
          // Admin accessing staff dashboard - redirect to admin dashboard
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard/admin'
          return NextResponse.redirect(url)
        }
      }
    } catch (authError: unknown) {
      // Suppress "refresh_token_not_found" errors on first load - this is expected when no session exists
      // This is not an actual error condition, just the auth system checking for a session
      const error = authError as { code?: string; status?: number; message?: string } | null
      const isRefreshTokenError = error?.code === 'refresh_token_not_found' || error?.status === 400
      const isExpectedError = isRefreshTokenError || error?.message?.includes('refresh')
      
      if (!isExpectedError) {
        console.error('Middleware auth check failed:', authError);
      }
      // Continue with the response even if auth check fails - refresh token absence is not fatal
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
