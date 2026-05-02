'use client'

import { useEffect } from 'react'

/**
 * Initialize tab-specific session storage
 * This ensures each tab maintains its own auth state in sessionStorage
 * sessionStorage is tab-specific and won't interfere with other tabs
 */
export function useTabSessionInit() {
  useEffect(() => {
    // Generate unique tab ID if not exists
    if (!sessionStorage.getItem('tab-session-id')) {
      const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('tab-session-id', tabId)
    }

    // Listen for logout in other tabs - only reload if auth is completely cleared
    let reloadScheduled = false

    const handleStorageChange = (e: StorageEvent) => {
      // Only reload if the refresh token was explicitly cleared in another tab
      // (indicating a logout operation)
      if (e.key === 'sb-refresh-token' && e.newValue === null && e.oldValue !== null) {
        if (!reloadScheduled) {
          reloadScheduled = true
          // Small delay to ensure storage event propagates
          setTimeout(() => {
            window.location.reload()
          }, 100)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
}
