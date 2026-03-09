# Quick Fix: ENOTFOUND Error

## The Problem

```
TypeError: fetch failed
Error: getaddrinfo ENOTFOUND faovxevtmxpjjcltmjcr.supabase.co
```

This means the application cannot reach your Supabase server.

## Quick Checklist

- [ ] **`.env.local` exists** in your project root
- [ ] **NEXT_PUBLIC_SUPABASE_URL** is set to `https://your-project.supabase.co`
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** is set
- [ ] **SUPABASE_SERVICE_ROLE_KEY** is set
- [ ] **Internet connection is working** (test with `ping 8.8.8.8`)
- [ ] **DNS is resolving** the Supabase domain
- [ ] **Supabase project is active** (not deleted)
- [ ] **Dev server was restarted** after updating `.env.local`

## Step-by-Step Fix

### 1. Check if `.env.local` exists

```powershell
# Windows
Test-Path ".env.local"
```

If it returns `False`, create it:
```bash
# Create .env.local in your project root
```

### 2. Verify Supabase credentials

Open `.env.local` and check:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Get the correct values from your Supabase dashboard:
1. Go to https://supabase.com
2. Open your project
3. Go to Settings > API
4. Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
5. Copy "anon public" → NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Copy "service_role secret" → SUPABASE_SERVICE_ROLE_KEY

### 3. Test internet and DNS

```powershell
# Test internet
ping 8.8.8.8

# Test DNS resolution
nslookup your-project.supabase.co
```

If DNS fails, contact your network administrator or try a different DNS:
```powershell
# Use Google DNS temporarily
# Contact your IT department if behind firewall
```

### 4. Verify Supabase project is active

1. Go to https://supabase.com
2. Check if your project is listed
3. If deleted, create a new project and update `.env.local`

### 5. Restart the development server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 6. Test using diagnostics

Navigate to:
```
http://localhost:3000/diagnostics
```

Check the status indicators for:
- ✓ Environment Configuration
- ✓ Internet Connectivity
- ✓ Supabase Connection

## Still Having Issues?

1. **Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for detailed solutions
2. **Check [FIX_SUMMARY.md](FIX_SUMMARY.md)** for all changes made
3. **Review server logs** in the terminal running `npm run dev`
4. **Check browser console** (F12 → Console tab) for JavaScript errors

## Getting Help

- **Environment issue?** → Check `.env.local` exists and has correct values
- **Network issue?** → Test with `ping` and `nslookup`
- **Supabase down?** → Check https://status.supabase.com
- **Still stuck?** → Read TROUBLESHOOTING.md for more options
