# Fix for Leave Request Error

## Error You're Seeing
```
ERROR: 23514: check constraint "leave_requests_request_type_check" of relation "leave_requests" is violated by some row
```

## Root Cause
Your database has old leave request records with types like `'leave'`, `'absent'`, or `'day_off'`, but the new code expects `'sick_leave'`, `'maternity_leave'`, `'paternity_leave'`, or `'others'`.

## Quick Fix - Run in Supabase SQL Editor

**Run these 3 commands in order:**

### 1️⃣ Update existing records (FIRST)
```sql
UPDATE leave_requests SET request_type = 'sick_leave' WHERE request_type = 'leave';
UPDATE leave_requests SET request_type = 'others' WHERE request_type = 'absent';
UPDATE leave_requests SET request_type = 'others' WHERE request_type = 'day_off';
```

### 2️⃣ Change the database constraint (SECOND)
```sql
ALTER TABLE leave_requests DROP CONSTRAINT leave_requests_request_type_check;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_request_type_check 
  CHECK (request_type IN ('sick_leave', 'maternity_leave', 'paternity_leave', 'others'));
```

### 3️⃣ (Optional) Make reason required
```sql
UPDATE leave_requests SET reason = 'Not specified' WHERE reason IS NULL;
ALTER TABLE leave_requests ALTER COLUMN reason SET NOT NULL;
```

## What Changed
- ✅ Dropdown menu now shows: Sick Leave, Maternity Leave, Paternity Leave, Others
- ✅ Reason field is now required (instead of optional)
- ✅ All existing leave records mapped: leave→sick_leave, absent/day_off→others

## After Running SQL
The leave request form will work! Try submitting a new leave request - it should succeed.

---
See [LEAVE_REQUEST_MIGRATION.md](LEAVE_REQUEST_MIGRATION.md) for complete details and rollback options.
