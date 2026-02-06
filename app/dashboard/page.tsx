import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Calendar as CalendarIcon, LogOut, CheckCircle, Clock } from 'lucide-react';
import { signOut } from '@/app/login/action';
import CalendarGrid from './CalendarGrid'; 
import { clockIn, clockOut } from './actions'; 

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id);

  // Logic for Clock In / Clock Out states
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayRecord = attendance?.find(record => record.date === todayStr);
  
  const isClockedIn = !!todayRecord;
  const isClockedOut = !!todayRecord?.clock_out;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Official Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {profile?.first_name}!</p>
        </div>
        <form action={signOut}>
          <button className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition">
            <LogOut size={18} /> Sign Out
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-4 text-blue-600 font-semibold border-b pb-2">
            <User size={20} />
            <h2>Account Details</h2>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 font-bold uppercase">Full Name</p>
              <p className="font-medium text-gray-900">{profile?.first_name} {profile?.last_name}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-500 font-bold uppercase">Official ID</p>
              <p className="font-mono font-bold text-blue-700 text-xl">{profile?.unique_id_number}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div className="flex items-center gap-3 text-blue-600 font-semibold">
              <CalendarIcon size={20} />
              <h2>Attendance Calendar</h2>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="mb-6">
            {!isClockedIn ? (
              <form action={async () => { 'use server'; await clockIn(user.id); }}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2">
                  Check In for Today
                </button>
              </form>
            ) : !isClockedOut ? (
              <form action={async () => { 
                'use server'; 
                console.log("Clock out triggered for user:", user.id);
                const result = await clockOut(user.id); 
                console.log("Clock out result:", result);
              }}>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2">
                  <Clock size={20} /> Clock Out for Today
                </button>
              </form>
            ) : (
              <div className="w-full bg-green-50 text-green-700 border border-green-200 font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2">
                <CheckCircle size={20} /> Shift Completed
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-gray-400 mb-2 uppercase">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
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