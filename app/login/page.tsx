'use client'

import { loginWithID } from './action'
import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Use this function to handle the form submission manually
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await loginWithID(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Success is handled by the redirect inside the action
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-slate-900">
          System Login
        </h1>
        <p className="text-center text-slate-500 mb-8 text-sm">
          Enter your Unique ID to continue
        </p>
        
        {/* FIX: Use handleSubmit here instead of loginWithID directly */}
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Enter Your Unique ID Number
            </label>
            <input
              name="idNumber"
              type="text"
              required
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none text-slate-900 text-lg font-mono"
              placeholder="e.g. 1001"
            />
          </div>

          {/* FIX: Display the error message that was previously unused */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>

          <div className="text-center mt-4">
            <a href="/register" className="text-blue-600 text-sm font-semibold hover:underline">
              Dont have an account? Create one
            </a>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Barangay Attendance & Schedule Management System
        </p>
      </div>
    </div>
  )
}