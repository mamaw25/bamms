# Meeting Completed_At Setup

This guide explains how to add the `completed_at` column to the meetings table to track when a meeting was marked as completed.

## Why This Column?

The `completed_at` column ensures that when a meeting status is set to "Completed", no additional attendees can be auto-added from check-ins that occur after the meeting is marked as completed.

## Setup Instructions

### Step 1: Add the `completed_at` Column

Go to your Supabase Dashboard and run this SQL in the SQL Editor:

```sql
ALTER TABLE meetings ADD COLUMN completed_at TIMESTAMP DEFAULT NULL;

-- Add index for faster queries
CREATE INDEX idx_meetings_completed_at ON meetings(completed_at);
```

### Step 2: Verify the Column

After running the SQL, verify the column was added:

```sql
SELECT * FROM meetings LIMIT 1;
```

You should see the new `completed_at` column.

## How It Works

1. When a meeting's status is changed to "Completed", the `completed_at` timestamp is automatically set to the current time.
2. When fetching attendees for a completed meeting, only check-ins that occurred **before** the `completed_at` timestamp are included.
3. Any check-ins that occur **after** the meeting is marked as completed will not be automatically added to the attendees list.

## Example Scenario

- Meeting scheduled for 2024-02-21 at 10:00 AM
- Staff members check in throughout the meeting
- At 11:30 AM, admin marks the meeting as "Completed" (`completed_at` = 2024-02-21 11:30:00)
- Staff member A checks in at 11:15 AM → **INCLUDED** in attendees (before completion time)
- Staff member B checks in at 11:45 AM → **NOT INCLUDED** in attendees (after completion time)

## Files Modified

- `app/dashboard/admin/meetings/action.ts` - Updated `updateMeeting()` and `getMeetingAttendees()` functions

## Troubleshooting

**Issue**: "Column completed_at does not exist" error
- **Solution**: Make sure you've run the SQL setup above in your Supabase Dashboard

**Issue**: Changes not taking effect
- **Solution**: Clear your browser cache and restart the development server
