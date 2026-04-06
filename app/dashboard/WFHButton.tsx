'use client'

import { useState } from 'react'
import { Briefcase, Loader2 } from 'lucide-react'
import { workFromHomeCheckIn, workFromHomeCheckOut } from './actions'

interface WFHButtonProps {
  type: 'in' | 'out'
  firstName: string
  userId: string
  recordId?: string
}

export default function WFHButton({ type, firstName, userId, recordId }: WFHButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const isCheckIn = type === 'in'

  const handleAction = async () => {
    setLoading(true)
    try {
      let result
      if (isCheckIn) {
        result = await workFromHomeCheckIn(userId, firstName)
      } else {
        result = await workFromHomeCheckOut(userId, firstName, recordId)
      }
      
      if (result.success) {
        // Refresh the page to show updated state
        window.location.reload()
      } else {
        alert(result.error || 'Action failed')
      }
    } catch (error) {
      console.error('WFH action failed:', error)
      alert('An error occurred')
    } finally {
      setShowModal(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`w-full font-bold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 ${
          isCheckIn
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-purple-500 hover:bg-purple-600 text-white'
        }`}
      >
        {isCheckIn ? (
          <>
            <Briefcase size={20} /> Work From Home - Check In
          </>
        ) : (
          <>
            <Briefcase size={20} /> Work From Home - Check Out
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Briefcase size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {isCheckIn ? 'Work From Home Check In' : 'Work From Home Check Out'}
              </h3>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {isCheckIn
                ? `${firstName}, you are about to check in for Work From Home. Your check-in time will be recorded.`
                : `${firstName}, you are about to check out from Work From Home. Your check-out time will be recorded.`}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={loading}
                className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  isCheckIn
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  isCheckIn ? 'Check In' : 'Check Out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
