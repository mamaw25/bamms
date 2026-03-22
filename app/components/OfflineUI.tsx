'use client';

import React, { useEffect } from 'react';
import { useOnlineStatus, useSyncProgress, useSyncOfflineQueue } from '@/lib/offline/hooks';
import { Wifi, WifiOff, Loader2, CheckCircle2, AlertCircle, Cloud, CloudOff } from 'lucide-react';

/**
 * Component to display online/offline status
 */
export function OfflineStatusIndicator(): React.ReactElement {
  const isOnline = useOnlineStatus();
  const progress = useSyncProgress();
  const { sync, syncing, error } = useSyncOfflineQueue();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Auto-sync when coming back online
    if (isOnline && progress.total > progress.synced && !syncing) {
      sync();
    }
  }, [isOnline, progress, syncing, sync]);

  // Return placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium">
        <Wifi className="w-4 h-4 text-green-600" />
        <span className="text-green-600">Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium">
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-orange-600" />
          <span className="text-orange-600">Offline</span>
        </>
      )}

      {/* Show sync status when offline or pending */}
      {!isOnline && progress.total > progress.synced && (
        <div className="ml-2 flex items-center gap-1 text-orange-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{progress.total - progress.synced} pending</span>
        </div>
      )}

      {syncing && (
        <div className="ml-2 flex items-center gap-1 text-blue-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Syncing...</span>
        </div>
      )}

      {error && (
        <div className="ml-2 flex items-center gap-1 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span>Sync failed</span>
        </div>
      )}
    </div>
  );
}

/**
 * Component to show detailed sync progress
 */
export function SyncProgressPanel(): React.ReactElement | null {
  const isOnline = useOnlineStatus();
  const progress = useSyncProgress();
  const { sync, syncing } = useSyncOfflineQueue();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after hydration
  if (!mounted) {
    return null;
  }

  if (isOnline && progress.total === 0) {
    return null;
  }

  const percentage = progress.total > 0 ? (progress.synced / progress.total) * 100 : 0;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Cloud className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Online - Syncing</span>
            </>
          ) : (
            <>
              <CloudOff className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Offline Mode</span>
            </>
          )}
        </div>
        {progress.total > 0 && (
          <span className="text-sm text-gray-600">
            {progress.synced} / {progress.total} synced
          </span>
        )}
      </div>

      {progress.total > 0 && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {progress.synced > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{progress.synced} synced</span>
                </div>
              )}
              {progress.failed > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{progress.failed} failed</span>
                </div>
              )}
              {progress.total - progress.synced - progress.failed > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <span>{progress.total - progress.synced - progress.failed} pending</span>
                </div>
              )}
            </div>

            {!syncing && !isOnline && (
              <button
                onClick={sync}
                disabled={syncing}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                Sync Now
              </button>
            )}

            {syncing && (
              <div className="flex items-center gap-1 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </div>
            )}
          </div>
        </>
      )}

      {isOnline && progress.total === 0 && (
        <p className="text-sm text-blue-900">All changes have been synced successfully.</p>
      )}
    </div>
  );
}

/**
 * Component to show offline notification
 */
export function OfflineNotification(): React.ReactElement | null {
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after hydration to prevent mismatch
  if (!mounted || isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg flex items-center gap-3">
      <WifiOff className="w-5 h-5 text-orange-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-orange-900">You are offline</p>
        <p className="text-sm text-orange-700">
          Your changes will be saved locally and synced when you go back online.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading skeleton with offline support
 */
export function OfflineSkeleton({
  isLoading,
  isOffline,
  children,
}: {
  isLoading: boolean;
  isOffline: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {isOffline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          You are viewing cached data. Some information may not be up to date.
        </div>
      )}
      {children}
    </>
  );
}
