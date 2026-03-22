'use client'

import { useEffect, useState } from 'react'
import { useAttendanceUpdates } from '@/lib/realtime/hooks'

interface AdminAttendanceRealtimeProps {
  children: React.ReactNode
}

/**
 * Client component that wraps admin attendance page and adds real-time updates
 * Automatically refetches attendance data when changes occur
 */
export function AdminAttendanceRealtime({ children }: AdminAttendanceRealtimeProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Listen to all attendance changes
  useAttendanceUpdates(
    (record) => {
      console.log('[AdminAttendance] Attendance updated:', record)
      setRefreshTrigger((prev) => prev + 1)
    },
    (record) => {
      console.log('[AdminAttendance] New attendance record:', record)
      setRefreshTrigger((prev) => prev + 1)
    }
  )

  // Trigger page refresh when data changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      const timer = setTimeout(() => {
        console.log('[AdminAttendance] Refreshing page due to attendance changes...')
        window.location.reload()
      }, 1500) // Wait 1.5 seconds before refresh to batch multiple updates

      return () => clearTimeout(timer)
    }
  }, [refreshTrigger])

  return <>{children}</>
}
