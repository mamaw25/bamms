'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

type KioskResponse = 
  | { success: true; message: string; type: 'in' | 'out' }
  | { success: false; error: string; message?: never; type?: never };

// Create admin client with service role key for kiosk operations
function getAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase configuration for admin client');
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function handleKioskAction(idNumber: string): Promise<KioskResponse> {
  try {
    if (!idNumber || idNumber.trim() === '') {
      return { success: false, error: "Please enter a valid ID number" }
    }

    let supabase
    try {
      supabase = getAdminClient()
    } catch (error) {
      console.error('Supabase client creation error:', error)
      return { success: false, error: "Connection error. Please try again." }
    }

    const todayStr = new Date().toLocaleDateString('en-CA')

    // 1. Find user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name')
      .eq('unique_id_number', idNumber)
      .single()

    if (profileError || !profile) {
      return { success: false, error: "Invalid ID Number" }
    }

    // 2. Look for an open session (NULL clock_out) for TODAY only
    const { data: openRecord } = await supabase
      .from('attendance')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('date', todayStr)
      .is('clock_out', null)
      .maybeSingle()

    if (openRecord) {
      // Found a check-in for today -> Now Clock Out
      return await clockOut(profile.id, profile.first_name, openRecord.id)
    } else {
      // No check-in for today found -> Now Clock In
      return await clockIn(profile.id, profile.first_name)
    }
  } catch (error) {
    console.error('Kiosk action error:', error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('fetch')) {
      return { success: false, error: "Connection error. Please check your internet connection." }
    }
    return { success: false, error: errorMessage }
  }
}

export async function clockIn(userId: string, firstName: string): Promise<KioskResponse> {
  try {
    const supabase = getAdminClient()
    const today = new Date().toLocaleDateString('en-CA')
    
    const { error } = await supabase
      .from('attendance')
      .insert({
        profile_id: userId,
        date: today,
        status: 'present',
        clock_in: new Date().toISOString()
      })

    if (error) {
      console.error('[clockIn] Database error:', error)
      if (error.code === '23505') {
        return { success: false, error: `${firstName}, you have already completed your shift today.` }
      }
      return { success: false, error: `Database error during Clock In. [${error.code || 'unknown'}]` }
    }
    
    revalidatePath('/')
    return {
      success: true,
      message: `Welcome ${firstName}! Clocked In successfully.`,
      type: 'in'
    }
  } catch (error) {
    console.error('Clock in error:', error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to clock in" }
  }
}

export async function clockOut(userId: string, firstName: string, attendanceId: string): Promise<KioskResponse> {
  try {
    const supabase = getAdminClient()
    
    const { error } = await supabase
      .from('attendance')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', attendanceId)

    if (error) {
      console.error('[clockOut] Database error:', error)
      return { success: false, error: "Database error during Clock Out." }
    }
    
    revalidatePath('/')
    return {
      success: true,
      message: `Goodbye ${firstName}! Clocked Out successfully.`,
      type: 'out'
    }
  } catch (error) {
    console.error('Clock out error:', error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to clock out" }
  }
}
