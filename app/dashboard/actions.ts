'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function clockIn(userId: string, firstName: string) {
  try {
    const supabase = await createClient()
    const todayStr = new Date().toLocaleDateString('en-CA')

    // Check if already clocked in
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('*')
      .eq('profile_id', userId)
      .eq('date', todayStr)
      .maybeSingle()

    if (existingRecord && !existingRecord.clock_out) {
      return { success: false, error: 'Already clocked in' }
    }

    // Insert new clock-in record
    const { error } = await supabase
      .from('attendance')
      .insert({
        profile_id: userId,
        date: todayStr,
        check_in: new Date().toISOString(),
        clock_out: null,
        status: 'present',
        work_from_home: false
      })

    if (error) {
      console.error('Clock in error:', error)
      return { success: false, error: 'Failed to clock in' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: `Welcome, ${firstName}! You are clocked in.` }
  } catch (err) {
    console.error('Clock in exception:', err)
    return { success: false, error: 'System error occurred' }
  }
}

export async function clockOut(userId: string, firstName: string, recordId?: string) {
  try {
    const supabase = await createClient()
    const todayStr = new Date().toLocaleDateString('en-CA')

    let targetRecordId = recordId

    // If no recordId provided, find the active record
    if (!targetRecordId) {
      const { data: activeRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('profile_id', userId)
        .eq('date', todayStr)
        .is('clock_out', null)
        .single()

      if (!activeRecord) {
        return { success: false, error: 'No active clock-in record found' }
      }

      targetRecordId = activeRecord.id
    }

    // Update the record with clock-out time
    const { error } = await supabase
      .from('attendance')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', targetRecordId)

    if (error) {
      console.error('Clock out error:', error)
      return { success: false, error: 'Failed to clock out' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: `Thank you, ${firstName}! You are clocked out.` }
  } catch (err) {
    console.error('Clock out exception:', err)
    return { success: false, error: 'System error occurred' }
  }
}

export async function workFromHomeCheckIn(userId: string, firstName: string) {
  try {
    const supabase = await createClient()
    const todayStr = new Date().toLocaleDateString('en-CA')

    // Check if already has a record today
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('*')
      .eq('profile_id', userId)
      .eq('date', todayStr)
      .maybeSingle()

    if (existingRecord && !existingRecord.clock_out) {
      return { success: false, error: 'Already checked in for today' }
    }

    // Insert new WFH record
    const { error } = await supabase
      .from('attendance')
      .insert({
        profile_id: userId,
        date: todayStr,
        check_in: new Date().toISOString(),
        clock_out: null,
        status: 'present',
        work_from_home: true
      })

    if (error) {
      console.error('WFH check-in error:', error)
      return { success: false, error: 'Failed to check in' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: `Welcome, ${firstName}! Work From Home started.` }
  } catch (err) {
    console.error('WFH check-in exception:', err)
    return { success: false, error: 'System error occurred' }
  }
}

export async function workFromHomeCheckOut(userId: string, firstName: string, recordId?: string) {
  try {
    const supabase = await createClient()
    const todayStr = new Date().toLocaleDateString('en-CA')

    let targetRecordId = recordId

    // If no recordId provided, find the active record
    if (!targetRecordId) {
      const { data: activeRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('profile_id', userId)
        .eq('date', todayStr)
        .is('clock_out', null)
        .maybeSingle()

      if (!activeRecord) {
        return { success: false, error: 'No active WFH check-in found' }
      }

      targetRecordId = activeRecord.id
    }

    // Update the record with clock-out time
    const { error } = await supabase
      .from('attendance')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', targetRecordId)

    if (error) {
      console.error('WFH check-out error:', error)
      return { success: false, error: 'Failed to check out' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: `Thank you, ${firstName}! Work From Home ended.` }
  } catch (err) {
    console.error('WFH check-out exception:', err)
    return { success: false, error: 'System error occurred' }
  }
}
