# Attendance Kiosk System

A standalone Next.js application for ID-based employee clock in/out functionality. This is a separate application from the main Attendance Management System and runs on port 3001.

## Features

- **Simple ID Entry**: Employees enter their ID number to clock in/out
- **Auto-focus Input**: Input field auto-focuses for better UX on kiosk hardware
- **Visual Feedback**: Clear success/error messages with icons
- **Real-time Processing**: Instant clock in/out with database synchronization
- **Responsive Design**: Works on touch screens and keyboards
- **Database Integration**: Direct Supabase integration for attendance records

## Quick Start

### Installation
```bash
npm install
```

### Environment Setup
Create `.env.local` file in the kiosk root directory:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Development
```bash
npm run dev
```
Access the kiosk at `http://localhost:3001`

### Production
```bash
npm run build
npm start
```

## Architecture

### App Structure
```
app/
├── page.tsx          # Main kiosk UI
├── actions.ts        # Server actions for clock in/out
├── layout.tsx        # App layout
└── globals.css       # Tailwind styles
```

### Server Actions
- **`handleKioskAction(idNumber)`**: Main entry point for clock in/out
  - Looks up employee by ID
  - Checks for open session today
  - Performs clock in or clock out
  
- **`clockIn(userId, firstName)`**: Clock in new session
  - Creates attendance record
  - Returns success message
  
- **`clockOut(userId, firstName, attendanceId)`**: Clock out existing session
  - Updates attendance record with clock_out time
  - Returns success message

## User Interface

### Main Screen
- Large ID input field (centered, high contrast)
- Submit button
- Status messages (success/error)
- Auto-clearing messages after 3.5 seconds

### Features
- **Auto-focus**: Input field focuses on page load and after successful action
- **Keyboard Support**: Press Enter to submit
- **Touch Support**: Works with physical touchscreens
- **Responsive**: Adapts to different screen sizes

## Database Schema

Expected `attendance` table columns:
- `id` (uuid): Primary key
- `profile_id` (uuid): Foreign key to profiles
- `date` (date): Attendance date
- `clock_in` (timestamp): Clock in time
- `clock_out` (timestamp): Clock out time (nullable)
- `status` (text): Attendance status

Expected `profiles` table columns:
- `id` (uuid): Primary key
- `unique_id_number` (text): Employee ID number
- `first_name` (text): First name for messages

## Integration with Main App

The kiosk app is separated from the main application but uses the same:
- Supabase database
- Authentication credentials
- Attendance records

Access the main application landing page to navigate to the kiosk:
- Main App: `http://localhost:3000`
- Kiosk App: `http://localhost:3001`

## Deployment

### Local Network Kiosk
For deploying to a kiosk terminal on your local network:

1. Build the application:
   ```bash
   npm run build
   npm start
   ```

2. Access from other devices using:
   ```
   http://<kiosk-device-ip>:3001
   ```

3. Consider:
   - Disabling browser UI (fullscreen mode)
   - Setting auto-login page
   - Configuring network connectivity

### Cloud Deployment
Deploy to any Node.js hosting:
- Vercel (recommended)
- Heroku
- Railway
- AWS
- Azure

Update the port configuration in `package.json` if needed.

## Troubleshooting

### "Invalid ID Number"
- Verify employee ID exists in database
- Check `profiles` table for correct `unique_id_number` value
- Ensure ID is not case-sensitive (or adjust logic as needed)

### "Database error" messages
- Check Supabase credentials in `.env.local`
- Verify database is accessible
- Check service role key has proper permissions

### Port 3001 already in use
Change the port in `package.json`:
```json
"dev": "next dev -p 3002",
"start": "next start -p 3002"
```

### Input not focusing
- Verify JavaScript is enabled
- Check browser console for errors
- Ensure component loaded properly

## Development

### Tech Stack
- **Framework**: Next.js 16.1.6
- **UI**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Language**: TypeScript

### Key Dependencies
- `@supabase/ssr`: Server-side rendering support
- `@supabase/supabase-js`: Database client
- `lucide-react`: Icons

### Code Organization
- **`page.tsx`**: Client component with UI state management
- **`actions.ts`**: Server-only functions for database operations
- **`layout.tsx`**: Root layout with theme configuration

## Performance Tips

1. **Minimize Network Latency**: Deploy close to your Supabase region
2. **Connection Pooling**: Supabase handles this automatically
3. **Caching**: Consider caching employee IDs locally if network is unreliable
4. **Offline Mode**: Consider adding offline support for kiosk terminals

## Security Considerations

- **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE_KEY` secure
- **ID Validation**: IDs are validated on server-side
- **Authentication**: Uses Supabase service role for attendance operations
- **No User Login**: Kiosk doesn't require user authentication

## Support & Feedback

For issues or improvements, refer to the main project documentation or contact the development team.
