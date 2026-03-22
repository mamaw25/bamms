# Offline Mode Quick Reference

## What's New?

Your Barangay Attendance System now works **offline without losing any data**. All changes made offline are automatically synced to the database when connectivity is restored.

## Key Files Created

### Core Offline System
| File | Purpose |
|------|---------|
| `lib/offline/db.ts` | IndexedDB storage & caching |
| `lib/offline/sync.ts` | Sync queue management |
| `lib/offline/hooks.ts` | React hooks for offline features |
| `app/api/offline/sync/route.ts` | Backend sync endpoint |
| `app/components/OfflineUI.tsx` | UI components for offline status |
| `app/components/OfflineInitializer.tsx` | Initialize offline support |
| `public/sw.js` | Service Worker |
| `public/manifest.json` | PWA manifest |
| `public/offline.html` | Offline fallback page |

### Documentation
| File | Purpose |
|------|---------|
| `OFFLINE_MODE.md` | Complete implementation guide |
| `OFFLINE_SETUP.md` | Integration checklist & examples |

## How It Works

```
OFFLINE                          ONLINE
────────────────────────────────────────
User makes change
       ↓
Check internet
       ├─ Has internet → Save to server immediately
       └─ No internet → Save to local database
                             ↓
                        Auto-sync when online
                             ↓
                        Update all changes
```

## Using Offline Features

### 1. Check if Online

```typescript
import { useOnlineStatus } from '@/lib/offline/hooks';

const isOnline = useOnlineStatus();
```

### 2. Queue Operations Offline

```typescript
import { useOfflineOperation } from '@/lib/offline/hooks';

const { queueOperation } = useOfflineOperation();

await queueOperation('attendance', 'insert', {
  id: '123',
  staff_id: 'abc',
  status: 'present'
});
```

### 3. Show Offline Status

```typescript
import { OfflineStatusIndicator } from '@/app/components/OfflineUI';

<OfflineStatusIndicator />
```

### 4. Display Sync Progress

```typescript
import { SyncProgressPanel } from '@/app/components/OfflineUI';

<SyncProgressPanel />
```

### 5. Fetch with Offline Support

```typescript
import { useOfflineData } from '@/lib/offline/hooks';

const { data, loading, error } = useOfflineData('attendance', async () => {
  const res = await fetch('/api/attendance');
  return res.json();
});
```

## Testing Offline Mode

### Using Chrome DevTools

1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Click **Service Workers**
4. Check the **Offline** checkbox
5. Refresh the page
6. Test offline functionality

### Simulate Going Online/Offline

1. **Network Tab** → Select "Offline" from dropdown
2. **Command + Shift + P** (Mac) / **Ctrl + Shift + P** (Windows)
3. Type "Offline" and toggle

## What Gets Cached?

| Item | Duration | Purpose |
|------|----------|---------|
| Static assets | Indefinite | App shell |
| API responses | 24 hours | Data caching |
| CSS/JS | Indefinite | Styling & logic |
| Images | Until updated | UI elements |

## What Syncs When Online?

All operations performed offline:
- ✓ Attendance records
- ✓ Leave requests
- ✓ Meetings
- ✓ Meeting minutes
- ✓ All other database changes

## User Experience

### Offline Indicator
Shows at top-right of screen when offline:
```
🔌 Offline | 3 pending
```

### Sync Panel
Shows detailed progress:
```
📡 Offline Mode
━━━━━━━━━━━━━━━ 65%
✓ 2 synced | ⚠ 1 failed | ⏳ 1 pending
```

### Notification
Bottom-left notification when offline:
```
📡 You are offline
Your changes will be saved locally 
and synced when you go back online.
```

## Important Notes

1. **Data is Safe**: All offline changes are stored locally and never lost
2. **Automatic Sync**: Syncing happens automatically when connection returns
3. **No Manual Action**: Users don't need to do anything special
4. **Real-time Status**: UI shows what's happening and syncing progress
5. **Authentication Required**: Users must still be logged in to sync

## Troubleshooting

### Service Worker Not Working?
```
DevTools → Application → Service Workers
→ Should show status: "activated and running"
```

### Data Not Showing Offline?
```
DevTools → Application → IndexedDB
→ Check "offline-queue" and "cache" stores
```

### Sync Not Happening?
```
1. Check online status: navigator.onLine
2. Check service worker is active
3. Check /api/offline/sync endpoint logs
4. Verify authentication token
```

## Browser Support

✓ Chrome 40+
✓ Firefox 44+
✓ Edge 17+
✓ Safari 11+ (iOS 14+)
✓ Most mobile browsers

## Next Steps

### For Integration:
1. Review `OFFLINE_SETUP.md` for component integration
2. Update your dashboard components
3. Add offline indicators where needed
4. Test in offline mode

### For Customization:
1. Edit cache duration in `lib/offline/db.ts`
2. Add more tables in `app/api/offline/sync/route.ts`
3. Customize UI in `app/components/OfflineUI.tsx`
4. Configure in `app/components/OfflineInitializer.tsx`

## Performance Tips

1. Cache only essential data
2. Regularly clear expired cache
3. Batch sync operations
4. Optimize database queries
5. Monitor IndexedDB size

## Security Reminder

- Offline data stored in browser's IndexedDB
- Users can view it in DevTools
- Don't store highly sensitive data
- Always validate on server during sync
- Verify authentication tokens

## Questions?

- Read: `OFFLINE_MODE.md` (complete guide)
- Review: `OFFLINE_SETUP.md` (integration checklist)
- Check: Browser DevTools → Application tab
- Test: Enable offline mode and try features

## Advanced Usage

### Manual Sync Trigger
```typescript
import { useSyncOfflineQueue } from '@/lib/offline/hooks';

const { sync } = useSyncOfflineQueue();
await sync();
```

### Access Sync Manager Directly
```typescript
import { syncManager } from '@/lib/offline/sync';

const progress = await syncManager.getSyncProgress();
console.log(`${progress.synced} / ${progress.total} synced`);
```

### Database Directly
```typescript
import { offlineDB } from '@/lib/offline/db';

await offlineDB.init();
const unsynced = await offlineDB.getUnsynced();
```

---

**Offline Mode is Ready to Use!**

Your system now gracefully handles internet outages while maintaining data integrity and user experience.
