# Multi-App Configuration Guide

This document explains how to run the main Attendance Management System and the separate Kiosk application together.

## Project Structure

```
my-attendance-system/
├── app/                          # Main application
│   ├── page.tsx                 # Landing page
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   └── (other features)
├── kiosk/                       # Kiosk application
│   ├── app/
│   ├── lib/
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── lib/                         # Main app shared libraries
├── .env.local                   # Main app environment
├── package.json                 # Main app dependencies
├── next.config.ts               # Main app config
└── tsconfig.json                # Main app TypeScript config
```

## Setup Steps

### 1. Install Main Application Dependencies
```bash
cd /path/to/my-attendance-system
npm install
```

### 2. Install Kiosk Application Dependencies
```bash
cd kiosk
npm install
cd ../
```

### 3. Configure Environment Variables

**Main Application** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Kiosk Application** (`kiosk/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Both use the same Supabase credentials.

## Running Both Applications

### Option 1: Separate Terminal Windows (Simple)

**Terminal 1 - Main Application:**
```bash
cd /path/to/my-attendance-system
npm run dev
```
- Runs on: `http://localhost:3000`

**Terminal 2 - Kiosk Application:**
```bash
cd /path/to/my-attendance-system/kiosk
npm run dev
```
- Runs on: `http://localhost:3001`

### Option 2: Using concurrently (Recommended)

Install concurrently:
```bash
npm install -g concurrently
```

From project root:
```bash
concurrently "npm run dev" "npm --prefix ./kiosk run dev"
```

Both apps will start automatically.

### Option 3: Custom npm Script

Add to main `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:all": "concurrently \"npm run dev\" \"npm --prefix ./kiosk run dev\""
  }
}
```

Then run:
```bash
npm run dev:all
```

## Accessing the Applications

### Main Application (Port 3000)
- **Landing Page**: `http://localhost:3000/`
  - Navigate to all systems from here
- **Staff Login**: `http://localhost:3000/login?role=staff`
- **Admin Portal**: `http://localhost:3000/login?role=admin`
- **Staff Dashboard**: `http://localhost:3000/dashboard`
- **Admin Dashboard**: `http://localhost:3000/dashboard/admin`
- **Registration**: `http://localhost:3000/register`

### Kiosk Application (Port 3001)
- **Kiosk Interface**: `http://localhost:3001/`

## Port Configuration

### Changing Ports

**Main Application:**
Edit `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3000"
}
```

**Kiosk Application:**
Edit `kiosk/package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

## Building for Production

### Build Main Application
```bash
npm run build
npm start
```

### Build Kiosk Application
```bash
cd kiosk
npm run build
npm start
```

### Build Both (from root)
```bash
npm run build
cd kiosk && npm run build && cd ../
```

## Docker Deployment (Optional)

### Main Application Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Kiosk Application Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose (Optional)
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  main-app:
    build:
      context: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

  kiosk-app:
    build:
      context: ./kiosk
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

Run with: `docker-compose up`

## Troubleshooting

### Both apps won't start
- Check if ports 3000 and 3001 are available
- Run `lsof -i :3000` and `lsof -i :3001` (macOS/Linux)
- Run `netstat -ano | find :3000` (Windows)

### Connection between apps fails
- Verify both apps are running on correct ports
- Check firewall settings
- Ensure Supabase credentials are correct in both apps

### Hot reload not working
- Restart the development servers
- Clear Next.js cache: `rm -rf .next kiosk/.next`
- Try different ports

### Database errors
- Verify `.env.local` files have correct credentials
- Check Supabase project is accessible
- Verify database tables exist with correct schema

## Deployment Strategies

### Same Server
Deploy both apps to same server on different ports:
- Main app on port 3000
- Kiosk on port 3001
- Use reverse proxy (nginx/Apache) if needed

### Separate Servers
- Main app on primary server
- Kiosk on dedicated kiosk device or separate VM
- Use different `.env.local` files with same DB credentials

### Cloud Deployment
- Deploy to Vercel, Heroku, or AWS
- Main app as primary deployment
- Kiosk as separate project
- Both connect to same Supabase instance

## Development Workflow

1. Start both apps using concurrently
2. Main app landing page opens at `http://localhost:3000`
3. Navigate to kiosk or other portals as needed
4. Changes auto-reload in both apps
5. Check browser console and terminal for errors

## File Synchronization

If modifying Supabase schema:
1. Make changes in Supabase dashboard or migrations
2. Both apps automatically use updated schema
3. Restart apps if needed

## Next Steps

1. Configure environment variables
2. Install dependencies for both apps
3. Run both apps using concurrently
4. Access landing page and navigate between systems
5. Test all features across both applications

## Additional Resources

- [Main App Documentation](README.md)
- [Kiosk App Documentation](kiosk/README.md)
- [Kiosk Separation Guide](KIOSK_SEPARATION_GUIDE.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
