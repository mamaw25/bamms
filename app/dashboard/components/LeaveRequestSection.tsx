'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import LeaveRequestForm from './LeaveRequestForm'

interface LeaveRequestSectionProps {
  staffId: string
}

export default function LeaveRequestSection({ staffId }: LeaveRequestSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-700 font-medium">✓ Leave request submitted successfully!</p>
          <p className="text-sm text-green-600 mt-1">Your request is pending admin approval.</p>
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
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition"
        >
          <Calendar size={18} />
          Request Leave / Absent / Day Off
        </button>
      )}
    </div>
  )
}
