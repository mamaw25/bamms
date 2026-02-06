'use client'

import { signUp } from './action'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-slate-900">Create Account</h1>
        <p className="text-center text-slate-500 mb-8">Join the Barangay Management System</p>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-blue-500 outline-none"
            />
          </div>

          {/* New Role Selection Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-bold text-slate-700 mb-1">Designated Role</label>
            <select
              id="role"
              name="role"
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-slate-900 bg-white focus:border-blue-500 outline-none"
            >
              <option value="official">Barangay Official</option>
              <option value="admin">Admin (Requires Verification)</option>
            </select>
            <p className="text-xs text-slate-400 mt-1 italic">*Accounts must be verified by a Super Admin before access is granted.</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 mt-4 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>

          <div className="text-center mt-6">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}