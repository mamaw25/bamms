(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f2b15f93._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware,
    "updateSession",
    ()=>updateSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
async function updateSession(request) {
    // Public routes that don't need authentication
    const publicRoutes = [
        '/',
        '/login',
        '/register',
        '/verify-email',
        '/about',
        '/kiosk'
    ];
    const pathname = request.nextUrl.pathname;
    // Skip auth check for public routes
    if (publicRoutes.includes(pathname) || pathname.startsWith('/verify-email')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
            request
        });
    }
    // Create response first without setting cookies
    let supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Missing Supabase environment variables in middleware');
            return supabaseResponse;
        }
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
            cookies: {
                getAll () {
                    return request.cookies.getAll();
                },
                setAll (cookiesToSet) {
                    // Don't set cookies in middleware to avoid overwriting other tab's session
                    // Each tab should manage its own session via sessionStorage
                    cookiesToSet.forEach(({ name, value })=>request.cookies.set(name, value));
                }
            },
            auth: {
                // Suppress automatic error logging from getUser() when no session exists
                throwOnError: false
            }
        });
        // Only check authentication for protected routes
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // No user - redirect to login for protected routes
                if (pathname.startsWith('/dashboard')) {
                    const url = request.nextUrl.clone();
                    url.pathname = '/login';
                    if (pathname.startsWith('/dashboard/admin')) {
                        url.searchParams.set('role', 'admin');
                    }
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
                }
            } else {
                // User exists - validate role matches route if on dashboard
                if (pathname.startsWith('/dashboard')) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    // Check if accessing admin route without admin role
                    if (pathname.startsWith('/dashboard/admin')) {
                        if (profile?.role !== 'admin') {
                            // Not admin - redirect to staff dashboard
                            const url = request.nextUrl.clone();
                            url.pathname = '/dashboard';
                            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
                        }
                    }
                    // Check if accessing staff dashboard with admin role
                    if (pathname === '/dashboard' && profile?.role === 'admin') {
                        // Admin accessing staff dashboard - redirect to admin dashboard
                        const url = request.nextUrl.clone();
                        url.pathname = '/dashboard/admin';
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
                    }
                }
            }
        } catch (authError) {
            // Silently fail for auth errors on protected routes that should redirect to login anyway
            const error = authError;
            // Only log unexpected errors (not refresh token or standard auth errors)
            const isExpectedError = error?.code === 'refresh_token_not_found' || error?.status === 400 || error?.message?.includes('refresh') || error?.message?.includes('Refresh');
            if (!isExpectedError) {
                console.error('Middleware auth check failed:', authError);
            }
            // Redirect to login if auth check fails on protected routes
            if (pathname.startsWith('/dashboard') || pathname.startsWith('/kiosk')) {
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
            }
        }
        return supabaseResponse;
    } catch (error) {
        console.error('Middleware error:', error);
        return supabaseResponse;
    }
}
async function middleware(request) {
    return await updateSession(request);
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */ '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f2b15f93._.js.map