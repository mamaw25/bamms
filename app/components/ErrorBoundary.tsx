'use client'

import { useEffect } from 'react'

/**
 * Global error boundary for suppressing expected auth errors
 * Prevents "Refresh Token Not Found" from being displayed to users
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Override console.error to suppress expected refresh token errors
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      const errorMessage = String(args[0] || '')
      
      // Suppress refresh token not found errors - these are expected
      if (
        errorMessage.includes('refresh_token_not_found') ||
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found')
      ) {
        // Silently ignore this error
        return
      }

      // Call original console.error for other errors
      originalError.apply(console, args as Parameters<typeof console.error>)
    }

    // Also intercept unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = String(event.reason?.message || event.reason || '')
      
      if (
        errorMessage.includes('refresh_token_not_found') ||
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found')
      ) {
        // Prevent the error from propagating
        event.preventDefault()
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      console.error = originalError
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
