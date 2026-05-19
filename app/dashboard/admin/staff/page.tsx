'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar } from 'lucide-react'
import LeaveRequestsManagement from './LeaveRequestsManagement'
import { createClient } from '@supabase/supabase-js'

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  unique_id_number: string
  role: string
}

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<'staff' | 'leave'>('staff')
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, unique_id_number, role')
          .eq('role', 'staff')
          .order('first_name', { ascending: true })

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setStaffList(data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Manage Staff</h1>
          <p className="text-sm text-gray-500 font-medium">View and manage staff members</p>
        </div>
      </header>

      {/* Tab Navigation */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading staff members...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">Error: {error}</p>
        </div>
      ) : (
        <>
      <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 w-fit shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm uppercase tracking-widest transition-all ${
            activeTab === 'staff'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Users size={16} />
          Staff Members
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm uppercase tracking-widest transition-all ${
            activeTab === 'leave'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Calendar size={16} />
          Leave Requests
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'staff' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center">
            <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-[10px]">
              <Users size={20} />
              <h2>Staff Members ({staffList.length})</h2>
            </div>
        </div>

        {staffList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">ID Number</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody suppressHydrationWarning>
                {staffList.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{staff.first_name} {staff.last_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-blue-600 font-bold">{staff.unique_id_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">{staff.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {staff.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No staff members found</p>
          </div>
        )}
      </div>
      ) : (
        <LeaveRequestsManagement />
      )}
        </>
      )}
    </div>
  )
}