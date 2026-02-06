'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const idNumber = searchParams.get('id')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Account Created!</h1>
        <p className="text-slate-500 mb-6 text-sm">Please save your Unique ID Number below. You will need it to log in.</p>
        
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Login ID</span>
          <div className="text-5xl font-mono font-black text-blue-600 mt-2">
            {idNumber || "----"}
          </div>
        </div>

        <Link 
          href="/login" 
          className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow-lg"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}