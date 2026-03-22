'use client'

import { useEffect, useState } from 'react'
import { useAttendanceUpdates, useLeaveRequestUpdates } from '@/lib/realtime/hooks'

interface DashboardRealtimeProps {
  children: React.ReactNode
  userId: string
}

/**
 * Client component that wraps dashboard content and adds real-time updates
 * Automatically refetches attendance and leave request data when changes occur
 */
export function DashboardRealtime({ children, userId }: DashboardRealtimeProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Listen to attendance changes (clock in/out)
  useAttendanceUpdates(
    (record) => {
      // Check if this update is for current user
      if ((record.profile_id as string) === userId) {
        console.log('[Dashboard] Attendance updated for current user:', record)
        setRefreshTrigger((prev) => prev + 1)
      }
    },
    (record) => {
      // Check if this insert is for current user
      if ((record.profile_id as string) === userId) {
        console.log('[Dashboard] New attendance record for current user:', record)
        setRefreshTrigger((prev) => prev + 1)
      }
    }
  )

  // Listen to leave request changes
  useLeaveRequestUpdates(
    (record) => {
      // Check if this update is for current user
      if ((record.staff_id as string) === userId) {
        console.log('[Dashboard] Leave request updated for current user:', record)
        setRefreshTrigger((prev) => prev + 1)
      }
    },
    (record) => {
      // Check if this insert is for current user
      if ((record.staff_id as string) === userId) {
        console.log('[Dashboard] New leave request for current user:', record)
        setRefreshTrigger((prev) => prev + 1)
      }
    }
  )

  // Trigger page refresh when data changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      const timer = setTimeout(() => {
        console.log('[Dashboard] Refreshing page due to data changes...')
        window.location.reload()
      }, 1000) // Wait 1 second before refresh to batch multiple updates

      return () => clearTimeout(timer)
    }
  }, [refreshTrigger])

  return <>{children}</>
}
