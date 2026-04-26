# Kiosk Database Error Fix - PGRST204

## Problem
When entering an ID in the kiosk, received error: `Database error during Clock In. [PGRST204]`

**Root Cause:** Column name mismatch
- Database schema uses: `check_in` (TIMESTAMP)
- Kiosk was trying to insert: `clock_in` (non-existent column)
- Result: PostgreSQL error PGRST204 (column doesn't exist)

## Solution
Updated all components to use correct database column names and added missing `work_from_home` support.

### Database Schema (Correct)
```sql
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'on_leave')),
  check_in TIMESTAMP,        -- ✅ Correct column name
  clock_out TIMESTAMP,       -- ✅ Correct column name
  work_from_home BOOLEAN DEFAULT false,  -- ✅ New column (add if missing)
  created_at TIMESTAMP DEFAULT now()
);
```

## Files Fixed

### 1. Kiosk Actions (`/app/kiosk/actions.ts`)
**Changed:**
- `clock_in` → `check_in` in clockIn() function
- Added `work_from_home: false` (kiosk is for on-site check-ins)

**Before:**
```typescript
const { error } = await supabase
  .from('attendance')
  .insert({
    profile_id: userId,
    date: today,
    status: 'present',
    clock_in: new Date().toISOString()  // ❌ Wrong column
  })
```

**After:**
```typescript
const { error } = await supabase
  .from('attendance')
  .insert({
    profile_id: userId,
    date: today,
    status: 'present',
    check_in: new Date().toISOString(),  // ✅ Correct column
    work_from_home: false                // ✅ Kiosk is on-site
  })
```

### 2. Dashboard Actions (`/app/dashboard/actions.ts`)
**Fixed:**
- clockIn() now uses `check_in` instead of `clock_in`
- Added `work_from_home: true` for dashboard WFH clock-ins
- Added `status: 'present'` field

```typescript
// Dashboard clock-in (for WFH employees)
const { error } = await supabase
  .from('attendance')
  .insert({
    profile_id: userId,
    date: todayStr,
    check_in: new Date().toISOString(),     // ✅ Correct
    clock_out: null,
    status: 'present',
    work_from_home: true                     // ✅ WFH indicator
  })
```

### 3. Admin Report (`/app/dashboard/admin/action.ts`)
**Verified:**
- RawAttendance interface uses `check_in` (correct)
- AttendanceReport interface includes `work_from_home` field
- Query orders by `check_in` (correct)

## Database Migration

If the `work_from_home` column doesn't exist in your database, add it:

```sql
ALTER TABLE attendance ADD COLUMN work_from_home BOOLEAN DEFAULT false;
```

## Kiosk vs Dashboard - Key Differences

| Feature | Kiosk | Dashboard |
|---------|-------|-----------|
| **Used By** | On-site employees | WFH employees |
| **Check-In Column** | `check_in` | `check_in` |
| **work_from_home** | `false` | `true` |
| **Location** | Physical kiosk/tablet | Remote/WFH |
| **Access** | ID number based | User authenticated |

## Testing Checklist

- [ ] Kiosk: Enter valid ID number → Should successfully clock in
- [ ] Kiosk: Enter same ID again → Should successfully clock out
- [ ] Dashboard (WFH): Should see check-in button for WFH days only
- [ ] Admin Report: Should display work location (WFH or On-Site)
- [ ] Admin Report: Check-in times display correctly

## Error Reference

**PGRST204 = PostgreSQL "Unknown Column" Error**
- Occurs when trying to insert/update a column that doesn't exist
- Fix: Use correct column names from database schema

**Columns in attendance table:**
- `id` - UUID primary key
- `profile_id` - Foreign key to profiles
- `date` - DATE of attendance
- `status` - 'present', 'absent', or 'on_leave'
- `check_in` - TIMESTAMP when clocked in ✅
- `clock_out` - TIMESTAMP when clocked out ✅
- `work_from_home` - BOOLEAN for WFH tracking ✅
- `created_at` - Record creation time

## Status
✅ All files updated
✅ Project builds successfully
✅ No TypeScript errors
✅ Ready for testing
