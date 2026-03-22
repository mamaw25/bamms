
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import ExportButton from './ExportButton';
import { AdminAttendanceRealtime } from './AdminAttendanceRealtime';

export default async function AttendancePage() {
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

  // Fetch all attendance records with staff details
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*, profiles(first_name, last_name, unique_id_number, email, role)')
    .order('date', { ascending: false });

  return (
    <AdminAttendanceRealtime>
      <div className="min-h-screen bg-gray-50 p-6 font-sans">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Attendance Report</h1>
            <p className="text-sm text-gray-500 font-medium">Monitoring staff activity and work hours</p>
          </div>
          <ExportButton attendance={attendance || []} />
        </header>

        {/* Attendance Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {attendance && attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Staff Member</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">In/Out Times</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => {
                    const formatTime = (dateString: string | null) => {
                      if (!dateString) return '--:--';
                      try {
                        const date = new Date(dateString);
                        const hours = date.getHours();
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const displayHours = hours % 12 || 12;
                        return `${displayHours}:${minutes} ${ampm}`;
                      } catch {
                        return '--:--';
                      }
                    };

                    const formatDate = (dateString: string) => {
                      try {
                        const date = new Date(dateString);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${month}/${day}/${year}`;
                      } catch {
                        return dateString;
                      }
                    };
                    
                    const clockInTime = formatTime(record.check_in);
                    const clockOutTime = formatTime(record.clock_out);
                    const isCompleted = !!record.clock_out;

                    return (
                      <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{record.profiles?.first_name} {record.profiles?.last_name}</div>
                          <div className="text-xs text-gray-500 font-mono">{record.profiles?.unique_id_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <Calendar size={14} />
                            {formatDate(record.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
                                <Clock size={12} className="text-blue-600" />
                              </span>
                              <span className="text-xs font-bold text-blue-600">IN: {clockInTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100">
                                <Clock size={12} className="text-orange-600" />
                              </span>
                              <span className="text-xs font-bold text-orange-600">OUT: {clockOutTime}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isCompleted ? 'Completed' : 'On Duty'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No attendance records found</p>
            </div>
          )}
        </div>
      </div>
    </AdminAttendanceRealtime>
  );
}
