'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export async function handleKioskAction(idNumber: string, actionType: 'in' | 'out') {
  const supabase = await createClient();

  // Fetching first_name here allows the Kiosk to say "Success, Ryan!"
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name')
    .eq('unique_id_number', idNumber)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Invalid ID Number" };
  }

  const result = actionType === 'in' ? await clockIn(profile.id) : await clockOut(profile.id);
  
  // Return the name so the UI can use it
  return { ...result, name: profile.first_name };
}

export async function clockIn(userId: string) {
  const supabase = await createClient();
  const today = getTodayStr();

  const { data: existing } = await supabase
    .from('attendance')
    .select('id, check_in')
    .eq('profile_id', userId)
    .eq('date', today)
    .single();

  if (existing) {
    const time = new Date(existing.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { success: false, error: `Already clocked in today at ${time}` };
  }

  const { error } = await supabase
    .from('attendance')
    .insert([{ 
      profile_id: userId, 
      date: today, 
      status: 'present', 
      check_in: new Date().toISOString() 
    }]);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard');
  revalidatePath('/kiosk');
  return { success: true };
}

export async function clockOut(userId: string) {
  const supabase = await createClient();
  const todayStr = getTodayStr();

  // Removed 'fetchError' to fix the warning
  const { data: record } = await supabase
    .from('attendance')
    .select('id, clock_out')
    .eq('profile_id', userId)
    .eq('date', todayStr)
    .single();

  if (!record) return { success: false, error: "No Time In record found for today." };
  if (record.clock_out) return { success: false, error: "Already clocked out for today." };

  const { error } = await supabase
    .from('attendance')
    .update({ clock_out: new Date().toISOString() })
    .eq('id', record.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/kiosk');
  return { success: true };
}