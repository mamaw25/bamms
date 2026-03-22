# Offline Mode Implementation Checklist

## Quick Start

Complete these steps to fully enable offline mode in your application:

### Phase 1: Core Setup ✓ (COMPLETED)

- [x] Create IndexedDB manager (`lib/offline/db.ts`)
- [x] Create sync manager (`lib/offline/sync.ts`)
- [x] Create React hooks (`lib/offline/hooks.ts`)
- [x] Create service worker (`public/sw.js`)
- [x] Create API endpoint (`app/api/offline/sync/route.ts`)
- [x] Create UI components (`app/components/OfflineUI.tsx`)
- [x] Create offline initializer (`app/components/OfflineInitializer.tsx`)
- [x] Update root layout (`app/layout.tsx`)
- [x] Create PWA manifest (`public/manifest.json`)
- [x] Create offline fallback page (`public/offline.html`)
- [x] Create documentation (`OFFLINE_MODE.md`)

### Phase 2: Component Integration (NEXT)

Update your existing components to use offline support:

#### Dashboard Components

- [ ] **Attendance Form** (`app/dashboard/page.tsx`)
  - [ ] Wrap form submission with `useOfflineOperation()`
  - [ ] Add offline status indicator
  - [ ] Show sync progress

- [ ] **Kiosk Page** (`app/kiosk/page.tsx`)
  - [ ] Queue attendance records when offline
  - [ ] Cache recent attendance data
  - [ ] Show offline indicator

- [ ] **Leave Requests** (`app/dashboard/components/LeaveRequestForm.tsx`)
  - [ ] Queue leave requests when offline
  - [ ] Cache existing requests
  - [ ] Display offline warning

#### Admin Components

- [ ] **Staff Management** (`app/dashboard/admin/staff/page.tsx`)
  - [ ] Cache staff list
  - [ ] Queue staff operations
  - [ ] Show sync status

- [ ] **Meetings** (`app/dashboard/admin/meetings/page.tsx`)
  - [ ] Cache meetings data
  - [ ] Queue meeting changes
  - [ ] Display offline mode

- [ ] **Meeting Minutes** (`app/dashboard/admin/meetings/MeetingMinutesForm.tsx`)
  - [ ] Queue minutes when offline
  - [ ] Cache meeting data

#### Data Fetching

- [ ] **Update all data fetches** to use `useOfflineData()` hook
  - [ ] `fetchAttendance()`
  - [ ] `fetchLeaveRequests()`
  - [ ] `fetchMeetings()`
  - [ ] `fetchStaffList()`

### Phase 3: Testing & Validation

- [ ] **Service Worker Testing**
  - [ ] Verify service worker registers in DevTools
  - [ ] Check service worker status page
  - [ ] Test offline detection

- [ ] **Offline Sync Testing**
  - [ ] Enable offline mode (DevTools)
  - [ ] Make changes to attendance/leave/meetings
  - [ ] Verify operations queue in IndexedDB
  - [ ] Disable offline mode
  - [ ] Verify automatic sync
  - [ ] Check data appears in database

- [ ] **UI Component Testing**
  - [ ] OfflineStatusIndicator shows correctly
  - [ ] SyncProgressPanel displays progress
  - [ ] OfflineNotification appears when offline
  - [ ] Sync progress updates in real-time

- [ ] **Cache Testing**
  - [ ] Data is cached when fetched online
  - [ ] Cached data is used when offline
  - [ ] Expired cache is cleared
  - [ ] Cache size is reasonable

- [ ] **Browser Compatibility**
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari (iOS 14+)
  - [ ] Mobile Chrome/Firefox

### Phase 4: Production Deployment

- [ ] **Security Review**
  - [ ] Verify authentication tokens are validated during sync
  - [ ] Check sensitive data handling
  - [ ] Review error messages for info leaks
  - [ ] Validate all API inputs

- [ ] **Performance Review**
  - [ ] Monitor IndexedDB size
  - [ ] Check cache hit rates
  - [ ] Profile sync performance
  - [ ] Optimize slow operations

- [ ] **Monitoring Setup**
  - [ ] Log service worker registration
  - [ ] Track sync success/failure rates
  - [ ] Monitor offline usage patterns
  - [ ] Alert on sync errors

- [ ] **Documentation**
  - [ ] Update README with offline features
  - [ ] Add offline troubleshooting guide
  - [ ] Document configuration options
  - [ ] Create user guide for offline mode

### Phase 5: Optional Enhancements

- [ ] **Conflict Resolution**
  - [ ] Handle concurrent updates
  - [ ] Implement merge strategy
  - [ ] Show conflict UI

- [ ] **Data Encryption**
  - [ ] Encrypt sensitive data before caching
  - [ ] Implement encryption keys
  - [ ] Add decryption on retrieval

- [ ] **Advanced Sync**
  - [ ] Implement selective sync
  - [ ] Add bandwidth awareness
  - [ ] Schedule background sync
  - [ ] Add progress notifications

- [ ] **Analytics**
  - [ ] Track offline usage
  - [ ] Monitor sync metrics
  - [ ] Analyze user behavior offline
  - [ ] Generate offline reports

## Integration Examples

### Example 1: Update Attendance Kiosk

```typescript
// app/kiosk/page.tsx
'use client';

import { useOfflineOperation, useSyncProgress } from '@/lib/offline/hooks';
import { OfflineStatusIndicator } from '@/app/components/OfflineUI';

export default function KioskPage() {
  const { queueOperation, isOnline } = useOfflineOperation();
  const progress = useSyncProgress();

  const handleAttendance = async (staffId: string) => {
    const result = await queueOperation('attendance', 'insert', {
      id: generateId(),
      profile_id: staffId,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date().toISOString(),
      status: 'present'
    });

    if (result.offline) {
      showNotification('Recorded locally, will sync when online');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4">
        <h1>Kiosk</h1>
        <OfflineStatusIndicator />
      </div>

      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p>Offline Mode: {progress.total - progress.synced} pending changes</p>
        </div>
      )}

      <button onClick={() => handleAttendance(staffId)}>
        Record Attendance
      </button>
    </div>
  );
}
```

### Example 2: Update Leave Requests Form

```typescript
// app/dashboard/components/LeaveRequestForm.tsx
'use client';

import { useOfflineOperation } from '@/lib/offline/hooks';

export default function LeaveRequestForm({ staffId }) {
  const { queueOperation, isOnline } = useOfflineOperation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await queueOperation('leave_requests', 'insert', {
      id: generateId(),
      staff_id: staffId,
      request_type: formData.type,
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      status: 'pending'
    });

    if (result.offline) {
      showAlert('Request saved locally. Will be submitted when online.');
    } else {
      showAlert('Request submitted successfully.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isOnline && <p className="text-orange-600">⚠️ You are offline</p>}
      {/* form fields */}
      <button type="submit">Submit Request</button>
    </form>
  );
}
```

### Example 3: Add Offline Status to Header

```typescript
// app/dashboard/layout.tsx
'use client';

import { OfflineStatusIndicator, SyncProgressPanel } from '@/app/components/OfflineUI';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header className="flex justify-between items-center p-4 border-b">
        <h1>Dashboard</h1>
        <OfflineStatusIndicator />
      </header>

      <div className="p-4">
        <SyncProgressPanel />
      </div>

      {children}
    </div>
  );
}
```

## Configuration Steps

### 1. Enable Service Worker in Production

Make sure your hosting platform serves `public/sw.js` correctly:
- Vercel: ✓ Automatic
- Netlify: ✓ Automatic
- Custom server: Ensure `/sw.js` is publicly accessible

### 2. Update Environment Variables

No additional environment variables needed. Offline mode works with existing setup.

### 3. Configure Cache Duration

Edit `lib/offline/db.ts`:
```typescript
// Change cache expiration (default 24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;
```

### 4. Add More Sync Tables

Edit `app/api/offline/sync/route.ts`:
```typescript
case 'your_table':
  result = await syncYourTable(supabase, action, data);
  break;
```

## Verification Checklist

- [ ] Service worker successfully registered
- [ ] IndexedDB available in DevTools
- [ ] Offline page loads without network
- [ ] Offline operations queue in database
- [ ] Auto-sync triggers when coming online
- [ ] Sync progress shows in UI
- [ ] No console errors in offline mode
- [ ] Data persists during offline usage
- [ ] Authentication still required for sync
- [ ] Expired cache is cleaned up

## Common Issues & Solutions

### Issue: Service Worker Not Registering
**Solution:**
```
1. Check browser console for errors
2. Ensure public/sw.js exists
3. Test with: navigator.serviceWorker.getRegistrations()
4. Try: Clear cache → Restart → Hard refresh (Ctrl+Shift+R)
```

### Issue: Offline Data Not Syncing
**Solution:**
```
1. Check DevTools → Application → Service Workers (should be active)
2. Check DevTools → Application → IndexedDB (offline-queue should have items)
3. Check network tab when coming online
4. Verify /api/offline/sync endpoint returns 200
5. Check server logs for errors
```

### Issue: Cache Growing Too Large
**Solution:**
```
1. Verify cache auto-expiration is working
2. Call: await offlineDB.clearExpiredCache()
3. Reduce CACHE_DURATION
4. Implement selective caching
```

## Support

For issues or questions:
1. Check [OFFLINE_MODE.md](OFFLINE_MODE.md) for detailed documentation
2. Review browser DevTools → Console for errors
3. Check browser DevTools → Application → Service Workers status
4. Enable verbose logging in `lib/offline/` files
5. Check `app/api/offline/sync/route.ts` server logs

## Success Indicators

✓ Application loads offline
✓ Can record data while offline
✓ Changes sync automatically when online
✓ No data loss during offline usage
✓ User sees clear offline/sync status
✓ Works on mobile devices
✓ No console errors
✓ Cache is managed efficiently
