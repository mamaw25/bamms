'use client'

import { useEffect } from 'react'

export default function TabSessionManager() {
  useEffect(() => {
    // Initialize tab-specific session ID
    if (!sessionStorage.getItem('tab-session-id')) {
      const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('tab-session-id', tabId)
    }

    // Track last known auth state to avoid unnecessary reloads
    let lastAuthState = localStorage.getItem('sb-auth-token') || ''
    let reloadScheduled = false

    // Listen for storage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Only reload if auth was completely cleared (logout in another tab)
      if (e.key === 'sb-auth-token' && e.newValue === null && lastAuthState !== null) {
        // Only reload if we have a timeout pending to avoid rapid reloads
        if (!reloadScheduled) {
          reloadScheduled = true
          // Give a moment for the storage event to propagate
          setTimeout(() => {
            window.location.reload()
          }, 100)
        }
        return
      }

      // Update our tracked state
      if (e.key === 'sb-auth-token' && e.newValue) {
        lastAuthState = e.newValue
        reloadScheduled = false
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return null
}
