# Auto-Update System Implementation Guide

## Overview

The attendance system now includes real-time auto-update functionality that automatically refreshes data when changes occur. This document explains how the system works and how to use it.

## Features

### 1. **Attendance Auto-Updates**
- **Dashboard**: Automatically updates when a staff member clocks in/out
- **Admin Attendance Page**: Displays real-time attendance changes for all staff
- **Admin Reports Page**: Shows live attendance data with instant updates

### 2. **Leave Request Auto-Updates**
- Staff dashboard automatically refreshes when leave requests are submitted or updated
- Changes are detected in real-time via Supabase realtime subscriptions

### 3. **Meeting Auto-Updates**
- Meeting dashboard automatically updates when meetings are created, modified, or deleted
- Attendee changes trigger instant page refresh
- Shows update indicator when changes are detected

### 4. **Export Auto-Updates**
- Export buttons show update indicators when new attendance data arrives
- CSV/Excel exports reflect the latest data automatically
- Refresh status displayed for user awareness

## Architecture

### Real-Time Hooks (`lib/realtime/hooks.ts`)

The system is built on custom React hooks that listen to Supabase database changes:

#### Available Hooks:

1. **`useTableSubscription(tableName, options)`**
   - Generic hook for subscribing to any table
   - Accepts callbacks for INSERT, UPDATE, DELETE events
   - Automatically manages subscriptions on mount/unmount

2. **`useAttendanceUpdates(onUpdate, onInsert)`**
   - Listens to attendance table changes
   - Triggers when clock in/out occurs
   - Automatically refreshes affected pages

3. **`useLeaveRequestUpdates(onUpdate, onInsert)`**
   - Listens to leave_requests table changes
   - Triggers when requests are submitted or modified

4. **`useMeetingUpdates(onUpdate, onInsert, onDelete)`**
   - Listens to meetings table changes
   - Handles all meeting lifecycle events

5. **`useMeetingAttendeesUpdates(onUpdate, onInsert, onDelete)`**
   - Listens to meeting_attendees table changes
   - Triggers when attendance is marked

6. **`useStaffUpdates(onUpdate, onInsert, onDelete)`**
   - Listens to profiles (staff) table changes

7. **`useMeetingMinutesUpdates(onUpdate, onInsert)`**
   - Listens to meeting_minutes table changes

### Client Components

#### Dashboard Components:
- **`DashboardRealtime.tsx`** - Wraps user dashboard with real-time updates
- **`AdminAttendanceRealtime.tsx`** - Wraps admin attendance page
- **`AdminReportRealtime.tsx`** - Wraps admin report page

## How It Works

### Step-by-Step Flow:

1. **User Action**: Staff member clocks in/out or submits a form
2. **Database Update**: Change is written to Supabase
3. **Realtime Trigger**: Supabase broadcasts change via realtime subscription
4. **Hook Detection**: Custom React hook catches the change
5. **State Update**: Component state is updated to indicate changes
6. **Auto-Refresh**: Page automatically reloads after brief delay (1-2 seconds)
7. **Data Revalidation**: Server fetches latest data on page reload
8. **UI Update**: User sees current data immediately

### Debouncing:

To prevent excessive page refreshes, updates are batched:
- Dashboard: 1 second wait before refresh
- Admin pages: 1.5 seconds wait before refresh
- Meetings: 1.5 seconds wait before refresh

This allows multiple rapid changes to be batched into a single refresh.

## Usage Examples

### Using in a Component:

```typescript
'use client'

import { useAttendanceUpdates } from '@/lib/realtime/hooks'

export function MyComponent() {
  // Listen to attendance changes
  useAttendanceUpdates(
    (record) => {
      // Called when an existing attendance record is updated
      console.log('Updated:', record)
      // Trigger custom logic here
    },
    (record) => {
      // Called when a new attendance record is created
      console.log('New record:', record)
    }
  )

  return <div>Content</div>
}
```

### Using the Wrapper Component:

```typescript
// In your page or parent component
import { DashboardRealtime } from './DashboardRealtime'

export default function Page({ userId }) {
  return (
    <DashboardRealtime userId={userId}>
      {/* Your dashboard content */}
    </DashboardRealtime>
  )
}
```

## Configuration

### Supabase Setup Requirements:

1. **Realtime Enabled**: Database must have realtime subscriptions enabled
2. **Row Level Security (RLS)**: Should be properly configured
3. **Policies**: Ensure policies don't block realtime events

### Enabling Realtime in Supabase:

```sql
-- Enable realtime for a table
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_attendees;
```

## Performance Considerations

### Optimizations Implemented:

1. **Selective Listening**: Only listen to relevant user's data when possible
2. **Debounced Refreshes**: Batch multiple updates into single refresh
3. **Conditional Updates**: Only trigger refresh for relevant changes
4. **Lazy Subscriptions**: Hooks only subscribe when component mounts

### Best Practices:

1. **Filter Early**: Use user ID or other filters to reduce broadcast volume
2. **Batch Operations**: Group related changes to trigger single refresh
3. **Monitor Console**: Check browser console for realtime event logs
4. **Test Offline**: Verify graceful degradation without realtime

## Troubleshooting

### Updates Not Working:

1. **Check Realtime Enable**: Verify realtime is enabled in Supabase
2. **Check Logs**: Look for "[Realtime]" messages in browser console
3. **Check Network**: Ensure WebSocket connection is active
4. **Check Policies**: Verify RLS policies allow realtime broadcasts

### Too Many Refreshes:

1. **Increase Debounce**: Adjust timeout values in components (1000-3000ms)
2. **Add Filters**: Filter updates to specific users or records
3. **Check for Loops**: Ensure no circular update triggers

### Performance Issues:

1. **Monitor Subscriptions**: Check number of active subscriptions
2. **Reduce Frequency**: Increase debounce delays
3. **Optimize Callbacks**: Avoid heavy computations in update handlers

## Future Enhancements

1. **Websocket Reconnection**: Add automatic reconnection logic
2. **Offline Support**: Queue updates and sync when online
3. **Selective Refresh**: Update specific DOM elements instead of full reload
4. **Update Notifications**: Show toast notifications for updates
5. **Update History**: Track and display update timeline
6. **Sync Conflicts**: Handle concurrent updates from multiple users

## Files Modified

### New Files:
- `lib/realtime/hooks.ts` - Real-time subscription hooks
- `app/dashboard/DashboardRealtime.tsx` - Dashboard wrapper
- `app/dashboard/admin/attendance/AdminAttendanceRealtime.tsx` - Attendance admin wrapper
- `app/dashboard/admin/AdminReportRealtime.tsx` - Report admin wrapper

### Modified Files:
- `app/dashboard/page.tsx` - Added DashboardRealtime wrapper
- `app/dashboard/components/LeaveRequestSection.tsx` - Added real-time updates
- `app/dashboard/admin/attendance/page.tsx` - Added AdminAttendanceRealtime wrapper
- `app/dashboard/admin/attendance/ExportButton.tsx` - Added update indicators
- `app/dashboard/admin/page.tsx` - Added AdminReportRealtime wrapper
- `app/dashboard/admin/meetings/page.tsx` - Added meeting real-time updates

## Testing Guide

### Manual Testing:

1. **Open Dashboard in Two Browsers**:
   - Browser 1: Staff dashboard
   - Browser 2: Admin attendance page
   - Clock in from one browser, see instant update in the other

2. **Test Leave Requests**:
   - Submit leave request in staff dashboard
   - Check if admin pages update instantly

3. **Test Meetings**:
   - Create meeting in one tab
   - Check if updates show in other tabs

4. **Test Exports**:
   - Clock in/out while export button is visible
   - Verify update indicator shows

### Automated Testing:

```typescript
// Example test using Jest and Supabase
it('should auto-update when attendance changes', async () => {
  render(<DashboardRealtime userId={testUserId}><Dashboard /></DashboardRealtime>);
  
  // Simulate attendance update
  await updateAttendance(testUserId, { clock_out: new Date() });
  
  // Wait for auto-update
  await waitFor(() => {
    expect(window.location.reload).toHaveBeenCalled();
  }, { timeout: 3000 });
});
```

## Database Requirements

### Tables that Support Real-Time:
- `attendance` - Clock in/out records
- `leave_requests` - Leave request submissions
- `meetings` - Meeting schedules
- `meeting_attendees` - Meeting attendance tracking
- `meeting_minutes` - Meeting minutes
- `profiles` - Staff information

### Required Columns:
Each monitored table should include timestamp columns for tracking updates:
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

## Support and Debugging

### Enable Debug Logging:

Add this to your browser console to see all realtime events:
```javascript
localStorage.setItem('debug', 'realtime:*');
```

### Check Active Subscriptions:

```javascript
// In browser console
supabase.getChannels(); // View all active channels
```

### Monitor Realtime Events:

All realtime events log with `[Realtime]` prefix for easy filtering in console.

---

**Version**: 1.0
**Last Updated**: March 22, 2026
**Status**: Production Ready
