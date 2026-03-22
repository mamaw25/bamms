# Auto-Update System - Quick Reference

## What's New?

Your attendance system now automatically updates when:
- ✅ Staff clock in/out
- ✅ Leave requests are submitted
- ✅ Meetings are scheduled or updated
- ✅ Attendance data is exported

## Key Features

| Feature | Where | How |
|---------|-------|-----|
| **Attendance Updates** | Dashboard, Admin Page | Instant refresh when clock in/out |
| **Leave Request Updates** | Dashboard, Admin Panel | Auto-refresh when submitted |
| **Meeting Updates** | Meetings Page | Real-time schedule changes |
| **Export Updates** | Export Buttons | Shows update indicator with timestamp |
| **Report Updates** | Admin Reports | Live attendance data display |

## How to Use

### For Staff:
1. Navigate to your dashboard
2. Clock in/out - dashboard will auto-update
3. Submit leave request - page refreshes automatically
4. No manual refresh needed!

### For Admins:
1. Open Attendance or Reports page
2. Watch for changes in real-time
3. Export buttons show update indicators
4. Exports always have latest data

### For Developers:

**Add real-time to any component:**
```typescript
import { useAttendanceUpdates } from '@/lib/realtime/hooks'

export function MyComponent() {
  useAttendanceUpdates(
    (updated) => console.log('Updated:', updated),
    (newRecord) => console.log('New:', newRecord)
  )
  return <div>Component</div>
}
```

**Wrap pages with realtime:**
```typescript
import { DashboardRealtime } from './DashboardRealtime'

export default function Page() {
  return (
    <DashboardRealtime userId={user.id}>
      <YourContent />
    </DashboardRealtime>
  )
}
```

## Auto-Update Flow

```
Database Change
        ↓
Supabase Realtime Broadcast
        ↓
React Hook Detection
        ↓
Page State Update (shows spinner)
        ↓
Auto-Refresh After 1-2 seconds
        ↓
Fresh Data Loaded
        ↓
User Sees Latest Updates
```

## Real-Time Hooks Available

```typescript
// Attendance
useAttendanceUpdates(onUpdate, onInsert)

// Leave Requests
useLeaveRequestUpdates(onUpdate, onInsert)

// Meetings
useMeetingUpdates(onUpdate, onInsert, onDelete)

// Meeting Attendees
useMeetingAttendeesUpdates(onUpdate, onInsert, onDelete)

// Staff/Profiles
useStaffUpdates(onUpdate, onInsert, onDelete)

// Meeting Minutes
useMeetingMinutesUpdates(onUpdate, onInsert)

// Any Table
useTableSubscription(tableName, options)
```

## Visual Indicators

### Update Indicator (Meetings Page)
Shows when changes are detected:
```
🔄 Updating...
```

### Export Button Status (Admin Pages)
Shows recent updates:
```
🔄 Updated 5s ago
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Not auto-updating | Check realtime enabled in Supabase |
| Too many refreshes | Increase debounce delay (see code) |
| Updates delayed | Check network/WebSocket connection |
| Console errors | Look for "[Realtime]" messages |

## Performance Notes

- Updates batched: Multiple changes → Single refresh
- Debounce: 1-2 second delay prevents excessive reloads
- Selective: Only relevant user's data tracked
- Efficient: Uses Supabase realtime, not polling

## Supabase Configuration

Ensure realtime is enabled:

```sql
-- Check if enabled
SELECT * FROM publication 
WHERE name = 'supabase_realtime';

-- Enable if needed
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
```

## Browser Support

Works in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ❌ IE (not supported)

Requires WebSocket support.

## Testing Auto-Updates

1. **Two Browser Test**:
   - Browser 1: Staff dashboard
   - Browser 2: Admin panel
   - Clock in from Browser 1
   - See instant update in Browser 2

2. **Export Test**:
   - Open export button
   - Clock in/out in another tab
   - See "Updated X seconds ago"

3. **Leave Request Test**:
   - Submit request
   - Admin page auto-refreshes

## Files Changed

**New:**
- `lib/realtime/hooks.ts` - Real-time hooks
- `REALTIME_AUTO_UPDATE.md` - Full documentation
- 3 wrapper components

**Modified:**
- Dashboard pages (6 files)
- Export buttons
- Leave request form

## Important Notes

⚠️ **Realtime Requirements:**
- WebSocket must be enabled
- Browser must support WebSocket
- Supabase realtime must be configured
- RLS policies must allow realtime

ℹ️ **Performance:**
- Multiple updates debounced to 1.5s
- Automatic connection management
- Graceful fallback if realtime unavailable

## Next Steps

1. Test auto-updates in your environment
2. Check browser console for `[Realtime]` logs
3. Verify Supabase realtime is enabled
4. Monitor performance in production

---

For detailed information, see `REALTIME_AUTO_UPDATE.md`
