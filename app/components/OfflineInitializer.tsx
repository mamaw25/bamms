'use client';

import { useEffect } from 'react';

/**
 * Component that initializes offline support on app startup
 * Registers the service worker and initializes the offline database
 */
export default function OfflineInitializer(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_OFFLINE_QUEUE') {
          console.log('Service worker triggered offline queue sync');
          // Trigger sync through the sync manager
          import('@/lib/offline/sync').then(({ syncManager }) => {
            syncManager.syncOfflineQueue();
          });
        }
      });
    }

    // Initialize offline database
    import('@/lib/offline/db').then(({ offlineDB }) => {
      offlineDB.init().then(() => {
        console.log('Offline database initialized');

        // Clear expired cache on startup
        offlineDB.clearExpiredCache();
      });
    });

    // Auto-sync when coming back online
    const handleOnline = () => {
      console.log('App is back online');
      import('@/lib/offline/sync').then(({ syncManager }) => {
        if (!syncManager.isOnlineMode()) {
          syncManager.syncOfflineQueue();
        }
      });
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
