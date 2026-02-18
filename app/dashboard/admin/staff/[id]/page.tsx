import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, IdCard } from 'lucide-react';

export default async function StaffDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch profile data using the unique ID from URL
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('unique_id_number', id)
    .single();

  if (!profile) return notFound();

  // 2. Fetch related attendance history
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', profile.id)
    .order('date', { ascending: false });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <Link 
        href="/dashboard/admin" 
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors font-bold text-sm uppercase group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Report
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Header Section */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                {profile.first_name} {profile.last_name}
              </h1>
              <div className="flex items-center gap-2 text-blue-600 font-bold tracking-widest uppercase text-sm mt-1">
  <IdCard size={16} />
  <span>
    ID: {id} • {
      // Logic: If the role in DB is 'admin', show ADMIN. Otherwise, show STAFF.
      profile.role?.toLowerCase() === 'admin' ? 'ADMIN' : 'STAFF'
    }
  </span>
</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-lg font-semibold text-slate-700">{profile.email}</p>
            </div>
          </div>

          {/* Attendance Section */}
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            Attendance History
          </h3>

          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attendance && attendance.length > 0 ? (
                  attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{record.date}</td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">
                        {record.check_in 
                          ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : '--:--'}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">
                        {record.clock_out 
                          ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : '--:--'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-black rounded-md uppercase border ${
                          record.clock_out 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {record.clock_out ? 'Completed' : 'On Duty'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}