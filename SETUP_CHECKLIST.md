# Auto-Update System - Setup Checklist

## ✅ Pre-Setup Requirements

- [ ] Supabase project is created
- [ ] Database tables exist (attendance, leave_requests, meetings, etc.)
- [ ] Application is running on Next.js 16+
- [ ] Supabase client is configured in app
- [ ] Environment variables are set (.env.local)

## 🔧 Step 1: Enable Realtime in Supabase

### Option A: Via Supabase Dashboard

1. Go to Supabase Dashboard → Your Project
2. Click "SQL Editor"
3. Create a new query and run:

```sql
-- Enable realtime for attendance tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- Enable realtime for leave requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;

-- Enable realtime for meetings
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;

-- Enable realtime for meeting attendees
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_attendees;

-- Enable realtime for meeting minutes
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_minutes;

-- Enable realtime for profiles (staff)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
```

4. Click "Run" and verify no errors
5. [ ] Confirmed: Realtime enabled for all tables

### Option B: Via Supabase CLI

```bash
supabase db push
```

## ✅ Step 2: Verify Installation

### Check File Structure

Verify these new files exist:
- [ ] `lib/realtime/hooks.ts`
- [ ] `app/dashboard/DashboardRealtime.tsx`
- [ ] `app/dashboard/admin/attendance/AdminAttendanceRealtime.tsx`
- [ ] `app/dashboard/admin/AdminReportRealtime.tsx`

### Check Modifications

Verify these files were modified:
- [ ] `app/dashboard/page.tsx` - Has DashboardRealtime import
- [ ] `app/dashboard/components/LeaveRequestSection.tsx` - Has hooks import
- [ ] `app/dashboard/admin/page.tsx` - Has AdminReportRealtime import
- [ ] `app/dashboard/admin/attendance/page.tsx` - Has AdminAttendanceRealtime import
- [ ] `app/dashboard/admin/attendance/ExportButton.tsx` - Has hooks import
- [ ] `app/dashboard/admin/meetings/page.tsx` - Has meeting hooks import

## 🧪 Step 3: Test Auto-Updates

### Test 1: Attendance Auto-Update

1. [ ] Open http://localhost:3000/dashboard in Browser 1 (as staff)
2. [ ] Open http://localhost:3000/dashboard/admin/attendance in Browser 2 (as admin)
3. [ ] In Browser 1, click "Clock In"
4. [ ] Verify Browser 2 updates automatically (should see new record appear)
5. [ ] In Browser 1, click "Clock Out"
6. [ ] Verify Browser 2 updates automatically (should see clock out time)

✅ **Test Result**: _______________

### Test 2: Leave Request Auto-Update

1. [ ] Open http://localhost:3000/dashboard in Browser 1 (as staff)
2. [ ] Open http://localhost:3000/dashboard/admin/staff in Browser 2 (as admin)
3. [ ] In Browser 1, submit a leave request
4. [ ] Watch for "Auto-updated" indicator in Browser 1
5. [ ] Verify Browser 2 shows the new request

✅ **Test Result**: _______________

### Test 3: Export Button Indicator

1. [ ] Open http://localhost:3000/dashboard/admin/attendance in Browser 1
2. [ ] Clock in/out from another tab or device
3. [ ] Watch for "🔄 Updated X seconds ago" indicator near Export button
4. [ ] Click "Export Excel" and verify it includes latest data

✅ **Test Result**: _______________

### Test 4: Meeting Updates

1. [ ] Open http://localhost:3000/dashboard/admin/meetings in Browser 1
2. [ ] Create a new meeting
3. [ ] Verify the list updates automatically
4. [ ] Watch for update indicator

✅ **Test Result**: _______________

## 🔍 Step 4: Browser Console Verification

1. [ ] Open any dashboard page
2. [ ] Open Browser DevTools (F12)
3. [ ] Go to Console tab
4. [ ] Look for "[Realtime]" messages
5. [ ] You should see messages like:
   - `[Realtime] Channel status for attendance: SUBSCRIBED`
   - `[Realtime] Insert on attendance: {...}`
   - `[Realtime] Update on attendance: {...}`

Example console output:
```
[Realtime] Channel status for attendance: SUBSCRIBED
[Realtime] New attendance record: {id: "...", profile_id: "...", ...}
[Dashboard] Attendance updated for current user: {...}
[Dashboard] Refreshing page due to data changes...
```

✅ **Console Check**: _______________

## 📊 Step 5: Performance Verification

1. [ ] Test with multiple concurrent users
2. [ ] Monitor browser network tab (should see WebSocket connection)
3. [ ] Check for excessive page refreshes (should batch into 1-2 second intervals)
4. [ ] Verify no console errors

Network tab should show:
- WebSocket connection: `wss://.../_realtime/...`
- Status: `101 Switching Protocols`

✅ **Performance Check**: _______________

## 🐛 Step 6: Troubleshooting

### If updates don't work:

1. [ ] **Check Realtime is Enabled**
   - Go to Supabase Dashboard
   - Run: `SELECT * FROM publication WHERE name = 'supabase_realtime';`
   - Should return results

2. [ ] **Check Network Connection**
   - Open DevTools → Network tab
   - Look for WebSocket connection
   - Should show `wss://.../_realtime`
   - Status should be 101

3. [ ] **Check RLS Policies**
   - Verify RLS doesn't block realtime
   - Test with a simple query first

4. [ ] **Check Environment Variables**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is set
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

5. [ ] **Check Console Errors**
   - Look for "[Realtime]" errors
   - Check for WebSocket errors

### If too many refreshes:

1. [ ] Increase debounce delay in components
2. [ ] Change `setTimeout` from 1000ms to 2000-3000ms
3. [ ] Filter subscriptions to reduce events

## ✨ Step 7: Production Deployment

Before deploying to production:

- [ ] Test all auto-update scenarios in staging
- [ ] Verify Supabase realtime is enabled in production database
- [ ] Monitor error logs for realtime issues
- [ ] Set up alerts for WebSocket connection failures
- [ ] Document the realtime setup for your team

## 📝 Step 8: Team Documentation

- [ ] Share `REALTIME_AUTO_UPDATE.md` with team
- [ ] Share `AUTO_UPDATE_QUICK_REFERENCE.md` with team
- [ ] Share this checklist with team
- [ ] Document any custom configurations
- [ ] Create runbooks for troubleshooting

## ✅ Completion Checklist

### Implementation:
- [ ] All 7 new files created
- [ ] All 6 files modified correctly
- [ ] No TypeScript errors
- [ ] No build errors

### Configuration:
- [ ] Realtime enabled in Supabase
- [ ] All tables have realtime enabled
- [ ] Environment variables correct
- [ ] Application starts without errors

### Testing:
- [ ] Attendance auto-updates working
- [ ] Leave requests auto-update working
- [ ] Meetings auto-update working
- [ ] Export indicators showing
- [ ] Console shows realtime messages

### Deployment:
- [ ] Production database configured
- [ ] Realtime enabled in production
- [ ] Tested in staging environment
- [ ] Ready for production deployment

## 🎯 Sign-Off

**Implementation Complete**: [ ] Yes / [ ] No

**Tested & Verified**: [ ] Yes / [ ] No

**Ready for Production**: [ ] Yes / [ ] No

**Date Completed**: _________________

**Completed By**: _________________

**Notes**:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

## 📞 Support Reference

If you encounter issues:

1. Check `REALTIME_AUTO_UPDATE.md` - Troubleshooting section
2. Check `AUTO_UPDATE_QUICK_REFERENCE.md` - Quick troubleshooting table
3. Look for `[Realtime]` messages in console
4. Verify Supabase realtime is enabled
5. Check WebSocket connection status in DevTools

## 🚀 Next Steps

1. [ ] Run through this checklist
2. [ ] Test all scenarios
3. [ ] Fix any issues found
4. [ ] Deploy to production
5. [ ] Monitor realtime functionality
6. [ ] Train team on new system

---

**Document Version**: 1.0
**Created**: March 22, 2026
**Status**: Ready for Implementation
