'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Handles Kiosk Clock In/Out via ID Number
 * Aligned with Kiosk Page status expectations
 */
export async function handleKioskAction(idNumber: string) {
  const supabase = await createClient()

  // 1. Look up the profile by the unique ID number (e.g., 1010)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name')
    .eq('unique_id_number', idNumber)
    .single()

  if (profileError || !profile) {
    return { 
      success: false, 
      error: "ID not found. Please check your number." 
    }
  }

  // 2. Check if the user is already clocked in (open session)
  const { data: activeRecord } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', profile.id)
    .is('clock_out', null)
    .single()

  const now = new Date().toISOString()
  const today = new Date().toLocaleDateString('en-CA')

  if (activeRecord) {
    // --- CLOCK OUT LOGIC ---
    const { error: outError } = await supabase
      .from('attendance')
      .update({ clock_out: now })
      .eq('id', activeRecord.id)

    if (outError) {
      return { success: false, error: "Database error during Clock Out." }
    }
    
    revalidatePath('/kiosk')
    revalidatePath('/dashboard')
    return { 
      success: true, 
      type: 'out', 
      message: `Goodbye, ${profile.first_name}! Clocked out successfully.` 
    }

  } else {
    // --- CLOCK IN LOGIC ---
    const { error: inError } = await supabase
      .from('attendance')
      .insert({
        profile_id: profile.id,
        date: today,
        clock_in: now
      })

    if (inError) {
      return { success: false, error: "Database error during Clock In." }
    }

    revalidatePath('/kiosk')
    revalidatePath('/dashboard')
    return { 
      success: true, 
      type: 'in', 
      message: `Welcome, ${profile.first_name}! Clocked in successfully.` 
    }
  }
}