'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download } from 'lucide-react'
import LeaveRequestForm from './LeaveRequestForm'
import LeaveRequestFormTemplate from './LeaveRequestFormTemplate'
import { useLeaveRequestUpdates } from '@/lib/realtime/hooks'

interface LeaveRequestSectionProps {
  staffId: string
}

export default function LeaveRequestSection({ staffId }: LeaveRequestSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dataUpdateCount, setDataUpdateCount] = useState(0)

  // Listen to real-time leave request updates for this staff
  useLeaveRequestUpdates(
    (record) => {
      if (record.staff_id === staffId) {
        console.log('[LeaveRequestSection] Leave request updated:', record)
        // Trigger a refresh after a short delay
        setTimeout(() => {
          setDataUpdateCount((prev) => prev + 1)
          window.location.reload()
        }, 500)
      }
    },
    (record) => {
      if (record.staff_id === staffId) {
        console.log('[LeaveRequestSection] New leave request:', record)
        // Trigger a refresh after a short delay
        setTimeout(() => {
          setDataUpdateCount((prev) => prev + 1)
          window.location.reload()
        }, 500)
      }
    }
  )

  const handleFormSubmit = () => {
    setSubmitted(true)
    // Reset the submitted state after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
    }, 3000)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <div className="flex items-center gap-3 text-amber-600 font-semibold">
          <Calendar size={20} />
          <h2>Leave Request</h2>
        </div>
        {dataUpdateCount > 0 && (
          <span className="text-xs text-green-600 font-medium">Auto-updated</span>
        )}
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-700 font-medium">✓ Leave request submitted successfully!</p>
          <p className="text-sm text-green-600 mt-1">Your request is pending admin approval.</p>
        </div>
      ) : showTemplate ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowTemplate(false)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium underline mb-2"
          >
            ← Back to Leave Request
          </button>
          <LeaveRequestFormTemplate />
        </div>
      ) : showForm ? (
        <div className="space-y-4">
          <LeaveRequestForm 
            staffId={staffId}
            onSuccess={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition"
          >
            <Calendar size={18} />
            Request Leave / Absent / Day Off
          </button>
          <button
            onClick={() => setShowTemplate(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition"
          >
            <Download size={18} />
            Download Form Template
          </button>
        </div>
      )}
    </div>
  )
}
