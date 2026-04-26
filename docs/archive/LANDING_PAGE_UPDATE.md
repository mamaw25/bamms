# Landing Page & Kiosk Route Update

## Changes Made

### 1. Updated Landing Page
**File**: `app/page.tsx`

The landing page now displays only 3 options in a grid layout with equal dimensions:
- **Staff** - Staff portal login (Emerald green)
- **Admin** - Administrator dashboard (Blue)
- **Register** - Create new account (Purple)

Removed the Kiosk link from the landing page.

### 2. Created Kiosk Route
**Files**: 
- `app/kiosk/page.tsx` - Kiosk interface
- `app/kiosk/actions.ts` - Clock in/out server actions

The kiosk is now accessible at: `http://localhost:3000/kiosk`

### Architecture

```
Main Application (Port 3000)
├── /                    → Landing Page (Staff, Admin, Register)
├── /login              → Login portal
├── /register           → Registration
├── /dashboard          → Staff dashboard
├── /dashboard/admin    → Admin dashboard
└── /kiosk              → Kiosk Clock In/Out (NEW)
```

The separate kiosk app (`kiosk/` directory) on port 3001 remains available as an alternative independent deployment option.

## Accessing the Systems

### Main Application
- **Landing Page**: `http://localhost:3000/`
- **Staff Login**: `http://localhost:3000/login?role=staff`
- **Admin Login**: `http://localhost:3000/login?role=admin`
- **Register**: `http://localhost:3000/register`
- **Staff Dashboard**: `http://localhost:3000/dashboard`
- **Admin Dashboard**: `http://localhost:3000/dashboard/admin`
- **Kiosk**: `http://localhost:3000/kiosk` (NEW)

### Separate Kiosk App (Optional)
- **Kiosk App**: `http://localhost:3001/`

## Running the Application

### With Main App Only (Recommended)
```bash
npm run dev
```
Access at: `http://localhost:3000`

### With Both Apps
```bash
concurrently "npm run dev" "npm --prefix ./kiosk run dev"
```
- Main App: `http://localhost:3000`
- Kiosk App: `http://localhost:3001`

## Key Features

### Landing Page
- Clean 3-column grid layout
- Equal-sized boxes with consistent styling
- Hover effects on each option
- Professional appearance

### Kiosk Route
- Accessible within the main application
- No need for separate port access
- Same functionality as standalone kiosk app
- Server-side authentication handling
- Real-time clock in/out processing

## Database Integration

Both the kiosk route (`/kiosk`) and the separate kiosk app use the same:
- Supabase database
- Attendance table
- Profiles table
- Service role authentication

## Benefits of This Setup

1. **Simplified Access**: Kiosk accessible without separate port
2. **Flexibility**: Still supports separate deployment option
3. **Cleaner Landing**: Focused on main user flows
4. **Scalability**: Can disable either version independently

## Configuration

No additional configuration needed. Both versions use the same `.env.local` file with Supabase credentials.

---

**Updated**: April 6, 2026
**Status**: Ready to Use
