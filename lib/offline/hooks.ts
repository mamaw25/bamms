/**
 * React hooks for offline functionality
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { syncManager, SyncProgress } from './sync';

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to track sync progress
 */
export function useSyncProgress(): SyncProgress {
  const [progress, setProgress] = useState<SyncProgress>({
    total: 0,
    synced: 0,
    failed: 0,
    inProgress: false,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initListener = async () => {
      unsubscribe = syncManager.addProgressListener(setProgress);
      // Get initial progress
      const initial = await syncManager.getSyncProgress();
      setProgress(initial);
    };

    initListener();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return progress;
}

/**
 * Hook to queue offline operations
 */
export function useOfflineOperation() {
  const isOnline = useOnlineStatus();

  const queueOperation = useCallback(
    async (
      table: string,
      action: 'insert' | 'update' | 'delete',
      data: Record<string, unknown>
    ) => {
      if (isOnline) {
        // If online, perform operation directly
        const response = await fetch('/api/offline/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, action, data }),
        });
        return response.json();
      } else {
        // If offline, queue for later sync
        await syncManager.queueOperation(table, action, data);
        return { offline: true, queued: true };
      }
    },
    [isOnline]
  );

  return { queueOperation, isOnline };
}

/**
 * Hook to cache and retrieve data
 */
export function useOfflineData<T>(
  table: string,
  fetchFn: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch fresh data
      const freshData = await fetchFn();
      setData(freshData);

      // Cache the data
      if (Array.isArray(freshData)) {
        await syncManager.cacheDataBatch(table, freshData as Record<string, unknown>[]);
      } else if (freshData && typeof freshData === 'object' && 'id' in freshData) {
        await syncManager.cacheData(
          table,
          (freshData as Record<string, unknown>).id as string,
          freshData as Record<string, unknown>
        );
      }
    } catch (err) {
      // If fetch fails and offline, try to get cached data
      if (!isOnline) {
        try {
          const cached = await syncManager.getCachedDataByTable(table);
          if (cached.length > 0) {
            setData(cached as unknown as T);
          } else {
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
          }
        } catch {
          setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        }
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      }
    } finally {
      setLoading(false);
    }
  }, [table, fetchFn, isOnline]);

  useEffect(() => {
    fetch();
  }, [fetch, isOnline]);

  return {
    data,
    loading,
    error,
    refetch: fetch,
  };
}

/**
 * Hook to manually trigger sync
 */
export function useSyncOfflineQueue() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sync = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      await syncManager.syncOfflineQueue();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sync failed'));
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing, error };
}
