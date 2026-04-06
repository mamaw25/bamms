# Leave Request Types Migration

**Date:** April 6, 2026

## Summary
Updated leave request types from generic types (leave, absent, day-off) to specific leave categories (Sick Leave, Maternity Leave, Paternity Leave, Others).

## ⚠️ ERROR FIX

**Error:** "check constraint 'leave_requests_request_type_check' of relation 'leave_requests' is violated by some row"

**Reason:** Your database has existing records with old request types that don't match the new constraint. You must update those records FIRST before changing the constraint.

## Required Database Changes (IN ORDER)

### Step 1: Update Existing Records to New Types (RUN THIS FIRST)

Copy and run this SQL in your Supabase SQL Editor:

```sql
-- Map old leave types to new types
UPDATE leave_requests 
SET request_type = 'sick_leave' 
WHERE request_type = 'leave';

UPDATE leave_requests 
SET request_type = 'others' 
WHERE request_type = 'absent';

UPDATE leave_requests 
SET request_type = 'others' 
WHERE request_type = 'day_off';
```

### Step 2: Drop Old Constraint and Add New One (RUN THIS AFTER STEP 1)

After all records are updated, run:

```sql
-- Drop the old constraint
ALTER TABLE leave_requests DROP CONSTRAINT leave_requests_request_type_check;

-- Add the new constraint with updated types
ALTER TABLE leave_requests
ADD CONSTRAINT leave_requests_request_type_check 
CHECK (request_type IN ('sick_leave', 'maternity_leave', 'paternity_leave', 'others'));
```

### Step 3: Make Reason Required (OPTIONAL - only if you want to enforce reasons)

```sql
-- First, update any NULL reasons to a default value
UPDATE leave_requests SET reason = 'Not specified' WHERE reason IS NULL;

-- Then make the column NOT NULL
ALTER TABLE leave_requests ALTER COLUMN reason SET NOT NULL;
```

## Migration Mapping

Your existing leave request types have been mapped as follows:

| Old Type | New Type | Reason |
|----------|----------|--------|
| `leave` | `sick_leave` | Most generic leave is typically sick leave |
| `absent` | `others` | Unspecified absence becomes "Others" |
| `day_off` | `others` | Personal day off becomes "Others" |

If you prefer a different mapping, you can customize Step 1 SQL before running it.

## Changes Made in Code

### Frontend (LeaveRequestForm.tsx)
- ✅ Updated dropdown options:
  - Sick Leave (`sick_leave`)
  - Maternity Leave (`maternity_leave`)
  - Paternity Leave (`paternity_leave`)
  - Others (`others`)
- ✅ Made reason field required (no longer optional)
- ✅ Added red asterisk (*) indicator for required field

### Backend (leaveActions.ts)
- ✅ Server action accepts the new leave types
- ✅ Validates new request types

### Database (Supabase)
- ⚠️ **ACTION REQUIRED:** Run the SQL commands above in order

## Testing After Migration

1. Go to Staff Dashboard → Leave Request section
2. Try submitting a leave request with:
   - Request Type: Select any new option (Sick Leave, Maternity Leave, Paternity Leave, or Others)
   - Reason: Provide a reason (now required)
   - Dates: Select start and end dates
3. Click "Submit Request" - should now work without errors

## Database Schema After Migration

```sql
CREATE TABLE leave_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('sick_leave', 'maternity_leave', 'paternity_leave', 'others')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## Rollback (if needed)

If you need to revert to the old types:

```sql
-- Update records back to old types
UPDATE leave_requests SET request_type = 'leave' WHERE request_type = 'sick_leave';
UPDATE leave_requests SET request_type = 'absent' WHERE request_type = 'others' AND created_at < now();

-- Drop the new constraint
ALTER TABLE leave_requests DROP CONSTRAINT leave_requests_request_type_check;

-- Add the old constraint back
ALTER TABLE leave_requests
ADD CONSTRAINT leave_requests_request_type_check 
CHECK (request_type IN ('leave', 'absent', 'day_off'));
```

**Note:** Rollback is not recommended after running Step 2 on Step 3, as you may lose historical leave request type information.

