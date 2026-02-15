'use server'

import { createClient } from '@/lib/supabase/server';

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
    role: string | null; // Database can return null
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
    role: string; // Interface requires a string
  };
}

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
        role
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
        // FIX: Use the null-coalescing operator (??) to ensure a string is always provided
        role: record.profiles?.role ?? 'staff' 
      }
    };
  });
}