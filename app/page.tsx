'use client';

import { useState, useEffect, useRef } from 'react';
import { Fingerprint, CheckCircle, AlertCircle, Loader2, User, ShieldCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { handleKioskAction } from './dashboard/actions';

export default function KioskLandingPage() {
  const [idNumber, setIdNumber] = useState('');
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on load and after interactions
  useEffect(() => {
    if (!isLoading && status.type === null) {
      inputRef.current?.focus();
    }
  }, [isLoading, status.type]);

  const processAction = async () => {
    if (!idNumber || isLoading) return;
    setIsLoading(true);
    setStatus({ msg: '', type: null });

    try {
      const res = await handleKioskAction(idNumber);
      if (res.success) {
        setStatus({ msg: res.message || 'SUCCESSFULLY RECORDED', type: 'success' });
        setIdNumber(''); 
      } else {
        setStatus({ msg: res.error || 'ERROR OCCURRED', type: 'error' });
      }
    } catch (error) {
      console.error("Kiosk Error:", error);
      setStatus({ msg: 'CONNECTION ERROR', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ msg: '', type: null }), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-white font-sans">
      
      {/* Main Kiosk Box */}
      <div className="bg-[#1e293b] pt-10 px-8 pb-8 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md text-center transition-all">
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-300 ${
          status.type === 'success' ? 'bg-green-600' : 
          status.type === 'error' ? 'bg-red-600 animate-pulse' : 
          'bg-[#2563eb]'
        }`}>
          {isLoading ? <Loader2 size={32} className="animate-spin" /> : <Fingerprint size={32} />}
        </div>
        
        <h1 className="text-2xl font-black mb-1 uppercase tracking-tight">Attendance Kiosk</h1>
        <p className="text-slate-400 mb-6 text-sm font-medium">Enter ID and press Enter</p>

        <div className="relative mb-6">
          <input
            ref={inputRef}
            type="text"
            placeholder="ID NUMBER"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && processAction()}
            autoComplete="off"
            className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-xl px-4 py-4 text-3xl text-center font-bold tracking-[0.2em] focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-800 text-white"
          />
        </div>

        {/* Minimal One-Line Navigation */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest border-t border-slate-700/50 pt-6">
          <Link href="/login?role=staff" className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition-colors">
            <User size={12} />
            <span>Staff Login</span>
          </Link>
          
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          
          <Link href="/login?role=admin" className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors">
            <ShieldCheck size={12} />
            <span>Admin Login</span>
          </Link>
          
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          
          <Link href="/register" className="flex items-center gap-1 text-white hover:text-slate-300 transition-colors">
            <UserPlus size={12} />
            <span>Register</span>
          </Link>
        </div>

        {/* Feedback Message */}
        <div className="h-auto">
          {status.type && (
            <div className={`mt-4 p-3 rounded-xl flex items-center justify-center gap-2 border animate-in fade-in slide-in-from-top-2 ${
              status.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
              <span className="font-bold text-[11px] tracking-wide uppercase">{status.msg}</span>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-slate-600 text-[9px] font-mono uppercase tracking-[0.4em] opacity-50">
        Barangay Management System
      </p>
    </div>
  );
}