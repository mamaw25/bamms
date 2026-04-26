# Offline Mode - Deployment & Integration Guide

## Pre-Deployment Checklist

### 1. Verify All Files Are Created ✓

```bash
# Core offline system
✓ lib/offline/db.ts
✓ lib/offline/sync.ts
✓ lib/offline/hooks.ts
✓ app/api/offline/sync/route.ts
✓ app/components/OfflineUI.tsx
✓ app/components/OfflineInitializer.tsx

# Service Worker & PWA
✓ public/sw.js
✓ public/manifest.json
✓ public/offline.html

# App configuration
✓ app/layout.tsx (updated with offline support)

# Documentation
✓ OFFLINE_MODE.md
✓ OFFLINE_SETUP.md
✓ OFFLINE_QUICK_START.md
✓ OFFLINE_IMPLEMENTATION_SUMMARY.md
```

### 2. Environment Setup

No additional environment variables needed. The offline system works with your existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Build Verification

```bash
# Test build locally
npm run build

# Expected: No errors related to service worker or offline components
# Service Worker compilation should pass
```

## Local Testing

### Step 1: Run Development Server

```bash
npm run dev
# Application should start at http://localhost:3000
```

### Step 2: Register Service Worker

Open DevTools and check:
1. **Application** tab
2. **Service Workers**
3. Should see: "http://localhost:3000/sw.js" with status "activated and running"

If not registered:
- Check browser console for errors
- Verify `public/sw.js` exists
- Clear cache and reload

### Step 3: Test Offline Functionality

```javascript
// In browser console:

// 1. Check online status
console.log(navigator.onLine); // Should be true

// 2. Initialize offline DB
import { offlineDB } from '@/lib/offline/db';
await offlineDB.init();

// 3. Get service worker registrations
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log(`${regs.length} service worker(s) registered`);
});
```

### Step 4: Simulate Offline

1. **DevTools → Network tab**
2. Select **"Offline"** from throttling dropdown
3. Refresh page
4. Try features:
   - Record attendance
   - Submit leave request
   - Create meeting

### Step 5: Verify Offline Queue

1. **DevTools → Application tab**
2. Expand **IndexedDB**
3. Select **"attendance-system-offline"**
4. Check **"offline-queue"** store
5. Should see your offline operations

### Step 6: Test Auto-Sync

1. **DevTools → Network tab**
2. Select **"Online"** from throttling dropdown
3. Refresh page
4. Monitor:
   - Service Worker status
   - IndexedDB (offline-queue should empty)
   - Network tab (sync requests to `/api/offline/sync`)

## Integration with Existing Components

### Example 1: Update Kiosk Attendance

**File:** `app/kiosk/page.tsx`

```typescript
'use client';

import { useOfflineOperation } from '@/lib/offline/hooks';
import { OfflineStatusIndicator } from '@/app/components/OfflineUI';
import { handleKioskAction } from './action';

export default function KioskLandingPage() {
  const { isOnline } = useOfflineOperation();
  const [status, setStatus] = useState(null);

  const processAction = async (idNumber: string) => {
    try {
      // Use existing action which will queue if offline
      const res = await handleKioskAction(idNumber);
      setStatus({
        msg: isOnline ? 'Recorded' : 'Saved offline - will sync',
        type: res.success ? 'success' : 'error'
      });
    } catch (error) {
      setStatus({ msg: error.message, type: 'error' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4">
        <h1>Attendance Kiosk</h1>
        <OfflineStatusIndicator />
      </div>
      {/* Rest of component */}
    </div>
  );
}
```

### Example 2: Update Leave Request Form

**File:** `app/dashboard/components/LeaveRequestForm.tsx`

```typescript
'use client';

import { useOfflineOperation, useOnlineStatus } from '@/lib/offline/hooks';
import { submitLeaveRequest } from '@/app/dashboard/staff/leaveActions';

export default function LeaveRequestForm({ staffId }) {
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      formData.set('staffId', staffId);

      const result = await submitLeaveRequest(formData);

      if (result.success) {
        alert(isOnline ? 'Request submitted' : 'Saved locally - will sync when online');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isOnline && (
        <div className="bg-yellow-50 p-3 rounded mb-4 text-sm">
          ⚠️ You are offline. Your request will be saved and submitted when online.
        </div>
      )}
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
```

### Example 3: Update Dashboard Layout

**File:** `app/dashboard/layout.tsx`

```typescript
'use client';

import { OfflineStatusIndicator, SyncProgressPanel } from '@/app/components/OfflineUI';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header className="flex justify-between items-center p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <OfflineStatusIndicator />
      </header>

      <main className="p-4">
        <SyncProgressPanel />
        {children}
      </main>
    </div>
  );
}
```

## Production Deployment

### Vercel Deployment

1. **Push code to GitHub/GitLab**

```bash
git add .
git commit -m "Add offline mode support"
git push origin main
```

2. **Service Worker Setup**
   - Vercel automatically serves `public/sw.js`
   - No additional configuration needed
   - Works with auto-scaling

3. **Verify Deployment**
   ```bash
   curl https://your-domain.vercel.app/sw.js
   # Should return the service worker code
   ```

### Netlify Deployment

1. **Deploy with Netlify**
   - Service Worker: Automatically served from `/sw.js`
   - Manifest: Served from `/manifest.json`
   - No changes needed

2. **Check `netlify.toml`**
   ```toml
   # Ensure service worker is not cached
   [[headers]]
   for = "/sw.js"
   [headers.values]
     Cache-Control = "max-age=0, must-revalidate"
   ```

### Self-Hosted Deployment

1. **Nginx Configuration**
   ```nginx
   location /sw.js {
       alias /path/to/public/sw.js;
       add_header Cache-Control "max-age=0, must-revalidate";
       types { application/javascript js; }
   }

   location /manifest.json {
       alias /path/to/public/manifest.json;
       add_header Content-Type "application/manifest+json";
   }
   ```

2. **Apache Configuration**
   ```apache
   <FilesMatch "sw\.js$">
       Header set Cache-Control "max-age=0, must-revalidate"
       Header set Content-Type "application/javascript"
   </FilesMatch>
   ```

3. **HTTPS Required**
   - Service Workers require HTTPS in production
   - Localhost (HTTP) works for testing

## Post-Deployment Testing

### Test in Production

1. **Verify Service Worker**
   ```javascript
   // In production domain console
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log('Service Workers:', regs);
   });
   ```

2. **Test Offline Mode**
   - DevTools → Network → Offline
   - Perform operations
   - Verify they queue in IndexedDB

3. **Test Auto-Sync**
   - Go offline and make changes
   - Go online (or disable offline mode)
   - Monitor network tab
   - Verify `/api/offline/sync` requests
   - Check Supabase dashboard for synced data

4. **Monitor Errors**
   - Check CloudWatch/Sentry logs
   - Look for service worker errors
   - Monitor `/api/offline/sync` endpoint

### Performance Monitoring

```javascript
// Add to your monitoring tool
import { syncManager } from '@/lib/offline/sync';

// Track sync performance
syncManager.addProgressListener(async (progress) => {
  console.log('Sync progress:', progress);
  
  // Send to analytics
  analytics.track('sync_progress', {
    total: progress.total,
    synced: progress.synced,
    failed: progress.failed,
    inProgress: progress.inProgress
  });
});
```

## Monitoring & Maintenance

### Monitor These Metrics

1. **Service Worker Registration**
   - Should be 100% success rate
   - Log failures to error tracking

2. **Offline Operations**
   - Track number of queued operations
   - Monitor queue growth
   - Alert if queue > threshold

3. **Sync Success Rate**
   - Target: >99% success
   - Track failures and reasons
   - Alert on high failure rate

4. **Cache Performance**
   - Monitor cache hit rate
   - Track cache size growth
   - Alert if size > threshold

### Database Monitoring

```sql
-- Monitor offline queue (in Supabase)
-- Check that all operations are eventually synced
-- Alert if unsynced operations > threshold

SELECT COUNT(*) as pending_operations
FROM offline_queue
WHERE synced = false
AND created_at < NOW() - INTERVAL '1 hour';
```

### Alerting Setup

Configure alerts for:
- Service Worker registration failures
- High rate of sync failures
- Offline operations not syncing
- IndexedDB quota exceeded
- API endpoint errors

## Rollback Plan

If offline mode causes issues:

1. **Disable Service Worker**
   - Rename `public/sw.js` to `public/sw.js.bak`
   - Existing service workers will be unregistered automatically
   - Users' offline data remains in IndexedDB

2. **Disable in Layout**
   - Comment out `<OfflineInitializer />` in `app/layout.tsx`
   - Comment out `<OfflineNotification />` in `app/layout.tsx`

3. **Fast Rollback Command**
   ```bash
   # Remove offline support
   git checkout main -- public/sw.js
   git checkout main -- app/layout.tsx
   git commit -m "Rollback: disable offline mode"
   git push
   ```

## Performance Tips

### Optimize Cache

```typescript
// In lib/offline/db.ts - reduce cache duration for large datasets
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours instead of 24

// Cache only essential tables
const CACHEABLE_TABLES = ['attendance', 'leave_requests'];
```

### Limit Queue Size

```typescript
// Add to sync manager
const MAX_QUEUE_SIZE = 1000;

async function addToQueue(...) {
  const count = await offlineDB.getUnsynced();
  if (count.length >= MAX_QUEUE_SIZE) {
    // Handle overflow
  }
}
```

### Monitor Storage

```javascript
// Check available storage
navigator.storage?.estimate().then(({ usage, quota }) => {
  console.log(`Using ${usage} of ${quota} bytes`);
  console.log(`${(usage / quota * 100).toFixed(1)}% storage used`);
});
```

## Maintenance Tasks

### Weekly
- [ ] Monitor sync error rates
- [ ] Check service worker registration stats
- [ ] Review offline operation volume

### Monthly
- [ ] Analyze cache hit rates
- [ ] Review database logs
- [ ] Update documentation if needed

### Quarterly
- [ ] Performance review
- [ ] Security audit
- [ ] Plan enhancements

## Support & Documentation Links

- **Implementation Guide**: [OFFLINE_MODE.md](OFFLINE_MODE.md)
- **Integration Checklist**: [OFFLINE_SETUP.md](OFFLINE_SETUP.md)
- **Quick Reference**: [OFFLINE_QUICK_START.md](OFFLINE_QUICK_START.md)
- **Summary**: [OFFLINE_IMPLEMENTATION_SUMMARY.md](OFFLINE_IMPLEMENTATION_SUMMARY.md)

## Troubleshooting Guide

### Service Worker Issues

| Problem | Solution |
|---------|----------|
| Not registering | Check console errors, verify /sw.js accessible |
| Not updating | Clear cache, hard refresh, check update interval |
| Errors in console | Check sw.js syntax, verify caching strategy |

### Offline Sync Issues

| Problem | Solution |
|---------|----------|
| Not queuing | Check useOfflineOperation usage |
| Not syncing | Verify /api/offline/sync endpoint |
| Sync failing | Check auth token, server logs |

### Performance Issues

| Problem | Solution |
|---------|----------|
| Slow sync | Check network, optimize payload |
| Large cache | Clear expired cache, reduce duration |
| High memory | Limit cache size, selective caching |

---

## Ready for Deployment!

Your offline system is production-ready. Complete the checklist above and deploy with confidence. All users will now be able to work offline seamlessly!

**Deployment Status:** ✅ Ready for Production

**Questions?** Review the documentation files or check browser DevTools → Application tab for detailed information about service workers and offline storage.
