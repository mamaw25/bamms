
import { getAttendanceReport, AttendanceReport } from './action';
import { Calendar, Users, Filter, X } from 'lucide-react';
import Link from 'next/link';
import ExportButton from './ExportButton';
import { AdminReportRealtime } from './AdminReportRealtime';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Helper function to format time consistently using ISO string parsing
// This prevents hydration mismatch by using UTC time
function formatTimeForServer(dateString: string | null): string {
  if (!dateString) return '--:--:--';
  // Parse the ISO string directly without creating Date object
  // ISO format: "2024-01-01T14:30:45.123Z"
  const match = dateString.match(/T(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}:${match[3]}`;
  }
  return '--:--:--';
}

export const revalidate = 0;

export default async function AdminReportingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  // Verify admin access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const selectedDate = params.date;
  const reports: AttendanceReport[] = await getAttendanceReport(selectedDate);

  return (
    <AdminReportRealtime>
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-[#f0f4fb] min-h-screen"
        suppressHydrationWarning
      >
        <div className="max-w-6xl mx-auto text-gray-900">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1A4480]">Attendance Report</h1>
              <p className="text-gray-500 font-medium">Monitoring staff activity and work hours</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Action points to the attendance subfolder now */}
              <form action="/dashboard/admin" method="GET" className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-[#1A4480]/20 shadow-sm hover:border-[#1A4480] focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#1A4480] transition-all">
                <label className="flex items-center cursor-pointer px-2 gap-2">
                  <Calendar size={18} className="text-[#1A4480]" />
                  <input 
                    type="date" 
                    name="date"
                    defaultValue={selectedDate || ''}
                    className="outline-none text-sm font-bold bg-transparent cursor-pointer text-gray-700"
                  />
                </label>
                
                <div className="flex items-center gap-1 border-l pl-1 border-gray-100">
                  <button type="submit" title="Apply Filter" className="bg-blue-50 hover:bg-[#1A4480] text-[#1A4480] hover:text-white p-2 rounded-lg transition-colors">
                    <Filter size={16} />
                  </button>
                  {selectedDate && (
                    <Link href="/dashboard/admin" title="Clear Filter" className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                      <X size={16} />
                    </Link>
                  )}
                </div>
              </form>
              <ExportButton data={reports} />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#1A4480]/10 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-[#1A4480]">
                <Users size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#1A4480]">{reports.length}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {selectedDate ? `Records on ${selectedDate}` : 'Total Records'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#1A4480]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-[#1A4480]/5 to-blue-50/5 border-b border-[#1A4480]/10">
                  <tr>
                    <th className="px-6 py-5 text-xs font-bold text-[#1A4480] uppercase tracking-widest">Staff Member</th>
                    <th className="px-6 py-5 text-xs font-bold text-[#1A4480] uppercase tracking-widest">Date</th>
                    <th className="px-6 py-5 text-xs font-bold text-[#1A4480] uppercase tracking-widest">In/Out Times</th>
                    <th className="px-6 py-5 text-xs font-bold text-[#1A4480] uppercase tracking-widest">Duration</th>
                    <th className="px-6 py-5 text-xs font-bold text-[#1A4480] uppercase tracking-widest">Location</th>
                    <th className="px-6 py-5 text-xs font-bold text-[#1A4480] uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A4480]/5" suppressHydrationWarning>
                  {reports.length > 0 ? (
                    reports.map((row) => (
                      <tr key={row.id} className="hover:bg-[#1A4480]/5 transition-colors group" suppressHydrationWarning>
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/admin/staff/${row.profiles.unique_id_number}`} className="block group-hover:text-[#1A4480] transition-colors">
                            <div className="font-bold">{row.profiles.first_name} {row.profiles.last_name}</div>
                            <div className="text-xs text-gray-400 font-mono tracking-tighter">{row.profiles.unique_id_number}</div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{row.date}</td>
                        <td className="px-4 py-4">
                          <div className="text-[11px] font-bold text-[#1A4480] uppercase">
                            IN: {formatTimeForServer(row.check_in)}
                          </div>
                          {row.clock_out ? (
                            <div className="text-[11px] font-bold text-orange-600 uppercase">
                              OUT: {formatTimeForServer(row.clock_out)}
                            </div>
                          ) : (
                            <div className="text-[10px] font-black text-green-500 mt-1 tracking-tighter">● ON SITE</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-700">{row.duration}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            row.work_from_home ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-[#1A4480]/10 text-[#1A4480] border-[#1A4480]/20'
                          }`}>
                            {row.work_from_home ? 'WFH' : 'On-Site'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            row.clock_out ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-50 text-green-600 border-green-100'
                          }`}>
                            {row.clock_out ? 'Finished' : 'Working'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                        No attendance records found for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminReportRealtime>
  );
}
