'use client';

import React from 'react';
import { useOnlineStatus } from '@/lib/offline/hooks';
import { WifiOff } from 'lucide-react';

/**
 * OfflineNotification - Bottom notification banner
 * Shows when user goes offline, persists until online again
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
    <div className="fixed bottom-4 left-4 right-4 bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg flex items-center gap-3 z-40">
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
