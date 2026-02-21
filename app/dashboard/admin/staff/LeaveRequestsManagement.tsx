'use client'

import { useState, useEffect } from 'react'
import { getAllLeaveRequests } from '@/app/dashboard/staff/leaveActions'
import LeaveRequestsList from '@/app/dashboard/components/LeaveRequestsList'
import LeaveRequestsExportButton from './LeaveRequestsExportButton'
import { Calendar, Loader } from 'lucide-react'

interface LeaveRequest {
  id: string
  staff_id: string
  request_type: string
  start_date: string
  end_date: string
  reason?: string
  status: string
  admin_notes?: string
  created_at: string
  profiles?: {
    id: string
    first_name: string
    last_name: string
    unique_id_number: string
    email: string
  }
}

export default function LeaveRequestsManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')

  const loadRequests = async () => {
    setLoading(true)
    // Fetch all requests for export
    const allResult = await getAllLeaveRequests('all')
    if (allResult.success) {
      setAllRequests(allResult.data || [])
    }
    
    // Fetch filtered requests for display
    const result = await getAllLeaveRequests(statusFilter)
    if (result.success) {
      setRequests(result.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Leave Requests Management</h2>
        <p className="text-sm text-gray-500 font-medium">View and manage staff leave, absent, and day-off requests</p>
      </div>

      <div className="flex gap-2 flex-wrap items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && requests.length > 0 && (
                <span className="ml-2 inline-block px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
        <LeaveRequestsExportButton allRequests={allRequests} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader size={32} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <LeaveRequestsList requests={requests} isAdmin={true} onUpdate={loadRequests} />
      )}
    </div>
  )
}
