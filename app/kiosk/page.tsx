'use client'

import { useState, useEffect, useRef } from 'react';
import { handleKioskAction } from '../dashboard/actions';
import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function KioskPage() {
  const [idNumber, setIdNumber] = useState('');
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Snappy refocus whenever loading stops or status clears
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
      setIsLoading(false); // Stop loading animation immediately

      if (res.success) {
        setStatus({ 
          msg: res.message || 'SUCCESSFULLY RECORDED', 
          type: 'success' 
        });
        setIdNumber(''); 
      } else {
        setStatus({ 
          msg: res.error || 'ERROR OCCURRED', 
          type: 'error' 
        });
      }
    } catch {
      setIsLoading(false);
      setStatus({ msg: 'CONNECTION ERROR', type: 'error' });
    } finally {
      // Message clears after 3.5s, shrinking the box back to original size
      setTimeout(() => {
        setStatus({ msg: '', type: null });
      }, 3500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processAction();
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-[#0f172a]" />;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-white font-sans">
      {/* 1. Dimensional change: Switched to pt-10 and pb-8 to match the centered look */}
      <div className="bg-[#1e293b] pt-10 px-10 pb-8 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md text-center transition-all duration-500">
        
        {/* 2. Biometric Logo: Red for errors (including already logged in) */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-300 ${
          status.type === 'success' ? 'bg-green-600 scale-110 shadow-green-500/20' : 
          status.type === 'error' ? 'bg-red-600 shadow-red-500/20 animate-shake' : 
          'bg-[#2563eb]'
        }`}>
          {isLoading ? (
            <Loader2 size={40} className="animate-spin" />
          ) : (
            <Fingerprint size={40} />
          )}
        </div>
        
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Kiosk Terminal</h1>
        <p className="text-slate-400 mb-8 font-medium">Enter your ID to record attendance</p>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="ID NUMBER"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            autoComplete="off"
            suppressHydrationWarning 
            className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-xl px-6 py-5 text-4xl text-center font-bold tracking-[0.2em] focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-800"
          />
        </div>

        {/* 3. Height Optimization: Removed min-height so the box is compact by default */}
        <div className="h-auto">
          {status.type && (
            <div className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 animate-in fade-in zoom-in slide-in-from-top-2 duration-300 border ${
              status.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {status.type === 'success' ? <CheckCircle size={22}/> : <AlertCircle size={22}/>}
              <span className="font-bold text-sm tracking-wide uppercase">{status.msg}</span>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-slate-600 text-xs font-mono uppercase tracking-widest">
        System Active • Version 1.0.4
      </p>
    </div>
  );
}