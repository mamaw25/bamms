'use client'

import { useState } from 'react'
import { signUp } from './action'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const router = useRouter()

  // This fixes the TypeScript "action" error
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const email = formData.get('email') as string
    const result = await signUp(formData)
    
    if (result?.success) {
      setSuccess(true)
      setRegisteredEmail(email)
      setVerificationToken(result.verification_token || null)
      setLoading(false)
    } else {
      setError(result?.error || "Something went wrong")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white text-center uppercase mb-4">
              Account Created!
            </h2>
            <p className="text-slate-300 mb-4">
              We've sent a verification email to:
            </p>
            <p className="text-blue-400 font-bold mb-6 break-all">{registeredEmail}</p>
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6">
              <p className="text-slate-300 text-sm">
                Please click the link in the email to verify your address. The link will expire in 24 hours.
              </p>
            </div>
            
            {verificationToken && (
              <details className="mb-6 p-3 bg-slate-800/50 border border-slate-600 rounded-lg">
                <summary className="text-slate-300 text-xs cursor-pointer font-semibold hover:text-slate-200">
                  ⚠️ Didn't receive email? Click here for manual verification
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-slate-400 text-xs mb-2">
                    Copy and paste this link in your browser:
                  </p>
                  <div className="bg-[#0f172a] p-2 rounded border border-slate-700 mb-3">
                    <code className="text-blue-400 text-xs break-all">
                      {`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`}
                    </code>
                  </div>
                  <button
                    onClick={() => {
                      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                      window.location.href = `${appUrl}/verify-email?token=${verificationToken}`
                    }}
                    className="w-full text-xs bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold transition-all"
                  >
                    Verify Email Now
                  </button>
                </div>
              </details>
            )}
            
            <p className="text-slate-400 text-xs mb-6">
              Once verified, you'll be able to log in to the system.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold uppercase tracking-widest transition-all"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                setSuccess(false)
                setRegisteredEmail(null)
              }}
              className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest transition-all"
            >
              Register Another Account
            </button>
          </div>
        </div>
      </div>
    )
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
