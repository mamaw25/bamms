'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreateMeetingData {
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string;
}

interface UpdateMeetingData {
  status?: string;
  attendees?: string[];
  completed_at?: string;
}

interface StaffProfile {
  id: string;
  first_name: string;
  last_name: string;
  unique_id_number: string;
  email: string;
  role: string;
}

interface AttendeeRecord {
  id: string;
  staff_id: string;
  profiles: StaffProfile;
}

export async function createMeeting(data: CreateMeetingData) {
  const supabase = await createClient();
  
  try {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert([
        {
          title: data.title,
          date: data.date,
          time: data.time,
          venue: data.venue,
          agenda: data.agenda,
          status: 'Scheduled',
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) throw error;
    revalidatePath('/dashboard/admin/meetings');
    return { success: true, data: meeting };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create meeting' };
  }
}

export async function getMeetings() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch meetings' };
  }
}

export async function updateMeeting(id: string, data: UpdateMeetingData) {
  const supabase = await createClient();
  
  try {
    // If status is being set to 'Completed', add completed_at timestamp
    const updateData = { ...data };
    if (data.status === 'Completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/dashboard/admin/meetings');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update meeting' };
  }
}

export async function deleteMeeting(id: string) {
  const supabase = await createClient();
  
  try {
    console.log('Server action: Deleting meeting with ID:', id);
    
    // Verify the meeting exists first
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', id)
      .single();

    console.log('Meeting fetch - error:', fetchError, 'meeting:', meeting);
    
    if (fetchError || !meeting) {
      throw new Error('Meeting not found');
    }
    
    // Delete associated meeting attendees first (due to FK constraint)
    console.log('Deleting meeting attendees for meeting:', id);
    const { error: deleteAttendeesError, count: attendeeCount } = await supabase
      .from('meeting_attendees')
      .delete()
      .eq('meeting_id', id);

    if (deleteAttendeesError) {
      console.error('Error deleting attendees:', deleteAttendeesError);
      throw deleteAttendeesError;
    }
    
    console.log('Meeting attendees deleted:', attendeeCount);
    
    // Now delete the meeting itself
    console.log('Deleting meeting:', id);
    const { error: deleteMeetingError, count: meetingCount } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    console.log('Delete meeting - error:', deleteMeetingError, 'count:', meetingCount);
    
    if (deleteMeetingError) {
      console.error('Delete meeting error:', deleteMeetingError);
      throw deleteMeetingError;
    }

    if (meetingCount === 0) {
      throw new Error('No rows deleted - RLS policy may be preventing deletion');
    }
    
    console.log('Meeting deleted successfully');
    revalidatePath('/dashboard/admin/meetings');
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete meeting';
    console.error('Delete meeting error:', errorMessage, error);
    return { success: false, error: errorMessage };
  }
}

export async function addMeetingAttendee(meetingId: string, staffId: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('meeting_attendees')
      .insert([
        {
          meeting_id: meetingId,
          staff_id: staffId,
        }
      ])
      .select();

    if (error) throw error;
    revalidatePath('/dashboard/admin/meetings');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add attendee' };
  }
}

export async function getMeetingAttendees(meetingId: string) {
  const supabase = await createClient();
  
  try {
    // Get manually added attendees only
    const { data: manualAttendees, error: attendeesError } = await supabase
      .from('meeting_attendees')
      .select(`
        id,
        staff_id,
        profiles:staff_id (
          id,
          first_name,
          last_name,
          unique_id_number,
          email,
          role
        )
      `)
      .eq('meeting_id', meetingId);

    if (attendeesError) {
      console.error('Get Manual Attendees Error:', attendeesError.message);
      // Try alternative query if the relationship doesn't exist
      if (attendeesError.message.includes('relationship') || attendeesError.message.includes('staff_id')) {
        console.log('Trying alternative query for manual attendees...');
        const { data: altAttendees, error: altError } = await supabase
          .from('meeting_attendees')
          .select('*')
          .eq('meeting_id', meetingId);
        
        if (!altError && altAttendees && altAttendees.length > 0) {
          // Fetch profiles separately
          const staffIds = altAttendees.map(a => a.staff_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', staffIds);
          
          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          const formattedAttendees = altAttendees.map(a => ({
            id: a.id,
            staff_id: a.staff_id,
            profiles: profileMap.get(a.staff_id)
          }));
          
          console.log('Alternative manual attendees:', formattedAttendees);
          return { success: true, data: formattedAttendees };
        }
      }
    }

    // Format the attendees response
    const formattedAttendees = manualAttendees?.map(attendee => ({
      id: attendee.id,
      staff_id: attendee.staff_id,
      profiles: Array.isArray(attendee.profiles) ? attendee.profiles[0] : attendee.profiles
    })) || [];

    console.log('Manual attendees:', formattedAttendees);
    return { success: true, data: formattedAttendees };
  } catch (error) {
    console.error('getMeetingAttendees error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch attendees' };
  }
}

export async function removeMeetingAttendee(attendeeId: string) {
  const supabase = await createClient();
  
  try {
    // Check if this is an auto-added attendee (from check-in)
    // Auto-added attendees have IDs like "checkin_UUID" which don't exist in the database
    if (attendeeId.startsWith('checkin_')) {
      return { success: false, error: 'Cannot remove auto-added attendees from check-ins' };
    }

    const { error } = await supabase
      .from('meeting_attendees')
      .delete()
      .eq('id', attendeeId);

    if (error) throw error;
    revalidatePath('/dashboard/admin/meetings');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove attendee' };
  }
}

export async function saveMeetingMinutes(meetingId: string, notes: string) {
  const supabase = await createClient();

  try {
    // Check if minutes already exist for this meeting
    const { data: existingMinutes } = await supabase
      .from('meeting_minutes')
      .select('id')
      .eq('meeting_id', meetingId)
      .single();

    if (existingMinutes) {
      // Update existing minutes
      const { error } = await supabase
        .from('meeting_minutes')
        .update({
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('meeting_id', meetingId);

      if (error) throw error;
    } else {
      // Create new minutes
      const { error } = await supabase
        .from('meeting_minutes')
        .insert([
          {
            meeting_id: meetingId,
            notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
    }

    revalidatePath('/dashboard/admin/meetings');
    return { success: true };
  } catch (error) {
    console.error('Error saving meeting minutes:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save meeting minutes' };
  }
}

export async function getMeetingMinutes(meetingId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('meeting_minutes')
      .select('*')
      .eq('meeting_id', meetingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error

    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error fetching meeting minutes:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch meeting minutes' };
  }
}
