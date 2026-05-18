'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    !token ? 'error' : 'loading'
  )
  const [message, setMessage] = useState(
    !token ? 'No verification token provided' : ''
  )

  useEffect(() => {
    if (!token) {
      return
    }

    // Call the verification endpoint
    fetch(`/api/verify-email?token=${token}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setStatus('success')
          setMessage(data.message || 'Your email has been verified successfully!')
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?role=staff&verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to verify email')
        }
      })
      .catch(error => {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('An error occurred during verification. Please try again or contact support.')
      })
  }, [token, router])

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <h1 className="text-2xl font-black text-white uppercase mb-4">
                Verifying Email
              </h1>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-slate-400">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
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
              <h1 className="text-2xl font-black text-green-500 uppercase mb-4">
                Email Verified!
              </h1>
              <p className="text-slate-300 mb-4">{message}</p>
              <p className="text-slate-400 text-sm">
                Redirecting to login in 3 seconds...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-red-500 uppercase mb-4">
                Verification Failed
              </h1>
              <p className="text-slate-300 mb-6">{message}</p>
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold uppercase tracking-widest transition-all"
              >
                Try Again
              </button>
              <p className="text-slate-400 text-sm mt-4">
                If you continue to have issues, please contact support.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
