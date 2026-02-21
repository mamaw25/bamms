'use client'

import { useState } from 'react'
import { approveLeaveRequest, rejectLeaveRequest } from '@/app/dashboard/staff/leaveActions'
import { Calendar, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'

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

export default function LeaveRequestsList({ requests, isAdmin = false, onUpdate }: { requests: LeaveRequest[]; isAdmin?: boolean; onUpdate?: () => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({})

  const handleApprove = async (requestId: string) => {
    setLoadingId(requestId)
    const result = await approveLeaveRequest(requestId, adminNotes[requestId])
    if (result.success) {
      onUpdate?.()
    }
    setLoadingId(null)
  }

  const handleReject = async (requestId: string) => {
    setLoadingId(requestId)
    const result = await rejectLeaveRequest(requestId, adminNotes[requestId])
    if (result.success) {
      onUpdate?.()
    }
    setLoadingId(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} />
      case 'rejected':
        return <XCircle size={16} />
      case 'pending':
        return <Clock size={16} />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'leave':
        return 'Leave'
      case 'absent':
        return 'Absent'
      case 'day_off':
        return 'Day Off'
      default:
        return type
    }
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No leave requests found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    {getTypeLabel(request.request_type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isAdmin && request.profiles && (
                    <>
                      <span className="font-semibold text-gray-900">
                        {request.profiles.first_name} {request.profiles.last_name}
                      </span>
                      <span className="text-gray-500">•</span>
                    </>
                  )}
                  <span className="text-gray-600">
                    {formatDate(request.start_date)} to {formatDate(request.end_date)}
                  </span>
                </div>
                {request.reason && (
                  <p className="text-xs text-gray-600 mt-1 italic">{request.reason}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-gray-500">
                  {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </p>
                <ChevronDown 
                  size={18} 
                  className={`text-gray-400 transition-transform ${expandedId === request.id ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </div>

          {expandedId === request.id && isAdmin && request.status === 'pending' && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="mb-3">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes[request.id] || ''}
                  onChange={(e) => setAdminNotes({ ...adminNotes, [request.id]: e.target.value })}
                  placeholder="Add notes for this request..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={loadingId === request.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all"
                >
                  {loadingId === request.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={loadingId === request.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all"
                >
                  {loadingId === request.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          )}

          {expandedId === request.id && request.admin_notes && (
            <div className="border-t border-gray-200 p-4 bg-blue-50 border-l-4 border-l-blue-500">
              <div className="flex items-start gap-2">
                <span className="text-lg">📝</span>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Admin Notes</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{request.admin_notes}</p>
                </div>
              </div>
            </div>
          )}

          {expandedId === request.id && !request.admin_notes && (request.status === 'approved' || request.status === 'rejected') && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 italic">No admin notes for this request</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
