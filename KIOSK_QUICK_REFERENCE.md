# Quick Reference - Kiosk Separation

## 🚀 Quick Start

```bash
# Install main app
npm install

# Install kiosk app
cd kiosk && npm install && cd ../

# Run both apps (recommended)
concurrently "npm run dev" "npm --prefix ./kiosk run dev"
```

## 📍 Access Points

| System | URL | Port | Purpose |
|--------|-----|------|---------|
| Landing Page | http://localhost:3000 | 3000 | Navigate to all systems |
| Staff Login | http://localhost:3000/login?role=staff | 3000 | Staff portal |
| Admin Login | http://localhost:3000/login?role=admin | 3000 | Admin dashboard |
| Registration | http://localhost:3000/register | 3000 | Create account |
| Kiosk | http://localhost:3001 | 3001 | Clock in/out |

## 🏗️ Architecture

```
Main App (3000)                    Kiosk App (3001)
├── Landing page                   ├── Kiosk UI
├── Authentication                 ├── Clock in/out
├── Dashboards                      └── Database sync
└── Admin portal
```

Both share the same Supabase database.

## 📁 Key Files

### Main Application
```
app/
├── page.tsx              ← Landing page (updated)
├── login/                ← Staff/Admin login
├── register/             ← Registration
├── dashboard/            ← Dashboards
└── dashboard/
    └── actions.ts        ← Dashboard actions (kiosk logic removed)
```

### Kiosk Application
```
kiosk/
├── app/
│   ├── page.tsx          ← Kiosk interface
│   ├── actions.ts        ← Clock in/out logic
│   └── layout.tsx        ← Layout
├── lib/supabase/         ← Supabase clients
├── package.json          ← Dependencies (port 3001)
└── README.md             ← Kiosk documentation
```

## 🔧 Configuration

### Environment Variables

**.env.local** (main app, root directory)
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

**kiosk/.env.local** (kiosk app, kiosk directory)
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

## 🎯 Running Applications

### Separate Terminals
```bash
# Terminal 1
npm run dev

# Terminal 2
cd kiosk && npm run dev
```

### Using concurrently
```bash
npm install -g concurrently
concurrently "npm run dev" "npm --prefix ./kiosk run dev"
```

### Add npm script (optional)
Add to main package.json:
```json
"scripts": {
  "dev:all": "concurrently \"npm run dev\" \"npm --prefix ./kiosk run dev\""
}
```
Then run: `npm run dev:all`

## 🗄️ Database

Both apps use the same database:
- `attendance` - Clock in/out records
- `profiles` - Employee information

## 📦 Port Configuration

### Change Main App Port
Edit `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3000"
}
```

### Change Kiosk Port
Edit `kiosk/package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

## 🚢 Building & Deployment

### Build for Production

**Main app:**
```bash
npm run build
npm start
```

**Kiosk app:**
```bash
cd kiosk
npm run build
npm start
```

### Deploy to Cloud

**Vercel** (easiest):
1. Main app: Deploy root directory
2. Kiosk app: Deploy `kiosk/` as separate project
3. Update environment variables in both

**Heroku**:
```bash
# Main app
git push heroku main

# Kiosk app (from kiosk directory)
git push heroku-kiosk main:master
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port 3001 in use | Change port in kiosk/package.json |
| Module not found | Run `npm install` in both directories |
| Database errors | Check .env.local files, verify credentials |
| Apps won't start | Clear `.next` folders, restart terminal |
| Kiosk not accessible | Verify running on localhost:3001 |

## 📚 Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Full Separation Guide | [KIOSK_SEPARATION_GUIDE.md](KIOSK_SEPARATION_GUIDE.md) | Complete setup details |
| Multi-app Setup | [MULTI_APP_SETUP.md](MULTI_APP_SETUP.md) | Running both apps |
| Kiosk README | [kiosk/README.md](kiosk/README.md) | Kiosk features & API |
| Completion Summary | [KIOSK_SEPARATION_COMPLETE.md](KIOSK_SEPARATION_COMPLETE.md) | What was changed |

## ✅ Verification Checklist

- [ ] Main app starts on port 3000
- [ ] Kiosk app starts on port 3001
- [ ] Both .env.local files exist
- [ ] Landing page navigates correctly
- [ ] Kiosk interface loads
- [ ] Database operations work
- [ ] Staff login works
- [ ] Admin login works

## 🔗 Useful Commands

```bash
# Check if ports are in use
lsof -i :3000  # macOS/Linux
lsof -i :3001  # macOS/Linux

# Windows
netstat -ano | find :3000
netstat -ano | find :3001

# Kill process on port
kill -9 <PID>  # macOS/Linux

# Clear Next.js cache
rm -rf .next kiosk/.next

# Install all dependencies
npm install && cd kiosk && npm install && cd ../
```

## 🎓 Key Concepts

1. **Separate Applications**: Two independent Next.js apps
2. **Shared Database**: Both use same Supabase instance
3. **Different Ports**: Main on 3000, Kiosk on 3001
4. **Independent Deployment**: Can update/deploy separately
5. **Same Credentials**: Both use same env variables

## 🔐 Security Notes

- Service role key kept in `.env.local`
- Not committed to version control
- Kiosk bypasses authentication (ID-only)
- Main app requires user authentication
- Database handles access control

---

**Last Updated**: April 6, 2026
**Status**: Ready for Development & Deployment
