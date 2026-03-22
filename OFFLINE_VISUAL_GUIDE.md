# Offline Mode - Visual Integration Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Client-Side)                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js React Components               │  │
│  │                                                      │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Dashboard / Forms / Admin Pages            │   │  │
│  │  │  └──────────────────────────────────────┐   │   │  │
│  │  │  Uses: useOfflineOperation, etc.        │   │   │  │
│  │  │                                         │   │   │  │
│  │  │  Shows: OfflineStatusIndicator,        │   │   │  │
│  │  │         SyncProgressPanel               │   │   │  │
│  │  └─────────────────────────────────────────┘   │   │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ▲                                   │
│                          │                                   │
│  ┌──────────────────────┴──────────────────────┐           │
│  │    React Hooks (lib/offline/hooks.ts)       │           │
│  │                                             │           │
│  │  ✓ useOnlineStatus                         │           │
│  │  ✓ useOfflineOperation                     │           │
│  │  ✓ useOfflineData                          │           │
│  │  ✓ useSyncProgress                         │           │
│  │  ✓ useSyncOfflineQueue                     │           │
│  └──────────────────────┬──────────────────────┘           │
│                          │                                   │
│  ┌──────────────────────┴──────────────────────┐           │
│  │   Sync Manager (lib/offline/sync.ts)        │           │
│  │                                             │           │
│  │  ✓ Queue Operations                        │           │
│  │  ✓ Track Progress                          │           │
│  │  ✓ Auto-sync on online                     │           │
│  │  ✓ Cache Management                        │           │
│  └──────────────────────┬──────────────────────┘           │
│                          │                                   │
│           ┌──────────────┼──────────────┐                   │
│           │              │              │                   │
│      ┌────▼────┐   ┌────▼────┐   ┌───▼────┐               │
│      │IndexedDB│   │Service  │   │LocalDB  │               │
│      │(offline-│   │Worker   │   │Metadata │               │
│      │ queue)  │   │(caching)│   │         │               │
│      └────┬────┘   └────┬────┘   └────┬────┘               │
│           │             │             │                     │
└───────────┼─────────────┼─────────────┼─────────────────────┘
            │             │             │
            │   (Service   │             │
            │   Worker     │             │
            │   Fetch      │             │
            │   Intercept) │             │
            │             │             │
┌───────────┼─────────────┼─────────────┼─────────────────────┐
│           │             │             │                     │
│  ┌────────▼──────────────────────────▼──────────┐          │
│  │         Network Layer (Online Check)         │          │
│  └────────┬───────────────────────────┬────────┘           │
│           │                           │                     │
│           │  (When ONLINE)            │                     │
│           │                           │                     │
│  ┌────────▼──────────────────────────────────┐             │
│  │     API Routes / Endpoints                │             │
│  │  /api/offline/sync (POST)                │             │
│  │  Sync queued operations to database      │             │
│  └────────┬───────────────────────────────┬─┘             │
│           │                               │                 │
│  ┌────────▼──────────────────────────────▼──┐             │
│  │      Supabase / Database                 │             │
│  │  (Actual data storage & validation)      │             │
│  └──────────────────────────────────────────┘             │
│                                                             │
│                    SERVER (Backend)                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Flow 1: Online Operation (Normal)
```
User Action
    ↓
[Check: isOnline?]
    │ YES
    ↓
[API Call to Supabase]
    ↓
[Data Updated Immediately]
    ↓
[Show Success]
    ↓
[Cache Updated]
```

### Flow 2: Offline Operation
```
User Action
    ↓
[Check: isOnline?]
    │ NO
    ↓
[Queue to IndexedDB]
    ↓
[Show: "Saved offline"]
    ↓
[Wait for Online]
    ↓
[User goes Online]
    ↓
[Auto-Sync Triggered]
    ↓
[POST /api/offline/sync]
    ↓
[Supabase Updated]
    ↓
[Remove from Queue]
    ↓
[Show Success]
```

### Flow 3: Data Fetching
```
[Fetch Request]
    ↓
[Online?]
    ├─ YES ─→ [Call API] ─→ [Update Cache] ─→ [Return Data]
    │
    └─ NO ──→ [Check Cache] ─→ [Still Valid?]
               ├─ YES ─→ [Return Cached Data] + [Show Cache Warning]
               │
               └─ NO ──→ [Show Error] + [Cache Expired]
```

## Component Integration Points

### Header/Navigation
```
┌─────────────────────────────────────────────┐
│  App Header / Navigation                     │
│                                              │
│  Logo              OfflineStatusIndicator   │
│  Navigation Links  (Shows: 🔌 Online)      │
│                    (Or: 📡 Offline, 3 pending)
└─────────────────────────────────────────────┘
```

### Forms/Input Areas
```
┌─────────────────────────────────────────────┐
│  Form Title                                  │
├─────────────────────────────────────────────┤
│                                              │
│  [!] You are offline                        │
│  Your changes will be saved and synced      │
│      when you go back online.               │
│                                              │
│  Input Fields...                            │
│                                              │
│  [Submit] Button                            │
└─────────────────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────────────┐
│  Dashboard / List View                      │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ 📡 Offline Mode                     │   │
│  │ ━━━━━━━━━━━━━━━━ 65%               │   │
│  │ ✓ 2 synced | ⚠ 1 failed | ⏳ 1 pending
│  └─────────────────────────────────────┘   │
│                                              │
│  [Item 1]                                   │
│  [Item 2]                                   │
│  [Item 3] (cached - ⓘ from cache)          │
│                                              │
└─────────────────────────────────────────────┘
```

## File Location Map

```
project-root/
│
├── lib/offline/                      ← Core offline system
│   ├── db.ts                         ← IndexedDB manager
│   ├── sync.ts                       ← Sync engine
│   └── hooks.ts                      ← React hooks
│
├── app/
│   ├── api/
│   │   └── offline/
│   │       └── sync/
│   │           └── route.ts          ← Sync endpoint
│   │
│   ├── components/
│   │   ├── OfflineUI.tsx             ← UI components
│   │   └── OfflineInitializer.tsx    ← Service worker registration
│   │
│   └── layout.tsx                    ← Updated with offline support
│
├── public/
│   ├── sw.js                         ← Service worker
│   ├── manifest.json                 ← PWA manifest
│   └── offline.html                  ← Offline fallback
│
└── docs/
    ├── OFFLINE_MODE.md               ← Complete guide
    ├── OFFLINE_SETUP.md              ← Integration checklist
    ├── OFFLINE_QUICK_START.md        ← Quick reference
    ├── OFFLINE_DEPLOYMENT_GUIDE.md   ← Deployment steps
    └── OFFLINE_IMPLEMENTATION_SUMMARY.md ← Overview
```

## State Management Overview

### Online Status State
```
navigator.onLine ─────┐
                      │
                 Window Event
                 Listeners
                      │
                      ▼
            useOnlineStatus() Hook
                      │
         ┌────────────┴────────────┐
         │                         │
    [Online]                  [Offline]
    ✓ Use API                  ✓ Queue ops
    ✓ Cache data               ✓ Show UI
    ✓ Show status              ✓ Wait
```

### Sync Progress State
```
IndexedDB Queue ──┐
                  │
    Operations ──►│ syncManager
                  │
              Track:
              ✓ Total pending
              ✓ Successfully synced
              ✓ Failed operations
              ✓ In progress?
                  │
                  ▼
        useSyncProgress() Hook
                  │
        Updates UI Components
        ✓ SyncProgressPanel
        ✓ OfflineStatusIndicator
```

## Component Hierarchy

```
RootLayout
├── OfflineInitializer (registers service worker)
├── OfflineNotification (shows when offline)
└── {children}
    │
    ├── Dashboard Layout
    │   ├── OfflineStatusIndicator
    │   ├── SyncProgressPanel
    │   └── Dashboard Pages
    │       ├── Attendance Form
    │       │   └── useOfflineOperation
    │       ├── Leave Request Form
    │       │   └── useOfflineOperation
    │       └── Meetings Page
    │           └── useOfflineData
    │
    ├── Kiosk Page
    │   ├── OfflineStatusIndicator
    │   └── useOfflineOperation
    │
    └── Admin Pages
        ├── Staff Management
        │   └── useOfflineData
        ├── Meetings
        │   └── useOfflineData
        └── Reports
            └── useOfflineData
```

## UI State Indicators

### Online - All Synced
```
┌─────────────────────────────┐
│ 🔌 Online                   │
└─────────────────────────────┘
```

### Online - Syncing
```
┌─────────────────────────────┐
│ 🔌 Online ⟳ Syncing...      │
└─────────────────────────────┘
```

### Offline - Idle
```
┌─────────────────────────────┐
│ 📡 Offline | 3 pending      │
└─────────────────────────────┘
```

### Offline - Sync Complete
```
┌─────────────────────────────┐
│ 🔌 Online | All synced ✓    │
└─────────────────────────────┘
```

## Database Schema for Offline

### IndexedDB Structure
```
Database: "attendance-system-offline"

Store: "offline-queue"
├── Key Path: id (auto-increment)
├── Fields:
│   ├── id: number
│   ├── table: string
│   ├── action: 'insert' | 'update' | 'delete'
│   ├── data: object
│   ├── timestamp: number
│   ├── synced: boolean
│   └── error?: string
└── Indexes:
    ├── synced
    ├── table
    └── timestamp

Store: "cache"
├── Key Path: id (composed: "table:recordId")
├── Fields:
│   ├── id: string
│   ├── table: string
│   ├── data: object
│   ├── timestamp: number
│   └── expiresAt: number
└── Indexes:
    ├── table
    └── expiresAt

Store: "metadata"
├── Key Path: key
└── Fields:
    ├── key: string
    ├── value: any
    └── timestamp: number
```

## Interaction Timeline

### Scenario: User works offline, then comes online

```
00:00  User goes offline
       ├─ App detects offline
       └─ Shows offline UI

00:05  User records attendance
       ├─ Operation queued to IndexedDB
       ├─ OfflineStatusIndicator updates: "Offline | 1 pending"
       └─ User sees success message

00:10  User submits leave request
       ├─ Operation queued
       └─ IndexedDB now has 2 pending

00:15  User comes back online
       ├─ Service Worker detects online
       ├─ Auto-sync triggers
       ├─ OfflineStatusIndicator shows: "Online ⟳ Syncing..."
       └─ SyncProgressPanel shows: "1 / 2 synced"

00:16  First operation syncs
       ├─ POST /api/offline/sync with attendance data
       ├─ Server validates & saves to Supabase
       ├─ Response success received
       ├─ Removed from offline-queue
       └─ SyncProgressPanel: "2 / 2 synced"

00:17  Second operation syncs
       ├─ POST /api/offline/sync with leave request
       ├─ Server validates & saves to Supabase
       ├─ Response success received
       ├─ Removed from offline-queue
       └─ All complete!

00:18  UI Updates
       ├─ OfflineStatusIndicator: "🔌 Online"
       ├─ SyncProgressPanel disappears
       ├─ OfflineNotification disappears
       └─ User sees all data synced
```

## Testing Workflow

```
┌─ Start Test ─┐
│              ▼
│   [Enable Offline Mode]
│   DevTools → Network → Offline
│              │
│              ▼
│   [Perform Action]
│   (Record attendance / Submit form)
│              │
│              ▼
│   [Verify Offline Queue]
│   DevTools → IndexedDB → offline-queue
│   ✓ Operation should be there
│              │
│              ▼
│   [Go Online]
│   DevTools → Network → Online
│              │
│              ▼
│   [Monitor Sync]
│   Watch Network tab → /api/offline/sync
│              │
│              ▼
│   [Verify Sync Success]
│   ✓ Queue should empty
│   ✓ Data in Supabase
│   ✓ UI should update
│              │
│              ▼
│   [Test Complete] ✓
│
└──────────────┘
```

## Error Handling Flow

```
Operation Fails
       │
       ▼
[Is it network error?]
       │
    YES┼─NO
       │  │
       │  └─→ [Server Error]
       │       └─→ Mark in queue with error
       │           └─→ Show error UI
       │               └─→ User can retry
       │
       └─→ [Offline]
           └─→ Queue for sync
               └─→ Try again when online
```

---

This visual guide helps developers understand the offline system at a glance. Reference these diagrams during development and integration.

For detailed code examples, see [OFFLINE_SETUP.md](OFFLINE_SETUP.md).
