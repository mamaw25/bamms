'use client';

import React from 'react';
import { useOnlineStatus, useSyncProgress, useSyncOfflineQueue } from '@/lib/offline/hooks';
import { Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * SyncProgressPanel - Detailed sync status and progress
 * Shows progress bar, sync stats, and manual sync button
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
