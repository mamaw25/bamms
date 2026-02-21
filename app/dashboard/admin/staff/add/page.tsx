'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { addStaffMember } from './action';

export default function AddStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [staffEmail, setStaffEmail] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const result = await addStaffMember(formData);

      if (result.success) {
        setSuccess(true);
        setVerificationToken(result.verification_token || null);
        setStaffEmail(formData.get('email') as string);
      } else {
        setError(result.error || 'An error occurred');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Back Button */}
      <Link 
        href="/dashboard/admin/staff"
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors font-bold text-sm uppercase group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Staff
      </Link>

      {/* Form Container */}
      <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight mb-2">Add New Staff Member</h1>
        <p className="text-sm text-gray-500 font-medium mb-8">Create a new staff account with login credentials</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-semibold text-sm mb-3">Staff member created successfully! A verification email has been sent to {staffEmail}</p>
            {verificationToken && (
              <details className="text-sm">
                <summary className="text-green-700 font-semibold cursor-pointer hover:text-green-800">
                  📧 Show verification link
                </summary>
                <div className="mt-2 pt-2 border-t border-green-300">
                  <p className="text-green-700 text-xs mb-2">Share this link with the staff member to verify their email:</p>
                  <div className="bg-white p-2 rounded border border-green-300">
                    <code className="text-blue-600 text-xs break-all">
                      {`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`}
                    </code>
                  </div>
                </div>
              </details>
            )}
            <div className="flex gap-3 mt-4 pt-3 border-t border-green-300">
              <button
                onClick={() => router.push('/dashboard/admin/staff')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm uppercase transition-all"
              >
                Back to Staff List
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setVerificationToken(null);
                  setStaffEmail(null);
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-4 py-2 rounded font-bold text-sm uppercase transition-all"
              >
                Add Another Staff
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Unique ID Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="uniqueId"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="EMP001"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Role
            </label>
            <select
              name="role"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
            >
              {loading ? 'Creating...' : success ? 'Created!' : 'Add Staff Member'}
            </button>
            <Link href="/dashboard/admin/staff" className="flex-1">
              <button
                type="button"
                className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
