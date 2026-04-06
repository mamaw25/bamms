# Project Issues and Problems Report
**Generated:** March 23, 2026

---

## 🔴 CRITICAL ISSUES

### 1. **Hardcoded Admin Password in Production Code**
**Location:** [app/register/action.ts](app/register/action.ts#L42)
**Severity:** CRITICAL - Security Risk
**Description:**
```typescript
const SECRET_ADMIN_PASS = "ADMIN123";
```
- The admin verification code is hardcoded in the client-facing registration action
- This can be easily discovered by inspecting network requests or decompiling the code
- Anyone can become an admin by entering "ADMIN123" as the admin code

**Fix Required:**
- Move `SECRET_ADMIN_PASS` to environment variables
- Add `.env.local` entry: `NEXT_PUBLIC_ADMIN_CODE=<secure-value>`
- Remove hardcoded value from code

---

### 2. **Missing Environment Variable Validation in Supabase Clients**
**Location:** 
- [lib/supabase/client.ts](lib/supabase/client.ts) 
- [lib/supabase/server.ts](lib/supabase/server.ts)

**Severity:** HIGH - Runtime Errors
**Description:**
Both Supabase client files use non-null assertions (`!`) without checking if environment variables are actually defined:
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!  // Will fail silently if not set
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

**Current State:**
- `environment.ts` has validation functions but they're not being used by the client files
- If env vars are missing, the app will fail at runtime instead of startup

**Fix Required:**
- Use validation functions from `environment.ts` in client initialization
- Call validation at app startup to catch issues early

---

### 3. **No Email Verification Enforcement in Key Scenarios**
**Location:** [app/login/action.ts](app/login/action.ts#L54-L62)
**Severity:** MEDIUM - Security Risk
**Description:**
- Email verification is checked in login, but:
  - User can immediately call `/verify-email` endpoint without sending them an email
  - Manual verification link in success modal could be exploited
  - No rate limiting on verification attempts

**Potential Issue:**
- If user loses access to email, there's no recovery mechanism
- Token expiration is 24 hours but no renewal process

---

## 🟡 HIGH PRIORITY ISSUES

### 4. **No Error Handling for Email Service Failures**
**Location:** [app/register/action.ts](app/register/action.ts#L118-L120)
**Severity:** MEDIUM
**Description:**
```typescript
const emailResult = await sendVerificationEmail(...);
if (!emailResult.success) {
  console.warn('Email send warning:', emailResult.message);
  // Continues silently - user doesn't know email wasn't sent!
}
```

**Problem:**
- If email sending fails, registration appears successful
- User won't receive verification email but won't be notified
- User will be stuck unable to log in

**Fix Required:**
- Return error to user if email sending fails
- Provide fallback verification method (manual link)
- Add retry mechanism

---

### 5. **No Rate Limiting on Authentication Endpoints**
**Location:** 
- [app/login/action.ts](app/login/action.ts)
- [app/register/action.ts](app/register/action.ts)
- [app/api/verify-email/route.ts](app/api/verify-email/route.ts)

**Severity:** HIGH - Security Risk
**Description:**
- No protection against brute force attacks
- No rate limiting on password attempts
- No CAPTCHA on registration
- Email verification endpoint accepts unlimited attempts

**Recommendations:**
- Implement rate limiting (e.g., max 5 login attempts per IP per 15 min)
- Add IP-based blocking after multiple failures
- Consider adding CAPTCHA to registration
- Rate limit email verification endpoint

---

### 6. **Missing Input Validation**
**Location:** Multiple files
**Severity:** MEDIUM - Security Risk
**Description:**

**Examples:**
- Email format not validated (only `type="email"` in HTML)
- Password strength requirements not enforced
- Admin code not validated for length/format
- Attendance data synced without validation in offline sync endpoint

**Fix Required:**
- Add server-side validation for all inputs
- Implement password strength requirements
- Validate email format server-side
- Validate all sync data in offline endpoint

---

### 7. **No CSRF Protection**
**Location:** Forms throughout the app
**Severity:** MEDIUM - Security Risk
**Description:**
- Server actions don't have CSRF tokens
- POST requests could be exploited from other sites
- Middleware doesn't validate referrer

**Example:**
```typescript
// No CSRF validation in signOut (app/login/action.ts)
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // ...
}
```

---

## 🟠 MEDIUM PRIORITY ISSUES

### 8. **Potential Data Loss in Offline Sync**
**Location:** [app/api/offline/sync/route.ts](app/api/offline/sync/route.ts)
**Severity:** MEDIUM
**Description:**
- Sync endpoint extracts `id` from data object but doesn't validate it exists
- Delete operations only use `id` without checking record ownership
- No transaction handling - partial syncs could leave data inconsistent

**Code:**
```typescript
case 'update': {
  const { id, ...updates } = data;  // id might not exist!
  // No validation that user owns this record
```

---

### 9. **Session Management Issues**
**Location:** 
- [middleware.ts](middleware.ts)
- [app/dashboard/page.tsx](app/dashboard/page.tsx)

**Severity:** MEDIUM
**Description:**
- No session timeout handling
- No logout on token expiration
- Middleware catches but silently ignores auth errors
- No refresh token rotation

**Issue:**
```typescript
// middleware.ts - error is caught but ignored
try {
  await supabase.auth.getUser()
} catch (authError) {
  console.error('Middleware auth check failed:', authError);
  // Continue anyway - potential security issue
}
```

---

### 10. **No Access Control on Admin Features**
**Location:** [app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx)
**Severity:** HIGH - Security Risk
**Description:**
- Admin dashboard doesn't verify user role in server component
- Only checks in action functions
- If middleware is bypassed, any user can access admin routes

**Missing:**
```typescript
// Should have role verification at top of page
if (profile?.role !== 'admin') {
  redirect('/dashboard');
}
```

---

### 11. **Unhandled Promise Rejection in Offline Sync**
**Location:** [app/api/offline/sync/route.ts](app/api/offline/sync/route.ts#L217)
**Severity:** MEDIUM
**Description:**
- Multiple sync functions return early without proper error handling
- If a sync fails, the queue might not be properly marked as failed

---

### 12. **Missing Validation on File Uploads**
**Location:** Excel export features
**Severity:** MEDIUM - Security Risk
**Description:**
- No file size limits on exports
- No memory limits on large dataset processing
- XLSX library could consume excessive memory on large exports

---

## 🔵 LOW PRIORITY ISSUES

### 13. **Missing Error Boundaries**
**Location:** All React components
**Severity:** LOW
**Description:**
- No error boundaries to catch component rendering errors
- Users see blank page on component failure
- No fallback UI provided

---

### 14. **Console Errors in Production**
**Location:** Multiple API routes
**Severity:** LOW
**Description:**
- `console.error()` and `console.warn()` exposed in production
- Error details might leak information
- Should use proper logging service

---

### 15. **Missing Loading States**
**Location:** Some async operations
**Severity:** LOW
**Description:**
- Some operations lack visual feedback
- Users might think app is frozen
- Especially in realtime update features

---

### 16. **Type Safety Issues**
**Location:** Various files
**Severity:** LOW
**Description:**
- Non-null assertions (`!`) used without proper checks
- `Record<string, unknown>` used instead of proper types
- Some variables could be `undefined` but not checked

**Examples:**
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!  // Could be undefined
data.id  // Could be undefined in offline sync
```

---

### 17. **Missing API Endpoint Documentation**
**Severity:** LOW
**Description:**
- No OpenAPI/Swagger documentation
- API endpoints not clearly documented
- Makes it harder to maintain and extend

---

### 18. **Hardcoded Email Configuration**
**Location:** [lib/email/emailService.ts](lib/email/emailService.ts#L36)
**Severity:** LOW
**Description:**
```typescript
from: 'noreply@resend.dev',  // Hardcoded
```
- Should be configurable via environment variables
- Prevents using custom domain email

---

## 📋 SUMMARY TABLE

| Issue | Severity | Category | Status |
|-------|----------|----------|--------|
| Hardcoded Admin Password | CRITICAL | Security | ❌ Not Fixed |
| Missing Env Validation | HIGH | Runtime Safety | ❌ Not Fixed |
| No Email Service Error Handling | MEDIUM | Reliability | ❌ Not Fixed |
| No Rate Limiting | HIGH | Security | ❌ Not Fixed |
| Missing Input Validation | MEDIUM | Security | ❌ Not Fixed |
| No CSRF Protection | MEDIUM | Security | ❌ Not Fixed |
| Email Verification Not Enforced | MEDIUM | Security | ❌ Not Fixed |
| Offline Sync Data Loss Risk | MEDIUM | Data Integrity | ❌ Not Fixed |
| Session Management Issues | MEDIUM | Security | ❌ Not Fixed |
| No Admin Role Verification | HIGH | Security | ❌ Not Fixed |
| Console Errors in Production | LOW | Quality | ❌ Not Fixed |
| Missing Error Boundaries | LOW | UX | ❌ Not Fixed |
| Missing Loading States | LOW | UX | ❌ Not Fixed |
| Type Safety Issues | LOW | Code Quality | ❌ Not Fixed |

---

## 🎯 RECOMMENDED FIXES (Priority Order)

### Immediate (This Week)
1. Move hardcoded admin password to environment variables
2. Add role verification to admin dashboard
3. Implement rate limiting on auth endpoints
4. Add server-side input validation

### Short-term (This Sprint)
5. Add email service error handling
6. Implement CSRF protection
7. Add session timeout handling
8. Validate offline sync data

### Medium-term (Next Sprint)
9. Add error boundaries to React components
10. Improve logging (replace console.* with logger)
11. Add API documentation
12. Add comprehensive tests for auth flows

---

## 🔍 How to Verify Issues

### Test Hardcoded Admin Password
```bash
# Try registering with admin code "ADMIN123"
curl -X POST /api/register -d 'adminCode=ADMIN123'
```

### Test Missing Email Validation
```bash
# Try registering with invalid email
# Currently only HTML validation exists
```

### Test Rate Limiting
```bash
# Try making 100 login attempts
# Currently no rate limiting, should succeed all
```

---

**Note:** This report was generated by automated code analysis. Manual testing and security audit recommended before production deployment.
