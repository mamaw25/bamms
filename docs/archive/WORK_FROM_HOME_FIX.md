# Work From Home Feature - Synchronization Issue & Fix

## Issue Summary

When clicking "Work From Home Check-In" on the staff dashboard:
- ❌ Dashboard showed it as "ON-SITE" (green dot in calendar)
- ✅ Admin Report showed it as "WORK-FROM-HOME" (was using default/NULL value)

This was backwards and inconsistent.

## Root Cause

The `workFromHomeCheckIn()` and `workFromHomeCheckOut()` functions were **NOT** inserting the `work_from_home: true` flag into the database. They were just inserting regular attendance records identical to on-site check-ins.

### Before (Broken):
```typescript
const { error } = await supabase
  .from('attendance')
  .insert({
    profile_id: userId,
    date: todayStr,
    check_in: new Date().toISOString(),
    clock_out: null,
    status: 'present'
    // ❌ Missing: work_from_home flag
  })
```

### After (Fixed):
```typescript
const { error } = await supabase
  .from('attendance')
  .insert({
    profile_id: userId,
    date: todayStr,
    check_in: new Date().toISOString(),
    clock_out: null,
    status: 'present',
    work_from_home: true  // ✅ Added
  })
```

## Changes Made

### 1. `/app/dashboard/actions.ts`
- **clockIn()**: Now inserts `work_from_home: false` (on-site)
- **workFromHomeCheckIn()**: Now inserts `work_from_home: true` (WFH)
- **workFromHomeCheckOut()**: Updates record (flag already set from check-in)

### 2. `/app/dashboard/CalendarGrid.tsx`
- Updated calendar grid to display WFH status with **purple dot** (instead of green)
- Purple = Work From Home
- Green = On-Site
- Red = Absent

**Before:**
```tsx
<div className={`w-1.5 h-1.5 rounded-full mt-1 ${details.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
```

**After:**
```tsx
<div className={`w-1.5 h-1.5 rounded-full mt-1 ${details.work_from_home ? 'bg-purple-500' : details.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} title={details.work_from_home ? 'Work From Home' : 'On-Site'} />
```

## Database Requirement

The `work_from_home` column must exist in the `attendance` table. If it doesn't exist, run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE attendance 
ADD COLUMN work_from_home BOOLEAN DEFAULT false;

CREATE INDEX idx_attendance_work_from_home ON attendance(work_from_home);

COMMENT ON COLUMN attendance.work_from_home IS 'TRUE if attendance was recorded as Work From Home, FALSE if on-site';
```

File: [ADD_WORK_FROM_HOME_COLUMN.sql](ADD_WORK_FROM_HOME_COLUMN.sql)

## Expected Behavior After Fix

### Staff Dashboard
- **On-Site Check-In** → Green dot in calendar (on-site work)
- **WFH Check-In** → Purple dot in calendar (work from home)

### Admin Attendance Report
- **On-Site** → "ON-SITE" badge with orange background
- **WFH** → "WFH" badge with purple background

### Export (CSV/Excel)
- **Location** column shows:
  - "On-Site" for regular check-ins
  - "Work From Home" for WFH check-ins

## Testing Checklist

- [ ] WFH Check-In button appears on dashboard
- [ ] Click WFH Check-In → Modal appears
- [ ] Confirm WFH Check-In → Dashboard updates with purple dot
- [ ] Admin Report shows "WFH" badge (purple) for today's WFH check-in
- [ ] Export CSV includes "Work From Home" in Location column
- [ ] On-Site Check-In still shows green dot and "ON-SITE" badge

## Files Modified

1. [app/dashboard/actions.ts](app/dashboard/actions.ts) - Added work_from_home flag to check-in functions
2. [app/dashboard/CalendarGrid.tsx](app/dashboard/CalendarGrid.tsx) - Updated calendar to display WFH status with color
3. [ADD_WORK_FROM_HOME_COLUMN.sql](ADD_WORK_FROM_HOME_COLUMN.sql) - SQL migration for database column

## Next Steps

1. **Verify database column exists**: Run the SQL from `ADD_WORK_FROM_HOME_COLUMN.sql` in Supabase SQL Editor
2. **Test WFH Check-In**: Click the button and verify purple dot appears
3. **Test Admin Report**: Check that WFH badge shows correctly
4. **Test Export**: Download CSV and verify Location column

