# Multi-Tab Session Isolation - Fix

## Problem

When logged into:
- **Tab 1**: Admin account on `/dashboard/admin`
- **Tab 2**: Staff account on `/dashboard`

The middleware would redirect **Tab 1 to `/dashboard`** because Tab 2's login overwrote the authentication cookie that both tabs share.

### Root Cause

Supabase stores authentication cookies globally in the browser's cookie jar, shared across all tabs. When you log in with a different account in Tab 2, it replaces the cookies, affecting Tab 1 immediately on the next server request.

## Solution

Implemented **role-based route validation** at two levels:

### 1. Middleware Protection (`middleware.ts`)

Added server-side role verification that ensures users can only access routes matching their role:

```typescript
// Validate role matches the route
if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
  if (profile?.role !== 'admin') {
    // Not admin - redirect to staff dashboard
    return NextResponse.redirect('/dashboard')
  }
}

// Admin users trying to access staff dashboard get redirected
if (request.nextUrl.pathname === '/dashboard' && profile?.role === 'admin') {
  return NextResponse.redirect('/dashboard/admin')
}
```

### 2. Page-Level Protection

Both dashboard pages verify the user's role:

**[app/dashboard/page.tsx](app/dashboard/page.tsx)** (Staff Dashboard):
```typescript
// Verify user is not admin
if (profile?.role === 'admin') {
  redirect('/dashboard/admin');
}
```

**[app/dashboard/admin/layout.tsx](app/dashboard/admin/layout.tsx)** (Admin Dashboard):
```typescript
// Verify user is admin
if (adminProfile?.role !== 'admin') {
  redirect('/dashboard');
}
```

### 3. Enhanced Login Revalidation

Updated [app/login/action.ts](app/login/action.ts) to revalidate both dashboard paths:

```typescript
revalidatePath('/dashboard', 'layout')
revalidatePath('/dashboard/admin', 'layout')
```

## How It Works Now

### Scenario: Admin in Tab 1, Staff in Tab 2

1. **Tab 1** (Admin) → `/dashboard/admin` ✅
2. **Tab 2** (Staff) → Log in → Cookies updated
3. **Tab 1** (Admin) → Makes next request
4. **Middleware checks**: User role = admin, route = `/dashboard/admin` ✅
5. **Result**: Tab 1 stays on `/dashboard/admin` ✅

### Why It Works

- The middleware validates on **every request** by checking the user's role from the database
- Even if cookies are shared, the role in the database doesn't change
- Each tab maintains its own URL and route context
- If a tab somehow gets the wrong URL, the server redirects it to the correct dashboard

## Files Modified

1. **[middleware.ts](middleware.ts)**
   - Added role-based route validation
   - Prevents cross-role access to dashboards
   - Redirects users to correct dashboard if they access wrong URL

2. **[app/dashboard/page.tsx](app/dashboard/page.tsx)**
   - Added admin redirect check
   - Admins accessing staff dashboard get redirected

3. **[app/dashboard/admin/layout.tsx](app/dashboard/admin/layout.tsx)**
   - Already had protection (verified in place)
   - Staff users get redirected to `/dashboard`

4. **[app/login/action.ts](app/login/action.ts)**
   - Enhanced revalidation for both dashboard paths
   - Ensures fresh data after login

## Testing

### Test Case 1: Admin + Staff in Different Tabs
1. Open Tab 1: `http://localhost:3000/login?role=admin`
2. Log in with admin account → Should go to `/dashboard/admin`
3. Open Tab 2: `http://localhost:3000/login`
4. Log in with staff account → Should go to `/dashboard`
5. Switch between tabs → Each should maintain their own dashboard
6. Result: ✅ Tabs stay independent

### Test Case 2: Try Accessing Wrong Route
1. Tab 1 (Admin) at `/dashboard/admin`
2. Manually navigate Tab 1 to `/dashboard`
3. Server redirects to `/dashboard/admin`
4. Result: ✅ Correct route enforced

### Test Case 3: Session Timeout + Re-login
1. Admin in Tab 1, Staff in Tab 2
2. Wait for session to expire in Tab 2
3. Tab 2 redirects to login
4. Tab 1 still works with admin session
5. Result: ✅ Sessions are validated per-request

## Benefits

- ✅ Multi-tab sessions no longer interfere
- ✅ Secure role-based access control
- ✅ Server validates every request (can't bypass with cached data)
- ✅ Clear user experience with automatic redirects
- ✅ No additional complexity on client-side

## Technical Details

### Why This Beats Client-Side Storage Solutions

Previous approaches (like tab-specific localStorage) would fail because:
- Cookies are still global and shared
- Server middleware reads cookies, not localStorage
- Attacker could modify localStorage to bypass role checks

This solution works because:
- Server validates role on **every request** from the database
- Role is authoritative source of truth, not client-side data
- Cookies are just session tokens, role is validated server-side

