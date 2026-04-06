'use client';

import { User, ShieldCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-white font-sans">
      
      <div className="bg-[#1e293b] px-8 py-12 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-2xl text-center">
        
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Barangay Portal</h1>
        <p className="text-slate-400 mb-12 text-sm font-medium">Select your access point</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Staff Login */}
          <Link href="/login?role=staff" className="group">
            <div className="bg-[#0f172a] border-2 border-slate-700 hover:border-emerald-500 rounded-2xl p-8 transition-all hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-emerald-600 group-hover:bg-emerald-500 transition-colors">
                <User size={28} />
              </div>
              <h2 className="text-lg font-bold mb-2">Staff</h2>
              <p className="text-slate-400 text-xs">Staff portal login</p>
            </div>
          </Link>

          {/* Admin Login */}
          <Link href="/login?role=admin" className="group">
            <div className="bg-[#0f172a] border-2 border-slate-700 hover:border-blue-600 rounded-2xl p-8 transition-all hover:shadow-lg hover:shadow-blue-600/20 cursor-pointer">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-blue-700 group-hover:bg-blue-600 transition-colors">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-lg font-bold mb-2">Admin</h2>
              <p className="text-slate-400 text-xs">Admin dashboard</p>
            </div>
          </Link>

          {/* Register */}
          <Link href="/register" className="group">
            <div className="bg-[#0f172a] border-2 border-slate-700 hover:border-purple-500 rounded-2xl p-8 transition-all hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-purple-600 group-hover:bg-purple-500 transition-colors">
                <UserPlus size={28} />
              </div>
              <h2 className="text-lg font-bold mb-2">Register</h2>
              <p className="text-slate-400 text-xs">Create new account</p>
            </div>
          </Link>

        </div>

      </div>
      
      <p className="mt-8 text-slate-600 text-[11px] font-mono uppercase tracking-[0.3em]">
        Attendance Management System
      </p>
    </div>
  );
}