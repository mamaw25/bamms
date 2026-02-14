'use client'

import { LogIn, Monitor, User, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  unique_id_number: string;
}

export default function RegistrationSuccessModal({ user }: { user: UserData }) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold">Account Created!</h2>
          <p className="text-blue-100 mt-1">Please save your credentials below.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <User className="text-blue-600" size={20} />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                <p className="font-bold text-slate-900">{user.first_name} {user.last_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Mail className="text-blue-600" size={20} />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
            </div>
            <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Unique Kiosk ID</p>
              <p className="text-4xl font-mono font-black text-blue-700 tracking-widest">
                {user.unique_id_number}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
              <LogIn size={20} /> Go to Login
            </Link>
            <Link href="/kiosk" className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 border-2 border-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all">
              <Monitor size={20} /> Open Attendance Kiosk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}