# Kiosk Separation - Setup Guide

## Overview
The Kiosk application has been separated from the main Attendance Management System into a standalone Next.js application. This allows independent deployment, scaling, and management of the kiosk system.

## Architecture

### Main Application (Port 3000)
Located in: `./app/`
- **Landing Page**: `/` - Portal to access all systems
- **Staff Login**: `/login?role=staff` - Staff authentication
- **Admin Portal**: `/dashboard/admin` - Administrative dashboard
- **Staff Dashboard**: `/dashboard` - Staff attendance view
- **Registration**: `/register` - New account creation

### Kiosk Application (Port 3001)
Located in: `./kiosk/`
- **Kiosk UI**: `/` - Clock in/out interface
- Separate Next.js app with independent dependencies
- Dedicated to ID-based attendance tracking
- Can be deployed to different hardware/locations

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn installed
- Supabase project configured with environment variables

### 1. Install Main Application Dependencies
```bash
cd ./
npm install
```

### 2. Install Kiosk Application Dependencies
```bash
cd ./kiosk
npm install
cd ../
```

## Running Both Applications

### Option A: Run Sequentially
```bash
# Terminal 1: Start main app (port 3000)
npm run dev

# Terminal 2: Start kiosk app (port 3001)
cd kiosk && npm run dev
```

### Option B: Use concurrently (Recommended)
Install concurrently globally (if not already installed):
```bash
npm install -g concurrently
```

Then run from project root:
```bash
concurrently "npm run dev" "npm --prefix ./kiosk run dev"
```

## Environment Variables

### Main App (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Kiosk App (`./kiosk/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Both apps use the same Supabase credentials.

## Landing Page Navigation

The main application landing page (`http://localhost:3000`) now provides:

1. **Kiosk** - Links to `http://localhost:3001` (kiosk app)
2. **Staff** - Links to staff login portal
3. **Admin** - Links to admin portal
4. **Register** - New account registration

## File Organization

### Main App Structure
```
app/
├── page.tsx              # Landing page
├── login/               # Login portal
├── register/            # Registration
├── dashboard/           # Staff dashboard
│   └── admin/          # Admin dashboard
└── (other features)
```

### Kiosk App Structure
```
kiosk/
├── app/
│   ├── page.tsx         # Kiosk interface
│   ├── actions.ts       # Kiosk server actions
│   └── layout.tsx       # Layout
├── lib/
│   └── supabase/        # Supabase clients
├── package.json         # Kiosk dependencies
├── next.config.ts       # Kiosk Next.js config
└── tsconfig.json        # Kiosk TypeScript config
```

## Deployment Considerations

### Main Application
- Deploy to your primary hosting (Vercel, etc.)
- Manages user authentication and dashboards
- Runs on standard port (typically 3000)

### Kiosk Application
- Can be deployed to separate infrastructure
- Consider deploying to a dedicated kiosk device/server
- Configure port (default: 3001) based on deployment environment
- Optionally deploy to a local network IP for physical kiosk terminals

## Migration Notes

### Removed from Main App
- `app/kiosk/` directory
- Kiosk actions from `app/dashboard/actions.ts`
- Kiosk UI from `app/page.tsx`

### Maintained in Kiosk App
- All kiosk functionality (`handleKioskAction`, `clockIn`, `clockOut`)
- Database operations identical to original
- Same Supabase integration

## Accessing Both Systems

### Local Development
- Main App: `http://localhost:3000`
  - Landing page with all portals
- Kiosk: `http://localhost:3001`
  - Direct kiosk interface

### From Landing Page
- Click "Kiosk" button to open separate kiosk app (new tab/window)
- Click "Staff" or "Admin" to access respective portals

## Troubleshooting

### Kiosk app won't start
- Verify `kiosk/` folder exists with all files
- Check `kiosk/package.json` and `kiosk/tsconfig.json`
- Ensure port 3001 is not in use

### Environment variables not loading
- Verify both `.env.local` files exist in correct locations
- Main app: `root/.env.local`
- Kiosk: `kiosk/.env.local`
- Restart both applications after updating env vars

### Database errors
- Verify Supabase credentials are correct
- Check database permissions for service role key
- Ensure attendance table schema matches expected columns

## Next Steps

1. Install dependencies for both apps
2. Configure `.env.local` files
3. Run both applications using concurrently or separate terminals
4. Access main app at `http://localhost:3000`
5. Navigate to kiosk or staff/admin portals as needed
