// app/dashboard/admin/attendance/page.tsx
import { getAttendanceReport, AttendanceReport } from './action';
import { Calendar, Users, Filter, X } from 'lucide-react';
import Link from 'next/link';
import ExportButton from './ExportButton';

export const revalidate = 0;

// Note: In Next.js 15, searchParams is a Promise
export default async function AdminReportingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date;
  const reports: AttendanceReport[] = await getAttendanceReport(selectedDate);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto text-gray-900">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Report</h1>
            <p className="text-gray-500 font-medium">Monitoring staff activity and work hours</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Action points to the attendance subfolder now */}
            <form action="/dashboard/admin" method="GET" className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
              <label className="flex items-center cursor-pointer px-2 gap-2">
                <Calendar size={18} className="text-gray-400" />
                <input 
                  type="date" 
                  name="date"
                  defaultValue={selectedDate || ''}
                  className="outline-none text-sm font-bold bg-transparent cursor-pointer text-gray-700"
                />
              </label>
              
              <div className="flex items-center gap-1 border-l pl-1 border-gray-100">
                <button type="submit" title="Apply Filter" className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white p-2 rounded-lg transition-colors">
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl font-black">{reports.length}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                {selectedDate ? `Records on ${selectedDate}` : 'Total Records'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Staff Member</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">In/Out Times</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.length > 0 ? (
                  reports.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/admin/staff/${row.profiles.unique_id_number}`} className="block group-hover:text-blue-600 transition-colors">
                          <div className="font-bold">{row.profiles.first_name} {row.profiles.last_name}</div>
                          <div className="text-xs text-gray-400 font-mono tracking-tighter">{row.profiles.unique_id_number}</div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{row.date}</td>
                      <td className="px-4 py-4">
                        <div className="text-[11px] font-bold text-blue-600 uppercase">
                          IN: {new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        {row.clock_out ? (
                          <div className="text-[11px] font-bold text-orange-600 uppercase">
                            OUT: {new Date(row.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        ) : (
                          <div className="text-[10px] font-black text-green-500 animate-pulse mt-1 tracking-tighter">● ON SITE</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-700">{row.duration}</td>
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
  );
}