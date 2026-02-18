import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { StaffActionButtons } from './StaffActionButtons';

export default async function StaffManagementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect the route - only admins can access
  if (!user) redirect('/login');
  
  // Fetch admin profile to check role
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (adminProfile?.role !== 'admin') redirect('/dashboard');

  // Fetch all staff members
  const { data: staffMembers } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'admin')
    .order('first_name', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Manage Staff</h1>
          <p className="text-sm text-gray-500 font-medium">View and manage staff members</p>
        </div>
      </header>

      {/* Staff List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-[10px]">
            <Users size={20} />
            <h2>Staff Members ({staffMembers?.length || 0})</h2>
          </div>
          <Link href="/dashboard/admin/staff/add">
            <button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
              <Plus size={16} /> Add Staff
            </button>
          </Link>
        </div>

        {staffMembers && staffMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">ID Number</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
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
                    <td className="px-6 py-4">
                      <StaffActionButtons
                        staffId={staff.id}
                        firstName={staff.first_name}
                        lastName={staff.last_name}
                        uniqueId={staff.unique_id_number}
                      />
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
    </div>
  );
}