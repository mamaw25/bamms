'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateStaff } from '../../../action';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  unique_id_number: string;
  role: string;
}

export default function EditStaffPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const { id } = await params;

        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('unique_id_number', id)
          .single();

        if (fetchError || !data) {
          throw new Error('Staff member not found');
        }

        setStaff(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load staff member');
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, [params]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!staff) return;

    setSaving(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const updates = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
    };

    try {
      await updateStaff(staff.id, updates);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard/admin/staff';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading staff member...</p>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans">
        <Link 
          href="/dashboard/admin/staff"
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors font-bold text-sm uppercase group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Staff
        </Link>
        <div className="text-center p-8">
          <p className="text-gray-600 font-medium">Staff member not found</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-black text-gray-800 tracking-tight mb-2">Edit Staff Member</h1>
        <p className="text-sm text-gray-500 font-medium mb-8">Update staff account information</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-semibold text-sm">Staff member updated successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">ID Number</p>
            <p className="text-lg font-semibold text-gray-800">{staff.unique_id_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                defaultValue={staff.first_name}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                defaultValue={staff.last_name}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
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
              defaultValue={staff.email}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Role
            </label>
            <select
              name="role"
              defaultValue={staff.role || 'staff'}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving || success}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
            >
              {saving ? 'Saving...' : success ? 'Updated!' : 'Save Changes'}
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
