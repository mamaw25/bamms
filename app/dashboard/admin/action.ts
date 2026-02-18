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

// 4. Delete Staff Member
export async function deleteStaff(userId: string) {
  const supabase = await createClient();

  // Delete the user from auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  if (authError) {
    console.error('Auth Delete Error:', authError.message);
    throw new Error('Failed to delete staff member from auth');
  }

  // Delete the profile from the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error('Profile Delete Error:', profileError.message);
    throw new Error('Failed to delete staff profile');
  }

  return { success: true };
}

// 5. Update Staff Member
export async function updateStaff(
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
  }
) {
  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (profileError) {
    console.error('Profile Update Error:', profileError.message);
    throw new Error('Failed to update staff profile');
  }

  // If email was changed, update auth email as well
  if (updates.email) {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email: updates.email,
    });

    if (authError) {
      console.error('Auth Update Error:', authError.message);
      throw new Error('Failed to update staff email in auth');
    }
  }

  return { success: true };
}

// 6. Meeting Attendees: Add Attendee
export async function addMeetingAttendee(meetingId: string, staffId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meeting_attendees')
    .insert([{ meeting_id: meetingId, staff_id: staffId }])
    .select();

  if (error) {
    console.error('Add Attendee Error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 7. Meeting Attendees: Remove Attendee
export async function removeMeetingAttendee(attendeeId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('meeting_attendees')
    .delete()
    .eq('id', attendeeId);

  if (error) {
    console.error('Remove Attendee Error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 8. Meeting Attendees: Get All Attendees (includes manual attendees + auto-added from check-ins)
export async function getMeetingAttendees(meetingId: string) {
  const supabase = await createClient();

  try {
    // First, get the meeting to know its date
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('date')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      console.error('Get Meeting Error:', meetingError?.message);
      return { success: false, error: 'Meeting not found' };
    }

    console.log('Meeting date:', meeting.date);

    // Get manually added attendees
    const { data: manualAttendees, error: attendeesError } = await supabase
      .from('meeting_attendees')
      .select('id, staff_id, profiles(id, first_name, last_name, unique_id_number, email, role)')
      .eq('meeting_id', meetingId);

    if (attendeesError) {
      console.error('Get Attendees Error:', attendeesError.message);
    }

    console.log('Manual attendees:', manualAttendees);

    // Get staff who checked in on the meeting date
    const { data: checkedInStaff, error: checkinError } = await supabase
      .from('attendance')
      .select('profile_id, profiles(id, first_name, last_name, unique_id_number, email, role)')
      .eq('date', meeting.date);

    if (checkinError) {
      console.error('Get Check-in Error:', checkinError.message);
    }

    console.log('Checked-in staff:', checkedInStaff);

    // Combine and deduplicate: manual attendees + checked-in staff
    const staffIds = new Set<string>();
    const allAttendees: any[] = [];

    // Add manual attendees
    if (manualAttendees && Array.isArray(manualAttendees)) {
      manualAttendees.forEach((attendee) => {
        staffIds.add(attendee.staff_id);
        allAttendees.push({
          id: attendee.id,
          staff_id: attendee.staff_id,
          profiles: attendee.profiles,
          type: 'manual',
        });
      });
    }

    // Add checked-in staff (avoid duplicates)
    if (checkedInStaff && Array.isArray(checkedInStaff)) {
      checkedInStaff.forEach((record: any) => {
        if (!staffIds.has(record.profile_id)) {
          staffIds.add(record.profile_id);
          allAttendees.push({
            id: `checkin_${record.profile_id}`,
            staff_id: record.profile_id,
            profiles: record.profiles,
            type: 'auto_checkin',
          });
        }
      });
    }

    console.log('All attendees:', allAttendees);
    return { success: true, data: allAttendees };
  } catch (error) {
    console.error('getMeetingAttendees error:', error);
    return { success: false, error: 'An error occurred while fetching attendees' };
  }
}

// 9. Create Meeting
export async function createMeeting(meetingData: {
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meetings')
    .insert([
      {
        title: meetingData.title,
        date: meetingData.date,
        time: meetingData.time,
        venue: meetingData.venue,
        agenda: meetingData.agenda,
      },
    ])
    .select();

  if (error) {
    console.error('Create Meeting Error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 10. Update Meeting
export async function updateMeeting(
  meetingId: string,
  updates: {
    title?: string;
    date?: string;
    time?: string;
    venue?: string;
    agenda?: string;
    status?: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meetings')
    .update(updates)
    .eq('id', meetingId)
    .select();

  if (error) {
    console.error('Update Meeting Error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 11. Delete Meeting
export async function deleteMeeting(meetingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', meetingId);

  if (error) {
    console.error('Delete Meeting Error:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/admin/meetings');
  return { success: true };
}