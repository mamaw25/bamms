'use client'

import { useState } from 'react'
import { handleKioskAction } from './action'

export default function KioskPage() {
  const [idNumber, setIdNumber] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await handleKioskAction(idNumber)

    if (result.success) {
      setMessageType('success')
      setMessage(result.message)
      setIdNumber('')
    } else {
      setMessageType('error')
      setMessage(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Kiosk Clock In/Out</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your ID number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !idNumber}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
