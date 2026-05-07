'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Meeting Attendees: Add Attendee
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

// Meeting Attendees: Remove Attendee
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

// Meeting Attendees: Get All Attendees (includes manual attendees + auto-added from check-ins)
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
    interface StaffMember {
      id: string;
      first_name: string;
      last_name: string;
      unique_id_number: string;
      email: string;
      role: string;
    }
    interface Attendee {
      id: string;
      staff_id: string;
      profiles: StaffMember | null;
      type: string;
    }
    const allAttendees: Attendee[] = [];

    // Add manual attendees
    if (manualAttendees && Array.isArray(manualAttendees)) {
      manualAttendees.forEach((attendee: any) => {
        staffIds.add(attendee.staff_id);
        const profile = Array.isArray(attendee.profiles) ? attendee.profiles[0] : attendee.profiles;
        allAttendees.push({
          id: attendee.id,
          staff_id: attendee.staff_id,
          profiles: (profile as StaffMember) || null,
          type: 'manual',
        });
      });
    }

    // Add checked-in staff (avoid duplicates)
    if (checkedInStaff && Array.isArray(checkedInStaff)) {
      checkedInStaff.forEach((record: any) => {
        if (!staffIds.has(record.profile_id)) {
          staffIds.add(record.profile_id);
          const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;
          allAttendees.push({
            id: `checkin_${record.profile_id}`,
            staff_id: record.profile_id,
            profiles: (profile as StaffMember) || null,
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

// Create Meeting
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

// Update Meeting
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

// Delete Meeting
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
