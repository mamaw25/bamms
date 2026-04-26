# Leave Request System Setup

This document describes the database setup for the leave request feature (Sick Leave, Maternity Leave, Paternity Leave, Others).

## Database Migration

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create leave_requests table
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

-- Create indexes for faster queries
CREATE INDEX idx_leave_requests_staff ON leave_requests(staff_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Staff can view their own requests
CREATE POLICY "Staff can view own leave requests" ON leave_requests
  FOR SELECT
  USING (auth.uid() = staff_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Staff can insert their own requests
CREATE POLICY "Staff can create leave requests" ON leave_requests
  FOR INSERT
  WITH CHECK (auth.uid() = staff_id);

-- Only admins can update requests
CREATE POLICY "Admins can update leave requests" ON leave_requests
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

## Update Existing Table

If you already have the leave_requests table with old values, run this migration:

```sql
-- Drop the old constraint
ALTER TABLE leave_requests DROP CONSTRAINT leave_requests_request_type_check;

-- Add the new constraint
ALTER TABLE leave_requests
ADD CONSTRAINT leave_requests_request_type_check 
CHECK (request_type IN ('sick_leave', 'maternity_leave', 'paternity_leave', 'others'));

-- Make reason NOT NULL for new records (optional: backfill existing NULLs first)
-- ALTER TABLE leave_requests ALTER COLUMN reason SET NOT NULL;
```

## Features Included

- **Request Types:** Sick Leave, Maternity Leave, Paternity Leave, Others
- **Status:** Pending, Approved, Rejected
- **Admin Notes:** Admins can add notes when approving/rejecting
- **Date Range:** Support for multi-day requests
- **Reason:** Staff must provide reason for the request (required field)

## How to Use

1. Run the SQL migration in Supabase
2. Staff can submit leave requests through the dashboard
3. Admins can view, approve, or reject requests in the manage staff section
4. Notifications will inform staff of the decision
