'use server'

import { revalidatePath } from 'next/cache'

type KioskResponse = 
  | { success: true; message: string; type: 'in' | 'out' }
  | { success: false; error: string; message?: never; type?: never };

// Helper: Create admin client with service role key for kiosk operations
async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function handleKioskAction(idNumber: string): Promise<KioskResponse> {
  const supabase = await createAdminClient()
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
}

export async function clockIn(userId: string, firstName: string): Promise<KioskResponse> {
  const supabase = await createAdminClient()
  const today = new Date().toLocaleDateString('en-CA')
  
  const { error } = await supabase
    .from('attendance')
    .insert({
      profile_id: userId,
      date: today,
      status: 'present',
      check_in: new Date().toISOString()
    })

  if (error) {
    console.error('[clockIn] Database error:', error)
    if (error.code === '23505') {
      return { success: false, error: `${firstName}, you have already completed your shift today.` }
    }
    return { success: false, error: `Database error during Clock In. [${error.code || 'unknown'}]` }
  }
  
  revalidatePath('/dashboard')
  revalidatePath('/kiosk')
  return {
    success: true,
    message: `Welcome ${firstName}! Clocked In successfully.`,
    type: 'in'
  }
}

export async function clockOut(userId: string, firstName: string, attendanceId: string): Promise<KioskResponse> {
  const supabase = await createAdminClient()
  
  const { error } = await supabase
    .from('attendance')
    .update({ clock_out: new Date().toISOString() })
    .eq('id', attendanceId)

  if (error) {
    return { success: false, error: "Database error during Clock Out." }
  }
  
  revalidatePath('/dashboard')
  revalidatePath('/kiosk')
  return {
    success: true,
    message: `Goodbye ${firstName}! Clocked Out successfully.`,
    type: 'out'
  }
}