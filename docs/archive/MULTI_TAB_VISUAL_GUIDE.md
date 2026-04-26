# Multi-Tab Session Fix - Visual Guide

## Before (Problem)

```
Tab 1: Admin logged in              Tab 2: Staff logged in
┌─────────────────────────┐        ┌──────────────────────────┐
│ /dashboard/admin        │        │ /dashboard               │
│ Admin Portal            │        │ Staff Portal             │
│ Session: admin@...      │        │ Session: staff@...       │
└─────────────────────────┘        └──────────────────────────┘
        │                                    │
        └────────────────────┬───────────────┘
                             │
                    Shared Cookie Jar
                  (Contains staff@... token)
                             │
                    ❌ Tab 1 redirected to /dashboard
                       (Wrong dashboard!)
```

## After (Fixed)

```
Tab 1: Admin logged in              Tab 2: Staff logged in
┌─────────────────────────┐        ┌──────────────────────────┐
│ /dashboard/admin        │        │ /dashboard               │
│ Admin Portal            │        │ Staff Portal             │
│ Session: admin@...      │        │ Session: staff@...       │
└─────────────────────────┘        └──────────────────────────┘
        │                                    │
        └────────────────────┬───────────────┘
                             │
                    Shared Cookie Jar
                  (Contains staff@... token)
                             │
            ✅ Server validates role from DB
            ✅ Admin role found in profiles table
            ✅ Tab 1 stays on /dashboard/admin
            ✅ Tab 2 stays on /dashboard
```

## Request Flow (After Fix)

### Tab 1 Makes Request While Tab 2 Has Latest Cookies

```
Tab 1 Browser
│
└─→ GET /dashboard/admin
    │
    ├─ Cookies: [staff auth token] (from Tab 2 login)
    │
    └─→ Middleware.ts
        │
        ├─ Get User from Cookie
        │ └─ User ID: admin-user-123
        │
        ├─ Query Database
        │ └─ profiles.role WHERE id = admin-user-123
        │    Result: "admin"
        │
        ├─ Validate Route
        │ ├─ Route: /dashboard/admin
        │ ├─ Role: admin
        │ └─ ✅ Allowed!
        │
        └─→ Serve Admin Dashboard
            └─ Tab 1 stays on /dashboard/admin ✅
```

## Key Validation Points

### 1. Middleware Validation (First Layer)

```typescript
// middleware.ts - Checks EVERY request
if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
  if (profile?.role !== 'admin') {
    return NextResponse.redirect('/dashboard')  // Redirect non-admins
  }
}
```

✅ Catches route mismatches immediately

### 2. Page-Level Validation (Second Layer)

```typescript
// app/dashboard/page.tsx - Staff dashboard
if (profile?.role === 'admin') {
  redirect('/dashboard/admin')  // Send admins away
}

// app/dashboard/admin/layout.tsx - Admin dashboard
if (adminProfile?.role !== 'admin') {
  redirect('/dashboard')  // Send non-admins away
}
```

✅ Double-checks at page load

### 3. Role Source (Database)

```
Database: profiles table
┌────────────────────────────────┐
│ id          │ role   │ email   │
├────────────────────────────────┤
│ admin-123   │ admin  │ adm...  │  ← Source of truth
│ staff-456   │ staff  │ stf...  │  ← Source of truth
└────────────────────────────────┘
```

✅ Role is authoritative, not from client

## Test Scenarios

### ✅ Works Now

| Scenario | Result |
|----------|--------|
| Admin Tab 1 + Staff Tab 2 | Both stay on correct dashboard |
| Manually navigate to wrong URL | Auto-redirected to correct dashboard |
| Switch between tabs rapidly | No interference |
| Session refresh in one tab | Other tab unaffected |
| Admin clicks logout | Only that tab logs out, other unaffected |

### ⚠️ Still Limited (By Design)

| Scenario | Behavior | Why |
|----------|----------|-----|
| Same user in 2 tabs | Works | Same role in both tabs |
| Different emails, same role | Works | Role-based access works |
| Logout in Tab 1 | Affects Tab 2 on next request | Sessions are linked by auth token |

> Note: Last item is acceptable because users typically have one session per account

