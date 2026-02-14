'use client'

import { signUp } from './action'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import RegistrationSuccessModal from './RegisterSuccessModal'

// Define the type to avoid 'any' error
interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  unique_id_number: string;
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signUp(formData)
    
    if (result?.success && result.user) {
      setUserData(result.user)
    } else {
      setError(result?.error || "Registration failed")
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      {/* ... Your Existing Form JSX ... */}
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-slate-900">Create Account</h1>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter a password (min 6 characters)"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-slate-900 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 mt-4 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>
      </div>

      {userData && <RegistrationSuccessModal user={userData} />}
    </div>
  )
}