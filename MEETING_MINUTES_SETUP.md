# Meeting Minutes Database Setup

To enable meeting minutes functionality, you need to create the `meeting_minutes` table in Supabase.

## Important: Data Type Compatibility

The `meetings` table uses `BIGINT` for the `id` column, so the `meeting_minutes` table must also use `BIGINT` for the foreign key.

## SQL Command

Run the following SQL command in your Supabase SQL Editor:

```sql
-- Create meeting_minutes table
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id BIGSERIAL PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_meeting_id ON meeting_minutes(meeting_id);

-- Add RLS policies (if RLS is enabled)
ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meeting minutes" ON meeting_minutes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert meeting minutes" ON meeting_minutes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update meeting minutes" ON meeting_minutes
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete meeting minutes" ON meeting_minutes
  FOR DELETE USING (true);
```

## Steps

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Click "New Query"
4. Copy and paste the SQL command above
5. Click "Run"

## Verification

After running the SQL, you should see:
- `meeting_minutes` table created in the Tables section
- Index `idx_meeting_minutes_meeting_id` created
- Foreign key constraint `meeting_minutes_meeting_id_fkey` created
- RLS policies enabled

The table is now ready to use for storing meeting minutes!
