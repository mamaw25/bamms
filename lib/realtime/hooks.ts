'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeOptions {
  onInsert?: (payload: Record<string, unknown>) => void
  onUpdate?: (payload: Record<string, unknown>) => void
  onDelete?: (payload: Record<string, unknown>) => void
  enabled?: boolean
}

/**
 * Hook to listen to real-time changes on a Supabase table
 * Automatically subscribes on mount and unsubscribes on unmount
 */
export function useTableSubscription(
  tableName: string,
  options: RealtimeOptions = {}
) {
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (options.enabled === false) return

    let channel: RealtimeChannel | null = null
    let mounted = true

    const setupSubscription = async () => {
      try {
        channel = supabase
          .channel(`${tableName}:all`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: tableName,
            },
            (payload) => {
              console.log(`[Realtime] Insert on ${tableName}:`, payload)
              options.onInsert?.(payload.new as Record<string, unknown>)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: tableName,
            },
            (payload) => {
              console.log(`[Realtime] Update on ${tableName}:`, payload)
              options.onUpdate?.(payload.new as Record<string, unknown>)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: tableName,
            },
            (payload) => {
              console.log(`[Realtime] Delete on ${tableName}:`, payload)
              options.onDelete?.(payload.old as Record<string, unknown>)
            }
          )
          .subscribe((status) => {
            console.log(`[Realtime] Channel status for ${tableName}:`, status)
            if (mounted) {
              setIsConnected(status === 'SUBSCRIBED')
            }
          })
      } catch (err) {
        console.error(`[Realtime] Failed to subscribe to ${tableName}:`, err)
      }
    }

    setupSubscription()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, options.enabled])

  return { isConnected, error: null }
}

/**
 * Hook to listen to real-time changes on attendance table
 */
export function useAttendanceUpdates(
  onUpdate?: (record: Record<string, unknown>) => void,
  onInsert?: (record: Record<string, unknown>) => void
) {
  return useTableSubscription('attendance', {
    onInsert: (payload) => {
      console.log('[Realtime] New attendance record:', payload)
      onInsert?.(payload)
    },
    onUpdate: (payload) => {
      console.log('[Realtime] Attendance updated:', payload)
      onUpdate?.(payload)
    },
  })
}

/**
 * Hook to listen to real-time changes on leave_requests table
 */
export function useLeaveRequestUpdates(
  onUpdate?: (record: Record<string, unknown>) => void,
  onInsert?: (record: Record<string, unknown>) => void
) {
  return useTableSubscription('leave_requests', {
    onInsert: (payload) => {
      console.log('[Realtime] New leave request:', payload)
      onInsert?.(payload)
    },
    onUpdate: (payload) => {
      console.log('[Realtime] Leave request updated:', payload)
      onUpdate?.(payload)
    },
  })
}

/**
 * Hook to listen to real-time changes on meetings table
 */
export function useMeetingUpdates(
  onUpdate?: (record: Record<string, unknown>) => void,
  onInsert?: (record: Record<string, unknown>) => void,
  onDelete?: (record: Record<string, unknown>) => void
) {
  return useTableSubscription('meetings', {
    onInsert: (payload) => {
      console.log('[Realtime] New meeting:', payload)
      onInsert?.(payload)
    },
    onUpdate: (payload) => {
      console.log('[Realtime] Meeting updated:', payload)
      onUpdate?.(payload)
    },
    onDelete: (payload) => {
      console.log('[Realtime] Meeting deleted:', payload)
      onDelete?.(payload)
    },
  })
}

/**
 * Hook to listen to real-time changes on meeting_attendees table
 */
export function useMeetingAttendeesUpdates(
  onUpdate?: (record: Record<string, unknown>) => void,
  onInsert?: (record: Record<string, unknown>) => void,
  onDelete?: (record: Record<string, unknown>) => void
) {
  return useTableSubscription('meeting_attendees', {
    onInsert: (payload) => {
      console.log('[Realtime] New meeting attendee:', payload)
      onInsert?.(payload)
    },
    onUpdate: (payload) => {
      console.log('[Realtime] Meeting attendee updated:', payload)
      onUpdate?.(payload)
    },
    onDelete: (payload) => {
      console.log('[Realtime] Meeting attendee deleted:', payload)
      onDelete?.(payload)
    },
  })
}

/**
 * Hook to listen to real-time changes on profiles (staff) table
 */
export function useStaffUpdates(
  onUpdate?: (record: Record<string, unknown>) => void,
  onInsert?: (record: Record<string, unknown>) => void,
  onDelete?: (record: Record<string, unknown>) => void
) {
  return useTableSubscription('profiles', {
    onInsert: (payload) => {
      console.log('[Realtime] New staff member:', payload)
      onInsert?.(payload)
    },
    onUpdate: (payload) => {
      console.log('[Realtime] Staff updated:', payload)
      onUpdate?.(payload)
    },
    onDelete: (payload) => {
      console.log('[Realtime] Staff deleted:', payload)
      onDelete?.(payload)
    },
  })
}

/**
 * Hook to listen to real-time changes on meeting_minutes table
 */
export function useMeetingMinutesUpdates(
  onUpdate?: (record: Record<string, unknown>) => void,
  onInsert?: (record: Record<string, unknown>) => void
) {
  return useTableSubscription('meeting_minutes', {
    onInsert: (payload) => {
      console.log('[Realtime] New meeting minutes:', payload)
      onInsert?.(payload)
    },
    onUpdate: (payload) => {
      console.log('[Realtime] Meeting minutes updated:', payload)
      onUpdate?.(payload)
    },
  })
}
