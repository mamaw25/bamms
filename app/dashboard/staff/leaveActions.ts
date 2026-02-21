'use server'

import { createClient } from '@supabase/supabase-js'

async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Submit a leave request
export async function submitLeaveRequest(formData: FormData) {
  const supabase = await createAdminClient()
  
  const staffId = formData.get('staffId') as string
  const requestType = formData.get('requestType') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const reason = formData.get('reason') as string

  try {
    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      return { success: false, error: 'End date must be after start date' }
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        staff_id: staffId,
        request_type: requestType,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
        status: 'pending'
      })
      .select()

    if (error) {
      console.error('Leave request error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data, message: 'Leave request submitted successfully' }
  } catch (error) {
    console.error('Submit leave request error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Get leave requests for a specific staff member
export async function getStaffLeaveRequests(staffId: string) {
  const supabase = await createAdminClient()

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch leave requests error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get leave requests error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Get all pending leave requests (for admins)
export async function getPendingLeaveRequests() {
  const supabase = await createAdminClient()

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*, profiles(id, first_name, last_name, unique_id_number, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch pending requests error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get pending requests error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Approve a leave request
export async function approveLeaveRequest(requestId: string, adminNotes?: string) {
  const supabase = await createAdminClient()

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()

    if (error) {
      console.error('Approve request error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data, message: 'Leave request approved' }
  } catch (error) {
    console.error('Approve leave request error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Reject a leave request
export async function rejectLeaveRequest(requestId: string, adminNotes?: string) {
  const supabase = await createAdminClient()

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()

    if (error) {
      console.error('Reject request error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data, message: 'Leave request rejected' }
  } catch (error) {
    console.error('Reject leave request error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Get all leave requests with staff details (for admin dashboard)
export async function getAllLeaveRequests(statusFilter?: string) {
  const supabase = await createAdminClient()

  try {
    let query = supabase
      .from('leave_requests')
      .select('*, profiles(id, first_name, last_name, unique_id_number, email)')
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Fetch all requests error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get all requests error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}
