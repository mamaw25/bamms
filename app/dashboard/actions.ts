'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function handleKioskAction(idNumber: string) {
  const supabase = await createClient();
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  // 1. Find user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name')
    .eq('unique_id_number', idNumber)
    .single();

  if (!profile) return { success: false, error: "Invalid ID Number" };

  // 2. STRICTOR SEARCH: Look for a NULL clock_out for TODAY only
  const { data: openRecord } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('date', todayStr) // Added this to prevent "Ghost Records" from other days
    .is('clock_out', null)
    .maybeSingle();

  if (openRecord) {
    // Found a check-in for today -> Now Clock Out
    return await clockOut(profile.id, profile.first_name, openRecord.id);
  } else {
    // No check-in for today found -> Now Clock In
    return await clockIn(profile.id, profile.first_name);
  }
}

export async function clockIn(userId: string, firstName: string) {
  const supabase = await createClient();
  const today = new Date().toLocaleDateString('en-CA'); 
  
  const { error } = await supabase
    .from('attendance')
    .insert([{ 
      profile_id: userId, 
      date: today, 
      status: 'present', 
      check_in: new Date().toISOString() 
    }]);

  if (error) {
    // If the constraint blocks the 3rd attempt, show this message
    if (error.code === '23505') {
      return { success: false, error: `${firstName}, you have already completed your shift today.` };
    }
    return { success: false, error: "Database error during Clock In." };
  }
  
  revalidatePath('/dashboard');
  return { success: true, message: `Welcome ${firstName}! Clocked In successfully.` };
}

export async function clockOut(userId: string, firstName: string, attendanceId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attendance')
    .update({ clock_out: new Date().toISOString() })
    .eq('id', attendanceId);

  if (error) return { success: false, error: "Database error during Clock Out." };
  
  revalidatePath('/dashboard');
  return { success: true, message: `Goodbye ${firstName}! Clocked Out successfully.` };
}