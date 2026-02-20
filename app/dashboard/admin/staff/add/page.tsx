'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AddStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const uniqueId = formData.get('uniqueId') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    try {
      const supabase = createClient();

      // 1. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user?.id) {
        throw new Error('Failed to create user');
      }

      // 2. Create the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          unique_id_number: uniqueId,
          role: role || 'staff',
        });

      if (profileError) {
        // Cleanup: delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error('Failed to create staff profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/admin/staff');
      }, 2000);
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
            <p className="text-green-600 font-semibold text-sm">Staff member created successfully! Redirecting...</p>
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
