# Barangay Meetings Database Setup

To set up the Barangay Meetings feature, you need to create the following tables in your Supabase database. Run these SQL commands in your Supabase SQL Editor.

## 1. Create Meetings Table

```sql
CREATE TABLE meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT NOT NULL,
  agenda TEXT NOT NULL,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_meetings_date ON meetings(date DESC);
CREATE INDEX idx_meetings_status ON meetings(status);
```

## 2. Create Meeting Attendees Table

```sql
CREATE TABLE meeting_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(meeting_id, staff_id)
);

-- Add indexes
CREATE INDEX idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_staff ON meeting_attendees(staff_id);
```

## 3. Set Row Level Security (Optional but Recommended)

```sql
-- Enable RLS on meetings table
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do anything with meetings
CREATE POLICY "Admins can manage meetings" ON meetings
  AS ALL
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Enable RLS on meeting_attendees table
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage attendees
CREATE POLICY "Admins can manage attendees" ON meeting_attendees
  AS ALL
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

## How to Use:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste each SQL block above
5. Execute each query

Once the tables are created, the Barangay Meetings feature will be fully functional!
