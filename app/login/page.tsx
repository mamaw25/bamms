'use client'

import { useState } from 'react'
import { login } from './action'
import Link from 'next/link'
import { Monitor, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    
    // The build error is resolved because we are now using 'login' 
    // which matches the exported function in action.ts
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-slate-900">Sign In</h1>
        <p className="text-center text-slate-500 mb-8">Access your official dashboard</p>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-900" 
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">
              Attendance System
            </span>
          </div>
        </div>

        <Link 
          href="/kiosk" 
          className="flex items-center justify-center gap-2 w-full bg-white text-slate-700 border-2 border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition shadow-sm active:scale-[0.98]"
        >
          <Monitor size={18} className="text-blue-600" />
          Open Attendance Kiosk
        </Link>

        <p className="text-center mt-6 text-sm text-slate-500">
          Don&apos;t have an account? {' '}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}