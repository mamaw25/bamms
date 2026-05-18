-- Add work_from_home column to attendance table
-- Run this in Supabase SQL Editor to enable WFH feature tracking

ALTER TABLE attendance 
ADD COLUMN work_from_home BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_attendance_work_from_home ON attendance(work_from_home);

-- Update comment for documentation
COMMENT ON COLUMN attendance.work_from_home IS 'TRUE if attendance was recorded as Work From Home, FALSE if on-site';
