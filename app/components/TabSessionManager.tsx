'use client'

import { useEffect } from 'react'

export default function TabSessionManager() {
  useEffect(() => {
    // Initialize tab-specific session ID
    if (!sessionStorage.getItem('tab-session-id')) {
      const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('tab-session-id', tabId)
    }

    // Listen for storage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // If localStorage auth was cleared (logout), refresh this tab
      if (e.key && e.key.includes('auth-token') && e.newValue === null) {
        // Give a moment for the storage event to propagate
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }

      // If any auth-related key changed from another tab
      if (e.key?.includes('sb-') && e.oldValue !== e.newValue) {
        // Schedule a validation check
        setTimeout(() => {
          window.location.reload()
        }, 200)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return null
}
