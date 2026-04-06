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

    // Listen for storage events to detect logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // If auth is cleared in localStorage but session exists in sessionStorage
      // This tab should refresh to get correct state
      if (e.key?.includes('sb-') && !e.newValue) {
        // Auth was cleared, refresh this page to validate current session
        window.location.reload()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
}
