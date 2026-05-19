-- ============================================================================
-- LEAVE REQUEST CONSTRAINT FIX
-- Run these SQL commands in Supabase SQL Editor in the exact order shown
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP the old constraint FIRST (RUN FIRST)
-- ============================================================================
-- Must remove the constraint before updating records

ALTER TABLE leave_requests 
DROP CONSTRAINT IF EXISTS leave_requests_request_type_check;

-- ============================================================================
-- STEP 2: Update existing records with old types to new types (RUN AFTER STEP 1)
-- ============================================================================
-- This migrates any old leave request records to the new types

UPDATE leave_requests 
SET request_type = 'sick_leave' 
WHERE request_type = 'leave' OR request_type = 'Sick Leave';

UPDATE leave_requests 
SET request_type = 'others' 
WHERE request_type = 'absent' OR request_type = 'Absent';

UPDATE leave_requests 
SET request_type = 'others' 
WHERE request_type = 'day_off' OR request_type = 'Day Off';

-- ============================================================================
-- STEP 3: Update NULL or empty reasons (RUN AFTER STEP 2)
-- ============================================================================
-- Backfill any NULL reasons so the NOT NULL constraint can be applied

UPDATE leave_requests 
SET reason = 'Not specified' 
WHERE reason IS NULL OR reason = '';

-- ============================================================================
-- STEP 4: Add new constraint with all valid types (RUN AFTER STEP 3)
-- ============================================================================
-- Add the new constraint that allows the correct request types

ALTER TABLE leave_requests 
ADD CONSTRAINT leave_requests_request_type_check 
CHECK (request_type IN ('sick_leave', 'maternity_leave', 'paternity_leave', 'others'));

-- ============================================================================
-- STEP 5: Make reason column NOT NULL (RUN AFTER STEP 4)
-- ============================================================================
-- Enforce that reason cannot be null for new records

ALTER TABLE leave_requests 
ALTER COLUMN reason SET NOT NULL;

-- ============================================================================
-- VERIFICATION (Optional - check the changes)
-- ============================================================================
-- Run these SELECT statements to verify the migration was successful:

-- Check unique request types (should only show: sick_leave, maternity_leave, paternity_leave, others)
SELECT DISTINCT request_type FROM leave_requests;

-- Check for any NULL reasons (should show 0)
SELECT COUNT(*) as null_reasons FROM leave_requests WHERE reason IS NULL;

-- View all leave requests (verify data looks correct)
SELECT id, staff_id, request_type, start_date, end_date, reason, status FROM leave_requests ORDER BY created_at DESC LIMIT 20;
