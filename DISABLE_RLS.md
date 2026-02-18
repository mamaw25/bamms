# Disable RLS for Development

If you're having issues with deleting meetings, the RLS (Row Level Security) policies may be blocking the operation. Run these commands in your Supabase SQL Editor:

## Disable RLS on Meetings Table

```sql
-- Disable RLS on meetings table (allows any authenticated user to perform all operations)
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
```

## Disable RLS on Meeting Attendees Table

```sql
-- Disable RLS on meeting_attendees table
ALTER TABLE meeting_attendees DISABLE ROW LEVEL SECURITY;
```

## Verify RLS is Disabled

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('meetings', 'meeting_attendees');
```

The `rowsecurity` column should show `false` (meaning RLS is disabled).

## Re-enable with Proper Policies (After Verification)

Once you verify deletion works, you can re-enable RLS with proper policies:

```sql
-- Re-enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users
CREATE POLICY "Allow authenticated users to manage meetings" ON meetings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```
