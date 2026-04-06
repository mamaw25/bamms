import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Mail, Badge, CheckCircle } from 'lucide-react';
import CalendarGrid from '@/app/dashboard/CalendarGrid';
import WFHButton from '@/app/dashboard/WFHButton';

// Client Component for dynamic date display to prevent hydration mismatch
function DateDisplay() {
  'use client';
  return (
    <div className="text-sm text-gray-500">
      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  );
}

export const revalidate = 0;

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect the route
  if (!user) redirect('/login?role=admin');

  // Fetch Profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Verify user is admin
  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch Attendance data
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id)
    .order('date', { ascending: false });

  // Calendar calculations
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfMonth = firstDay.getDay();

  // Logic to determine attendance state
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayRecord = attendance?.find(record => record.date === todayStr);
  const isWorkFromHomeToday = todayRecord?.work_from_home === true;
  const activeRecord = attendance?.find(record => record.clock_out === null);
  const isClockedIn = !!activeRecord;
  
  const finishedRecordToday = attendance?.find(
    record => record.date === todayStr && record.clock_out !== null
  );
  const finishedToday = !!finishedRecordToday;

  // Transform attendance data for calendar
  const attendanceData = attendance?.map(record => ({
    id: record.id,
    date: record.date,
    status: record.status,
    check_in: record.check_in,
    clock_out: record.clock_out,
    work_from_home: record.work_from_home,
  })) || [];

  // Stats
  const thisMonthRecords = attendance?.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === month && recordDate.getFullYear() === year;
  }) || [];

  const presentDays = thisMonthRecords.filter(r => r.status === 'present').length;
  const totalRecords = thisMonthRecords.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
        <DateDisplay />
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile?.first_name} {profile?.last_name}</h2>
                <p className="text-gray-500 text-sm">Administrator Account</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <User className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="space-y-5 border-t pt-8">
              {/* ID Number */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Badge className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Official ID</p>
                  <p className="text-lg font-semibold text-gray-800">{profile?.unique_id_number || 'N/A'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <Mail className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Email Address</p>
                  <p className="text-lg font-semibold text-gray-800 break-all">{profile?.email || user.email}</p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <CheckCircle className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-bold rounded-full uppercase tracking-wider">
                      Administrator
                    </span>
                    {profile?.email_verified && (
                      <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full uppercase tracking-wider">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-4">
          {/* Monthly Stats */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">This Month</p>
            <p className="text-4xl font-bold mb-1">{presentDays}</p>
            <p className="text-blue-100 text-sm">Days Attended</p>
            <div className="mt-4 pt-4 border-t border-blue-400/50">
              <p className="text-blue-100 text-xs">Total Records: {totalRecords}</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-4">Account Information</p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Role</p>
                <p className="font-semibold text-gray-800">Administrator</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Access Level</p>
                <p className="font-semibold text-gray-800">Full System Access</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Email Status</p>
                <p className="font-semibold text-gray-800">{profile?.email_verified ? 'Verified' : 'Not Verified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Calendar</h3>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Status and WFH Button Section */}
          <div className="mb-6">
            {!todayRecord && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-1 w-full bg-gray-50 text-gray-700 border border-gray-200 py-6 rounded-xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-widest">No Schedule for Today</p>
                  <p className="text-xs font-medium opacity-80 mt-1">You can check in for Work From Home</p>
                </div>
                <WFHButton 
                  type="in"
                  userId={user.id}
                  firstName={profile?.first_name || 'User'}
                />
              </div>
            )}
            {todayRecord && !isWorkFromHomeToday && (
              <div className="flex flex-col items-center gap-1 w-full bg-blue-50 text-blue-700 border border-blue-200 py-6 rounded-xl text-center">
                <p className="text-sm font-semibold uppercase tracking-widest">On-Site Work</p>
                <p className="text-xs font-medium opacity-80 mt-1">Not a WFH day</p>
              </div>
            )}
            {todayRecord && isWorkFromHomeToday && !isClockedIn && !finishedToday && (
              <WFHButton 
                type="in"
                userId={user.id}
                firstName={profile?.first_name || 'User'}
              />
            )}
            {todayRecord && isWorkFromHomeToday && isClockedIn && (
              <WFHButton 
                type="out"
                userId={user.id}
                firstName={profile?.first_name || 'User'}
                recordId={activeRecord?.id}
              />
            )}
            {finishedToday && (
              <div className="flex flex-col items-center gap-1 w-full bg-green-50 text-green-700 border border-green-200 py-6 rounded-xl text-center">
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm">
                  <CheckCircle size={20} className="text-green-600" /> Shift Completed
                </div>
                {finishedRecordToday?.clock_out && (
                  <p className="text-xs font-medium opacity-80 mt-1">
                    Clocked out at: {new Date(finishedRecordToday.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            )}
          </div>

          <CalendarGrid 
            daysInMonth={daysInMonth}
            firstDayOfMonth={firstDayOfMonth}
            attendanceData={attendanceData}
          />
        </div>
      </div>

      {/* Attendance History */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance History</h3>
          <p className="text-gray-500 text-sm">Recent check-ins and check-outs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance && attendance.length > 0 ? (
                  attendance.slice(0, 20).map((record, idx) => {
                    const checkInTime = record.check_in ? new Date(record.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';
                    const checkOutTime = record.clock_out ? new Date(record.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';
                    
                    let duration = '0h 0m';
                    if (record.check_in && record.clock_out) {
                      const start = new Date(record.check_in).getTime();
                      const end = new Date(record.clock_out).getTime();
                      const diffMs = end - start;
                      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
                      duration = `${diffHrs}h ${diffMins}m`;
                    }

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{record.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{checkInTime}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{checkOutTime}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{duration}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            record.work_from_home 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {record.work_from_home ? 'WFH' : 'On-Site'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No attendance records found
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
