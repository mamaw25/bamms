# Work From Home Implementation Guide

## Overview
The staff dashboard has been updated to support Work From Home (WFH) and On-Site attendance tracking. Check-in/out buttons now only appear for WFH days, while on-site employees must use the kiosk system.

## Database Schema Changes

### Attendance Table
The attendance table now includes a `work_from_home` column:
```sql
ALTER TABLE attendance ADD COLUMN work_from_home BOOLEAN DEFAULT false;
```

**New Column:**
- `work_from_home` (BOOLEAN): Indicates if the day is work-from-home (true) or on-site (false)

## Staff Dashboard Changes (`/app/dashboard/page.tsx`)

### New Logic
1. **Check Today's Work Location:**
   - Fetches the attendance record for today
   - Determines if it's a work-from-home day (`isWorkFromHomeToday`)

2. **Display Different States:**
   - **No Schedule:** Shows message if no attendance record exists for today
   - **On-Site Work:** Shows message to use the kiosk system (no check-in button)
   - **WFH - Not Clocked In:** Shows "Clock In" button only if `work_from_home === true`
   - **WFH - Clocked In:** Shows "Clock Out" button
   - **Shift Completed:** Shows completed status after clock out

### Code Changes
```tsx
// New variables added
const todayRecord = attendance?.find(record => record.date === todayStr);
const isWorkFromHomeToday = todayRecord?.work_from_home === true;

// Conditional rendering based on work location
{!todayRecord && (...)} // No schedule
{todayRecord && !isWorkFromHomeToday && (...)} // On-site
{todayRecord && isWorkFromHomeToday && !isClockedIn && !finishedToday && (...)} // WFH - not clocked in
{todayRecord && isWorkFromHomeToday && isClockedIn && (...)} // WFH - clocked in
{finishedToday && (...)} // Shift completed
```

## Admin Attendance Report Changes (`/app/dashboard/admin/page.tsx`)

### New Column Added
A new **"Location"** column displays the work arrangement:
- **WFH** (purple badge) - Work From Home
- **On-Site** (orange badge) - On-Site work

### Table Structure
| Staff Member | Date | In/Out Times | Duration | **Location** | Status |
|---|---|---|---|---|---|
| John Doe | 2026-04-06 | 09:00:00 - 17:30:00 | 8h 30m | **WFH** | Finished |
| Jane Smith | 2026-04-06 | 09:15:00 | - | **On-Site** | Working |

## Type Definitions (`/app/dashboard/admin/action.ts`)

### Updated Interfaces

**RawAttendance:**
```typescript
interface RawAttendance {
  work_from_home: boolean; // Added
  // ... other fields
}
```

**AttendanceReport:**
```typescript
export interface AttendanceReport {
  work_from_home: boolean; // Added
  // ... other fields
}
```

## Calendar Grid Updates (`/app/dashboard/CalendarGrid.tsx`)

### Updated Interface
```typescript
interface AttendanceRecord {
  work_from_home?: boolean; // Added
  // ... other fields
}
```

The calendar now supports displaying work location information in day details modal.

## Setup Instructions

### 1. Database Migration
Run this SQL in Supabase to add the column:
```sql
ALTER TABLE attendance ADD COLUMN work_from_home BOOLEAN DEFAULT false;
```

### 2. Setting Work Location
Admins can set work location when creating/editing attendance records. Example:
```typescript
// When creating attendance record
await supabase
  .from('attendance')
  .insert({
    profile_id: userId,
    date: todayStr,
    clock_in: new Date().toISOString(),
    work_from_home: true, // Set as WFH
  })
```

### 3. Admin Interface
Admins can update employee work location through the staff dashboard admin panel when creating or modifying attendance records.

## Features

✅ **WFH-Only Check-In/Out:** Check-in/out buttons only appear for WFH days
✅ **On-Site Kiosk Requirement:** On-site employees see message to use kiosk
✅ **Admin Visibility:** Attendance report clearly shows work location
✅ **No Schedule Handling:** Graceful handling of days with no schedule
✅ **Type-Safe:** Full TypeScript support for the new field

## Migration Path for Existing Records

Existing attendance records default to `work_from_home = false`. To mark historical WFH days:

```sql
-- Mark specific dates as WFH for a staff member
UPDATE attendance 
SET work_from_home = true 
WHERE profile_id = 'staff-id' AND date = '2026-04-05';
```

## Testing

1. **WFH Scenario:**
   - Create attendance record with `work_from_home: true`
   - Verify check-in button appears on dashboard
   - Verify "WFH" badge shows in admin report

2. **On-Site Scenario:**
   - Create attendance record with `work_from_home: false`
   - Verify check-in button does NOT appear
   - Verify "On-Site" message appears
   - Verify "On-Site" badge shows in admin report

3. **No Schedule:**
   - Remove attendance record for a day
   - Verify "No Schedule for Today" message appears
