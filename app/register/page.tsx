'use client'

import { useState } from 'react'
import { signUp } from './action'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // This wrapper function fixes the TypeScript "action" error
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await signUp(formData)
    
    if (result?.success) {
      // Redirect on success
      router.push('/login?role=staff')
    } else {
      setError(result?.error || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-black text-white text-center uppercase mb-6">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg text-center">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" placeholder="First Name" required className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
            <input name="lastName" placeholder="Last Name" required className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
          </div>
          <input name="email" type="email" placeholder="Email" required className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
          <input name="password" type="password" placeholder="Password" required className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
          <input name="adminCode" placeholder="Admin Code (Optional)" className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
          
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}