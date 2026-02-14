import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Calendar as CalendarIcon, LogOut, CheckCircle } from 'lucide-react';
import { signOut } from '@/app/login/action';
import CalendarGrid from './CalendarGrid'; 
import { clockIn, clockOut } from './actions'; 
import ActionButton from './ActionButton'; 

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect the route
  if (!user) redirect('/login');

  // Fetch Profile and Attendance data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id)
    .order('date', { ascending: false });

  // Logic to determine attendance state
  const activeRecord = attendance?.find(record => record.clock_out === null);
  const isClockedIn = !!activeRecord;
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const finishedRecordToday = attendance?.find(
    record => record.date === todayStr && record.clock_out !== null
  );
  const finishedToday = !!finishedRecordToday;

  // Calendar calculations
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Official Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {profile?.first_name}!</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition">
            <LogOut size={18} /> Sign Out
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Details Sidebar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-4 text-blue-600 font-semibold border-b pb-2">
            <User size={20} />
            <h2>Account Details</h2>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Full Name</p>
              <p className="font-medium text-gray-900">{profile?.first_name} {profile?.last_name}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Official ID</p>
              <p className="font-mono font-bold text-blue-700 text-xl">{profile?.unique_id_number}</p>
            </div>
          </div>
        </div>

        {/* Main Attendance Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div className="flex items-center gap-3 text-blue-600 font-semibold">
              <CalendarIcon size={20} />
              <h2>Attendance Calendar</h2>
            </div>
          </div>

          <div className="mb-6">
            {!isClockedIn && !finishedToday ? (
              /* Pass the server action to the onConfirm prop */
              <ActionButton 
                type="in" 
                firstName={profile?.first_name || 'User'} 
                onConfirm={async () => {
                  'use server';
                  await clockIn(user.id, profile?.first_name || 'User');
                }}
              />
            ) : isClockedIn ? (
              <ActionButton 
                type="out" 
                firstName={profile?.first_name || 'User'} 
                onConfirm={async () => {
                  'use server';
                  await clockOut(user.id, profile?.first_name || 'User', activeRecord?.id);
                }}
              />
            ) : (
              /* Shift Completed State */
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
            attendanceData={attendance || []} 
          />
        </div>
      </div>
    </div>
  );
}