# Leave Request Constraint Error - FIX GUIDE

## Error Description
When submitting a leave request, you see:
```
new row for relation "leave_requests" violates check constraint "leave_requests_request_type_check"
```

## What's Wrong
1. **Code Issue**: Backend was allowing `reason` to be null, but the database requires it
2. **Database Issue**: The constraint may need to be updated or there may be old incompatible data
3. **Schema Mismatch**: Existing records might have old leave type values

## Solution - Two Parts

### PART 1: Fix the Backend Code ✅ DONE
The backend code (`app/dashboard/staff/leaveActions.ts`) has been updated to:
- Validate that `reason` is not empty before submission
- Always trim and sanitize the reason field
- Prevent null values from being inserted

### PART 2: Fix the Database (YOU MUST DO THIS)
Run the SQL migration in your Supabase console:

1. **Go to Supabase** → Your project → SQL Editor
2. **Copy and paste the SQL** from: `docs/LEAVE_REQUEST_CONSTRAINT_FIX.sql`
3. **Execute each step in order**:
   - Step 1: Update old records
   - Step 2: Backfill missing reasons
   - Step 3: Update constraints
   - Step 4: Make reason NOT NULL
4. **Optional**: Run verification queries to check the results

## Expected Database Schema After Fix
```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES profiles(id),
  request_type TEXT NOT NULL 
    CHECK (request_type IN ('sick_leave', 'maternity_leave', 'paternity_leave', 'others')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,  -- Now enforced as NOT NULL
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## Valid Request Types
- `sick_leave` → "Sick Leave"
- `maternity_leave` → "Maternity Leave"
- `paternity_leave` → "Paternity Leave"
- `others` → "Others"

## After Fixing
1. Refresh your browser
2. Go to Dashboard → Leave Request section
3. Try submitting a new leave request:
   - Select request type (e.g., "Sick Leave")
   - Pick start and end dates
   - Enter a reason (now required)
   - Click "Submit Request"
4. ✅ It should now work without errors!

## Troubleshooting
If you still see errors after running the SQL:
- Check that ALL SQL commands were executed (not just some)
- Verify no errors appeared during SQL execution
- Make sure the reason field in the form is not empty
- Try clearing browser cache: `Ctrl+Shift+Delete`

## Need Help?
- See: `docs/LEAVE_REQUEST_CONSTRAINT_FIX.sql` for detailed SQL commands
- See: `docs/archive/LEAVE_REQUEST_MIGRATION.md` for background information
- Check: `app/dashboard/staff/leaveActions.ts` for backend implementation
