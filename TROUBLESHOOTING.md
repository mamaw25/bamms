# Troubleshooting Guide

## Network/Connection Issues

### Error: `TypeError: fetch failed` with `ENOTFOUND`

This error indicates that the application cannot reach the Supabase server.

**Root Causes:**
1. Missing or incorrect Supabase configuration in `.env.local`
2. Network connectivity issues
3. DNS resolution problems
4. Supabase project is deleted or inactive

**Solutions:**

#### Step 1: Verify Environment Configuration

Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Visit the diagnostics page to check if configuration is loaded:
```
http://localhost:3000/diagnostics
```

#### Step 2: Check Internet Connection

Test if your machine can reach the internet:
```powershell
ping 8.8.8.8
```

Test if DNS is working:
```powershell
nslookup your-project.supabase.co
```

#### Step 3: Verify Supabase Project

1. Log in to your Supabase dashboard
2. Check if your project exists and is active
3. Verify the project URL matches `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
4. Check if Row Level Security (RLS) is not too restrictive

#### Step 4: Restart the Development Server

```bash
npm run dev
```

#### Step 5: Check Firewall/VPN

If behind a corporate firewall or VPN, whitelist the Supabase domain in your network settings.

---

## Database Issues

### Profile Table Not Found

Make sure all required tables are created in your Supabase database.

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  unique_id_number TEXT UNIQUE,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  email_verification_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'on_leave')),
  check_in TIMESTAMP,
  clock_out TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('leave', 'absent', 'day_off')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT NOT NULL,
  agenda TEXT NOT NULL,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create meeting_attendees table
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(meeting_id, staff_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_profile ON attendance(profile_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff ON leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date DESC);
```

---

## Authentication Issues

### Email Verification Not Sending

**Possible reasons:**
1. `RESEND_API_KEY` is missing or invalid
2. Email service is not properly configured
3. Network issue preventing API call

**Solution:**
1. Get a valid API key from [Resend.com](https://resend.com)
2. Update `.env.local` with the valid key
3. Restart the dev server
4. Check server logs for email sending errors

---

## Testing the Application

After fixing issues, test the application flow:

1. **Register a new user**: `/register`
   - Check `/diagnostics` if you encounter issues
   
2. **Verify email**: Check your inbox for verification link

3. **Log in**: `/login`

4. **Access dashboard**: `/dashboard` or `/dashboard/admin` (if admin)

---

## Diagnostic Tools

### View System Status

Visit the diagnostics page:
```
http://localhost:3000/diagnostics
```

This page will check:
- Environment configuration
- Internet connectivity
- Supabase connection

### Check Server Logs

Monitor the Next.js dev server terminal for error messages and detailed logs.

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Need More Help?

1. Check the `DATABASE_SETUP.md` for database configuration
2. Review `EMAIL_VERIFICATION_SETUP.md` for email setup
3. Check the error messages in the browser console and server logs
4. Verify all environment variables are set correctly

