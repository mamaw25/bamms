# Meeting Minutes Setup Checklist

## Steps to Enable Meeting Minutes Feature

### Step 1: Create Database Table
Go to your Supabase Dashboard and run this SQL in the SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id BIGSERIAL PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_minutes_meeting_id ON meeting_minutes(meeting_id);
```

### Step 2: Verify Components Are In Place
The following files should now exist:
- ✅ `app/dashboard/admin/meetings/MeetingMinutesForm.tsx` (new component)
- ✅ `app/dashboard/admin/meetings/action.ts` (updated with new functions)
- ✅ `app/dashboard/admin/meetings/page.tsx` (updated with button)
- ✅ `app/dashboard/admin/meetings/ExportMinutesButton.tsx` (updated template)

### Step 3: Test the Feature
1. Go to Admin Panel → Barangay Meetings
2. Click on any meeting to open details
3. Click the "Add Minutes" button (blue button)
4. Type in some meeting notes
5. Click "Save Minutes"
6. You should see a success message

### Step 4: Verify Export
1. The "Export Minutes" button should work as before
2. The exported file should NOT contain "ACTIONS TAKEN" section
3. It should have "MEETING NOTES" section for the template

## What Each Button Does

- **Add Minutes** (Blue): Opens a modal form to input/edit meeting notes
- **Export Minutes** (Amber): Downloads a text file template for printing

## Troubleshooting

**Issue**: "Failed to save meeting minutes" error
- **Solution**: Make sure the `meeting_minutes` table is created in Supabase

**Issue**: Buttons don't appear in meeting details
- **Solution**: Clear browser cache and refresh the page

**Issue**: Database connection error
- **Solution**: Verify your Supabase credentials in `lib/supabase/server.ts`

## Files Modified
- `app/dashboard/admin/meetings/page.tsx` - Added import and button
- `app/dashboard/admin/meetings/action.ts` - Added 3 new server actions
- `app/dashboard/admin/meetings/ExportMinutesButton.tsx` - Removed ACTIONS TAKEN section
- `app/dashboard/admin/attendance/ExportButton.tsx` - Fixed TypeScript error
- `app/dashboard/admin/ExportButton.tsx` - Fixed TypeScript error

## Files Created
- `app/dashboard/admin/meetings/MeetingMinutesForm.tsx` - New component for input form
- `MEETING_MINUTES_SETUP.md` - Database setup guide
- `MEETING_MINUTES_FEATURE.md` - Feature documentation
- `MEETING_MINUTES_CHECKLIST.md` - This file
