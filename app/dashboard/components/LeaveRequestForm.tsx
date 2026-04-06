'use client'

import { useState } from 'react'
import { submitLeaveRequest } from '@/app/dashboard/staff/leaveActions'
import { AlertCircle } from 'lucide-react'

export default function LeaveRequestForm({ staffId, onSuccess, onCancel }: { staffId: string; onSuccess?: () => void; onCancel?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    requestType: 'sick_leave',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formDataObj = new FormData()
    formDataObj.append('staffId', staffId)
    formDataObj.append('requestType', formData.requestType)
    formDataObj.append('startDate', formData.startDate)
    formDataObj.append('endDate', formData.endDate)
    formDataObj.append('reason', formData.reason)

    const result = await submitLeaveRequest(formDataObj)

    if (result.success) {
      setSuccess(true)
      setFormData({ requestType: 'sick_leave', startDate: '', endDate: '', reason: '' })
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } else {
      setError(result.error || 'Failed to submit request')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Submit Leave Request</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
            ✓
          </div>
          <p className="text-green-700 text-sm font-medium">Request submitted successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
            Request Type <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.requestType}
            onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
          >
            <option value="sick_leave">Sick Leave</option>
            <option value="maternity_leave">Maternity Leave</option>
            <option value="paternity_leave">Paternity Leave</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Start Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              End Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
            Reason <span className="text-red-600">*</span>
          </label>
          <textarea
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Provide a reason for your request..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest transition-all"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold uppercase tracking-widest transition-all mt-2"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  )
}
