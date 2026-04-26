'use client';

import React, { useEffect } from 'react';
import { useOnlineStatus, useSyncProgress, useSyncOfflineQueue } from '@/lib/offline/hooks';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';

/**
 * OfflineStatusIndicator - Minimal status badge
 * Shows online/offline status with sync status when needed
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
