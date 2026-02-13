'use client'

import { useState, useEffect, useRef } from 'react';
import { handleKioskAction } from './dashboard/actions';
import { Fingerprint, CheckCircle, AlertCircle, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function KioskLandingPage() {
  const [idNum, setIdNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  
  // Create a reference to the input element
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-refocus logic: keeps the cursor in the input box at all times
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) inputRef.current.focus();
    };

    // Initial focus
    focusInput();

    // Re-focus if the user clicks anywhere on the screen
    window.addEventListener('click', focusInput);
    
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('click', focusInput);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNum || loading) return;

    setLoading(true);
    const res = await handleKioskAction(idNum);
    
    if (res.success) {
      setStatus({ 
        msg: 'Success!', 
        type: 'success' 
      });
      setIdNum(''); 
    } else {
      setStatus({ 
        msg: res.error ?? 'Action failed', 
        type: 'error' 
      });
    }
    
    setLoading(false);
    
    // Auto-refocus after submitting
    if (inputRef.current) inputRef.current.focus();

    setTimeout(() => setStatus({ msg: '', type: null }), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white relative font-sans">
      <Link href="/login" className="absolute top-6 right-6 text-slate-500 hover:text-blue-400 transition flex items-center gap-2 text-sm font-semibold">
        <Lock size={14} /> ADMIN
      </Link>

      <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md text-center">
        <div className="bg-[#2563eb] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <Fingerprint size={40} />
        </div>
        
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Attendance Kiosk</h1>
        <p className="text-slate-400 mb-8 font-medium">Enter ID and press Enter</p>

        <form onSubmit={handleSubmit}>
          <input 
            ref={inputRef}
            autoFocus
            type="text" 
            placeholder="ID NUMBER"
            value={idNum}
            onChange={(e) => setIdNum(e.target.value)}
            disabled={loading}
            className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-xl px-6 py-5 text-4xl text-center font-mono mb-2 focus:border-blue-500 focus:outline-none transition-all text-white disabled:opacity-50 placeholder:text-slate-800"
          />
          <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-black opacity-50">Press Enter to Submit</p>
        </form>

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        )}

        {status.type && !loading && (
          <div className={`mt-4 p-4 rounded-xl flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status.type === 'success' ? <CheckCircle size={22}/> : <AlertCircle size={22}/>}
            <span className="font-bold text-sm tracking-tight">{status.msg}</span>
          </div>
        )}
      </div>

      <p className="mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
        Barangay Management System
      </p>
    </div>
  );
}