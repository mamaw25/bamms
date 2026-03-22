/**
 * Service Worker for offline support and caching
 * Handles:
 * - Offline request caching
 * - Background sync
 * - Static asset caching
 */

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  STATIC: `static-${CACHE_VERSION}`,
  API: `api-${CACHE_VERSION}`,
  IMAGES: `images-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('Failed to cache some assets:', error);
        // Continue even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            !Object.values(CACHE_NAMES).includes(cacheName) &&
            cacheName !== 'offline-queue'
          ) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!url.hostname.includes(self.location.hostname)) {
    return;
  }

  // Strategy for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            return caches.open(CACHE_NAMES.API).then((c) => {
              const responseToCache = response.clone();
              c.put(request, responseToCache);
              return response;
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response on network failure
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response for API calls
            return new Response(
              JSON.stringify({
                offline: true,
                message: 'You are offline. Your changes will be synced when online.',
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // Strategy for images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          return caches.open(CACHE_NAMES.IMAGES).then((cache) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Default: network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cache = caches.open(CACHE_NAMES.STATIC);
          cache.then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return (
            cachedResponse ||
            caches.match('/offline.html').then((offlineResponse) => {
              return offlineResponse || new Response('Offline');
            })
          );
        });
      })
  );
});

// Background sync for offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  // This will be handled by the sync manager in the main app
  // The service worker just ensures the sync event is triggered
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_OFFLINE_QUEUE',
      timestamp: Date.now(),
    });
  });
}
