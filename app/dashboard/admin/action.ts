'use server'

import { createClient } from '@/lib/supabase/server';

// 1. Interfaces for Type Safety
interface RawAttendance {
  id: string;
  date: string;
  check_in: string;
  clock_out: string | null;
  profile_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    unique_id_number: string;
    role: string | null; 
    email: string | null;
  } | null;
}

export interface AttendanceReport {
  id: string;
  date: string;
  check_in: string;
  clock_out: string | null;
  duration: string;
  profiles: {
    first_name: string;
    last_name: string;
    unique_id_number: string;
    role: string;
    email: string;
  };
}

// 2. Fetch Attendance Logs (Synced with Profiles)
export async function getAttendanceReport(selectedDate?: string): Promise<AttendanceReport[]> {
  const supabase = await createClient();

  let query = supabase
    .from('attendance')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        unique_id_number,
        role,
        email
      )
    `);

  if (selectedDate && selectedDate.trim() !== "" && selectedDate !== 'undefined') {
    query = query.eq('date', selectedDate);
  }

  const { data, error } = await query
    .order('date', { ascending: false })
    .order('check_in', { ascending: false });

  if (error) throw new Error(error.message);

  const rawData = (data as unknown) as RawAttendance[];

  return rawData.map((record) => {
    let duration = "0h 0m 0s";
    
    if (record.check_in && record.clock_out) {
      const start = new Date(record.check_in);
      const end = new Date(record.clock_out);
      const diffMs = end.getTime() - start.getTime();
      
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
      const diffSecs = Math.floor((diffMs / 1000) % 60);
      
      duration = `${diffHrs}h ${diffMins}m ${diffSecs}s`;
    }

    return {
      id: record.id,
      date: record.date,
      check_in: record.check_in,
      clock_out: record.clock_out,
      duration,
      profiles: {
        first_name: record.profiles?.first_name || 'MISSING',
        last_name: record.profiles?.last_name || `PROFILE (${record.profile_id.slice(-5)})`,
        unique_id_number: record.profiles?.unique_id_number || 'N/A',
        role: record.profiles?.role ?? 'staff',
        email: record.profiles?.email ?? 'no-email@system.com'
      }
    };
  });
}

// 3. NEW: Fetch All Staff Profiles (No Room for Errors)
// This links directly to the same table used for attendance logs.
export async function getStaffProfiles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Database Error:', error.message);
    throw new Error('Failed to fetch staff profiles');
  }

  return data;
}