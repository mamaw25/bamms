import Link from 'next/link';
import { Users, ClipboardList, LogOut, LayoutDashboard, Calendar } from 'lucide-react';
import { signOut } from '@/app/register/action';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect the route - only admins can access
  if (!user) redirect('/login?role=admin');
  
  // Fetch admin profile to check role
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (adminProfile?.role !== 'admin') redirect('/dashboard');

  // Bind the signout to redirect to the Blue Portal (Admin Login)
  const logoutAction = signOut.bind(null, '/login?role=admin');

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col p-6 shadow-xl sticky top-0 h-screen">
        
        {/* Navigation Section */}
        <div className="flex-1">
          <Link href="/dashboard/admin" className="flex items-center gap-3 mb-10 px-2 hover:opacity-80 transition-opacity group">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold tracking-tight text-xl uppercase">Admin Panel</span>
          </Link>

          <nav className="space-y-2">
            <Link 
              href="/dashboard/admin/attendance" 
              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group"
            >
              <ClipboardList size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Attendance Report</span>
            </Link>
            <Link 
              href="/dashboard/admin/staff" 
              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group"
            >
              <Users size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Manage Staff</span>
            </Link>
            <Link 
              href="/dashboard/admin/meetings" 
              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group"
            >
              <Calendar size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Barangay Meetings</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Sign Out Section */}
        <div className="pt-6 border-t border-white/10">
          <form action={logoutAction}>
            <button 
              type="submit" 
              className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </form>
          <div className="mt-4 px-3 opacity-30">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SYSTEM V1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}