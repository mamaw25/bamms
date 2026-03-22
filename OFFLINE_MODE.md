# Offline Mode Implementation Guide

## Overview

The Barangay Attendance System now includes complete offline support, allowing the application to function seamlessly without an internet connection. All changes made offline are automatically synced to the database when connectivity is restored.

## Features

### 1. **Offline Data Storage**
- **IndexedDB**: Local database for storing data offline
- **Smart Caching**: Automatic caching of fetched data with 24-hour expiration
- **Sync Queue**: Tracks all offline changes for syncing when online

### 2. **Service Worker**
- **Asset Caching**: Caches static assets for offline access
- **API Caching**: Intelligently caches API responses
- **Network Fallback**: Returns cached data when network is unavailable
- **Background Sync**: Triggers syncing when device comes back online

### 3. **Automatic Sync**
- **Offline Queue Management**: Queues all changes when offline
- **Automatic Sync on Online**: Syncs all queued changes when connection is restored
- **Progress Tracking**: Real-time sync progress visibility
- **Error Handling**: Graceful handling of sync errors

### 4. **User Experience**
- **Status Indicators**: Shows online/offline status in UI
- **Sync Progress**: Displays number of pending and synced items
- **Offline Notifications**: Alerts users they are offline
- **Cached Data Warnings**: Indicates when viewing cached data

## Architecture

### File Structure

```
lib/offline/
├── db.ts           # IndexedDB manager
├── sync.ts         # Sync manager
└── hooks.ts        # React hooks for offline support

app/
├── api/
│   └── offline/
│       └── sync/
│           └── route.ts   # Sync endpoint
├── components/
│   ├── OfflineInitializer.tsx   # Initializes offline support
│   └── OfflineUI.tsx             # UI components
└── layout.tsx      # Updated with offline support

public/
├── sw.js          # Service worker
├── manifest.json  # PWA manifest
└── offline.html   # Fallback offline page
```

### Data Flow

```
User Action (Offline)
    ↓
Check Online Status
    ↓
If Online → Direct API Call
If Offline → Queue Operation
    ↓
Store in IndexedDB
    ↓
Display Progress
    ↓
When Online → Sync from Queue
    ↓
Send to Server
    ↓
Update Cache & Remove from Queue
```

## Components & APIs

### 1. **offlineDB** (lib/offline/db.ts)

Main database manager for offline storage.

**Key Methods:**
```typescript
await offlineDB.init()                    // Initialize database
await offlineDB.addToQueue(table, action, data)     // Queue operation
await offlineDB.getUnsynced()            // Get pending operations
await offlineDB.markAsSynced(ids)        // Mark as synced
await offlineDB.cacheRecord(table, id, data)       // Cache single record
await offlineDB.cacheRecords(table, records)       // Cache multiple records
await offlineDB.getFromCache(table, id)           // Retrieve cached record
await offlineDB.getCacheByTable(table)            // Get all cached records
```

### 2. **syncManager** (lib/offline/sync.ts)

Manages syncing of queued operations.

**Key Methods:**
```typescript
await syncManager.queueOperation(table, action, data)    // Queue operation
await syncManager.syncOfflineQueue()                      // Sync all pending
await syncManager.getSyncProgress()                       // Get sync stats
await syncManager.cacheData(table, id, data)             // Cache data
await syncManager.getCachedData(table, id)               // Retrieve cache
syncManager.addProgressListener(callback)                 // Listen to sync progress
```

### 3. **React Hooks** (lib/offline/hooks.ts)

Custom hooks for offline functionality in components.

```typescript
// Detect online/offline status
const isOnline = useOnlineStatus()

// Track sync progress
const progress = useSyncProgress()

// Queue operations
const { queueOperation, isOnline } = useOfflineOperation()

// Fetch with offline fallback
const { data, loading, error, refetch } = useOfflineData(table, fetchFn)

// Manual sync trigger
const { sync, syncing, error } = useSyncOfflineQueue()
```

### 4. **UI Components** (app/components/OfflineUI.tsx)

Ready-to-use components for displaying offline status.

```typescript
// Show online/offline status with sync info
<OfflineStatusIndicator />

// Detailed sync progress panel
<SyncProgressPanel />

// Bottom notification when offline
<OfflineNotification />

// Loading state with offline indicator
<OfflineSkeleton isLoading={loading} isOffline={!isOnline}>
  {content}
</OfflineSkeleton>
```

## Usage Examples

### 1. **Submitting Data Offline**

```typescript
'use client';

import { useOfflineOperation } from '@/lib/offline/hooks';

export default function AttendanceForm() {
  const { queueOperation, isOnline } = useOfflineOperation();

  const handleSubmit = async (formData) => {
    const result = await queueOperation('attendance', 'insert', {
      id: generateId(),
      staff_id: formData.staffId,
      date: formData.date,
      status: formData.status,
    });

    if (result.offline) {
      console.log('Queued for sync when online');
    } else {
      console.log('Submitted successfully');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isOnline && <p>Your changes will be synced when online</p>}
      {/* form fields */}
    </form>
  );
}
```

### 2. **Displaying Data with Offline Support**

```typescript
'use client';

import { useOfflineData } from '@/lib/offline/hooks';
import { OfflineSkeleton } from '@/app/components/OfflineUI';

async function fetchAttendance() {
  const res = await fetch('/api/attendance');
  return res.json();
}

export default function AttendanceList() {
  const { data, loading, error } = useOfflineData('attendance', fetchAttendance);
  const isOnline = useOnlineStatus();

  return (
    <OfflineSkeleton isLoading={loading} isOffline={!isOnline}>
      {data?.map(record => (
        <AttendanceRow key={record.id} data={record} />
      ))}
    </OfflineSkeleton>
  );
}
```

### 3. **Showing Sync Status**

```typescript
'use client';

import { OfflineStatusIndicator, SyncProgressPanel } from '@/app/components/OfflineUI';

export default function Header() {
  return (
    <header className="flex justify-between items-center">
      <h1>Barangay Portal</h1>
      <div className="flex items-center gap-4">
        <OfflineStatusIndicator />
      </div>
    </header>
  );
}

export default function Dashboard() {
  return (
    <div>
      <SyncProgressPanel />
      {/* Rest of dashboard */}
    </div>
  );
}
```

## API Endpoint

### POST /api/offline/sync

Syncs queued offline operations with the database.

**Request:**
```json
{
  "table": "attendance",
  "action": "insert",
  "data": {
    "id": "uuid",
    "staff_id": "uuid",
    "date": "2024-03-22",
    "status": "present"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": { /* synced record */ }
}
```

**Response (Error):**
```json
{
  "error": "Database error message"
}
```

## Service Worker Behavior

### Caching Strategy

1. **Static Assets** (`/`, CSS, JS)
   - Cache-first: Uses cached version, updates in background
   - Fallback: `/offline.html`

2. **API Requests** (`/api/*`)
   - Network-first: Tries network, falls back to cache
   - Response: JSON with `offline: true` flag if no cache

3. **Images**
   - Stale-while-revalidate: Uses cache, updates in background

### Background Sync

- Triggered automatically when device comes online
- Syncs all pending operations from IndexedDB
- Updates UI with sync progress

## Offline Sync Flow

```
1. User makes changes while offline
   └─> Operation queued to IndexedDB
   └─> Stored with action (insert/update/delete)
   └─> Marked as not synced

2. User comes back online
   └─> Service worker detects online event
   └─> Triggers sync handler
   └─> Syncs all pending operations

3. Sync Process
   └─> Fetch pending operations from IndexedDB
   └─> Group by table
   └─> Send to /api/offline/sync endpoint
   └─> Handle responses
   └─> Mark as synced or log errors

4. After Sync
   └─> Remove synced items from queue
   └─> Update UI progress
   └─> Refresh cache
   └─> Notify user
```

## Configuration

### Cache Duration

Edit in `lib/offline/db.ts`:
```typescript
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

### Service Worker Update Interval

Edit in `app/components/OfflineInitializer.tsx`:
```typescript
setInterval(() => {
  registration.update();
}, 60000); // Check every minute
```

### Tables Supported for Offline Sync

Edit in `app/api/offline/sync/route.ts`:
- `attendance`
- `leave_requests`
- `meetings`
- `meeting_attendees`
- `meeting_minutes`

Add more tables as needed by extending the switch statement.

## Troubleshooting

### Service Worker Not Registering

1. Check browser console for errors
2. Ensure `public/sw.js` exists and is valid
3. Verify HTTPS (or localhost)
4. Clear browser cache and reload

### Offline Data Not Syncing

1. Check network connection
2. View browser DevTools → Application → IndexedDB
3. Check `/api/offline/sync` endpoint logs
4. Verify authentication token is still valid

### Cache Growing Too Large

1. IndexedDB has auto-expiration (24 hours)
2. Manual cleanup: `await offlineDB.clearExpiredCache()`
3. Monitor in DevTools → Application → Storage

## Best Practices

### 1. **Always Check Online Status**
```typescript
const isOnline = useOnlineStatus();
if (!isOnline) {
  // Show offline warning
}
```

### 2. **Cache Critical Data**
```typescript
// After fetching data
await syncManager.cacheDataBatch('attendance', records);
```

### 3. **Handle Sync Errors**
```typescript
const { sync, syncing, error } = useSyncOfflineQueue();
if (error) {
  console.error('Sync failed:', error);
  // Show retry option
}
```

### 4. **Show User Feedback**
```typescript
<SyncProgressPanel />
<OfflineStatusIndicator />
```

### 5. **Test Offline Functionality**
- DevTools → Network → Offline
- Disable/enable airplane mode
- Unplug network cable

## Security Considerations

1. **Authentication**: Verify user is still authenticated during sync
2. **Data Validation**: Validate all offline data before syncing
3. **Encryption**: Consider encrypting sensitive data before storing locally
4. **RLS Policies**: Ensure Row Level Security prevents unauthorized access
5. **Token Refresh**: Handle expired tokens during sync

## Performance Tips

1. **Batch Operations**: Group similar operations
2. **Selective Caching**: Only cache essential data
3. **Compression**: Consider compressing large datasets
4. **Pagination**: Paginate data for better performance
5. **Indexing**: Use IndexedDB indexes for faster queries

## Browser Support

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Partial (iOS 14+)
- Mobile browsers: ✓ Most modern browsers

## Testing Offline Mode

### Using Chrome DevTools

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. Check "Offline" checkbox
5. Refresh page to test

### Using Network Tab

1. Open DevTools
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Make requests to see offline behavior

## Future Enhancements

- [ ] Encryption for sensitive offline data
- [ ] Conflict resolution for concurrent updates
- [ ] Selective sync (choose what to sync)
- [ ] Compression for large datasets
- [ ] Push notifications for sync events
- [ ] Bandwidth-aware sync
- [ ] Scheduled sync (background task)

## Support & Documentation

- [MDN - Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN - IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Next.js Offline Support](https://nextjs.org/docs)
