'use client'

import { useEffect, useState } from 'react'
import { useAttendanceUpdates } from '@/lib/realtime/hooks'

interface AdminReportRealtimeProps {
  children: React.ReactNode
}

/**
 * Client component that wraps admin report page and adds real-time updates
 * Automatically refetches report data when attendance changes
 */
export function AdminReportRealtime({ children }: AdminReportRealtimeProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Listen to all attendance changes
  useAttendanceUpdates(
    (record) => {
      console.log('[AdminReport] Attendance updated:', record)
      setRefreshTrigger((prev) => prev + 1)
    },
    (record) => {
      console.log('[AdminReport] New attendance record:', record)
      setRefreshTrigger((prev) => prev + 1)
    }
  )

  // Trigger page refresh when data changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      const timer = setTimeout(() => {
        console.log('[AdminReport] Refreshing page due to attendance changes...')
        window.location.reload()
      }, 1500) // Wait 1.5 seconds before refresh to batch multiple updates

      return () => clearTimeout(timer)
    }
  }, [refreshTrigger])

  return <>{children}</>
}
