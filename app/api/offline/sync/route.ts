/**
 * API route for offline sync operations
 * Handles syncing queued offline operations with the database
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface SyncPayload {
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload: SyncPayload = await request.json();
    const { table, action, data } = payload;

    const supabase = await createClient();

    // Validate input
    if (!table || !action || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: table, action, data' },
        { status: 400 }
      );
    }

    // Check user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process the sync operation based on table and action
    let result;

    switch (table) {
      case 'attendance':
        result = await syncAttendance(supabase, action, data);
        break;
      case 'leave_requests':
        result = await syncLeaveRequests(supabase, action, data);
        break;
      case 'meetings':
        result = await syncMeetings(supabase, action, data);
        break;
      case 'meeting_attendees':
        result = await syncMeetingAttendees(supabase, action, data);
        break;
      case 'meeting_minutes':
        result = await syncMeetingMinutes(supabase, action, data);
        break;
      default:
        return NextResponse.json({ error: `Unknown table: ${table}` }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Offline sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function syncAttendance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  data: Record<string, unknown>
) {
  switch (action) {
    case 'insert': {
      const { data: result, error } = await supabase.from('attendance').insert([data]).select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'update': {
      const { id, ...updates } = data;
      const { data: result, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'delete': {
      const { id } = data;
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      return error ? { error: error.message } : { success: true };
    }
    default:
      return { error: `Unknown action: ${action}` };
  }
}

async function syncLeaveRequests(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  data: Record<string, unknown>
) {
  switch (action) {
    case 'insert': {
      const { data: result, error } = await supabase.from('leave_requests').insert([data]).select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'update': {
      const { id, ...updates } = data;
      const { data: result, error } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'delete': {
      const { id } = data;
      const { error } = await supabase.from('leave_requests').delete().eq('id', id);
      return error ? { error: error.message } : { success: true };
    }
    default:
      return { error: `Unknown action: ${action}` };
  }
}

async function syncMeetings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  data: Record<string, unknown>
) {
  switch (action) {
    case 'insert': {
      const { data: result, error } = await supabase.from('meetings').insert([data]).select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'update': {
      const { id, ...updates } = data;
      const { data: result, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'delete': {
      const { id } = data;
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      return error ? { error: error.message } : { success: true };
    }
    default:
      return { error: `Unknown action: ${action}` };
  }
}

async function syncMeetingAttendees(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  data: Record<string, unknown>
) {
  switch (action) {
    case 'insert': {
      const { data: result, error } = await supabase
        .from('meeting_attendees')
        .insert([data])
        .select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'delete': {
      const { id } = data;
      const { error } = await supabase.from('meeting_attendees').delete().eq('id', id);
      return error ? { error: error.message } : { success: true };
    }
    default:
      return { error: `Unknown action: ${action}` };
  }
}

async function syncMeetingMinutes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  data: Record<string, unknown>
) {
  switch (action) {
    case 'insert': {
      const { data: result, error } = await supabase
        .from('meeting_minutes')
        .insert([data])
        .select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'update': {
      const { id, ...updates } = data;
      const { data: result, error } = await supabase
        .from('meeting_minutes')
        .update(updates)
        .eq('id', id)
        .select();
      return error ? { error: error.message } : { success: true, data: result };
    }
    case 'delete': {
      const { id } = data;
      const { error } = await supabase.from('meeting_minutes').delete().eq('id', id);
      return error ? { error: error.message } : { success: true };
    }
    default:
      return { error: `Unknown action: ${action}` };
  }
}
