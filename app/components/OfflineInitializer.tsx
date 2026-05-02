'use client';

import { useEffect } from 'react';

/**
 * Component that initializes offline support on app startup
 * Registers the service worker and initializes the offline database
 */
export default function OfflineInitializer(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't block page render - use setTimeout to defer all initialization
    setTimeout(() => {
      try {
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
              }).catch(err => console.warn('Failed to sync offline queue:', err));
            }
          });
        }

        // Initialize offline database with error handling
        import('@/lib/offline/db').then(({ offlineDB }) => {
          try {
            offlineDB.init().then(() => {
              console.log('Offline database initialized');
              // Clear expired cache on startup
              try {
                offlineDB.clearExpiredCache();
              } catch (e) {
                console.warn('Failed to clear expired cache:', e);
              }
            }).catch(err => {
              console.warn('Failed to initialize offline database:', err);
            });
          } catch (e) {
            console.warn('Error initializing offline database:', e);
          }
        }).catch(err => {
          console.warn('Failed to import offline database:', err);
        });
      } catch (error) {
        console.warn('Offline initialization error:', error);
      }
    }, 0);

    // Auto-sync when coming back online
    const handleOnline = () => {
      console.log('App is back online');
      import('@/lib/offline/sync').then(({ syncManager }) => {
        if (!syncManager.isOnlineMode()) {
          syncManager.syncOfflineQueue();
        }
      }).catch(err => console.warn('Failed to trigger online sync:', err));
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
