'use client';

import React from 'react';

interface OfflineSkeletonProps {
  isLoading: boolean;
  isOffline: boolean;
  children: React.ReactNode;
}

/**
 * OfflineSkeleton - Loading state and offline cache indicator
 * Shows skeleton loading or cached data warning
 */
export function OfflineSkeleton({
  isLoading,
  isOffline,
  children,
}: OfflineSkeletonProps): React.ReactElement {
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
