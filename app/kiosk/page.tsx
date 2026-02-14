'use client'

import { useState, useEffect, useRef } from 'react';
import { handleKioskAction } from '../dashboard/actions';
import { Clock, Fingerprint, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function KioskPage() {
  const [idNum, setIdNum] = useState('');
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const processAction = async () => {
    if (!idNum || isLoading) return;
    
    setIsLoading(true);
    setStatus({ msg: '', type: null });

    try {
      const res = await handleKioskAction(idNum);
      
      if (res.success) {
        // Safe access to message and type
        const successMsg = res.message || 'Action completed successfully';
        setStatus({ 
          msg: successMsg, 
          type: 'success' 
        });
        setIdNum(''); 
      } else {
        setStatus({ 
          msg: res.error || 'Database error occurred.', 
          type: 'error' 
        });
      }
    } catch {
      // Removed 'err' to satisfy ESLint @typescript-eslint/no-unused-vars
      setStatus({ msg: 'System connection error.', type: 'error' });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setStatus({ msg: '', type: null });
      }, 3500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processAction();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md text-center">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-colors duration-500 ${
          status.type === 'success' ? 'bg-green-600' : status.type === 'error' ? 'bg-red-600' : 'bg-[#2563eb]'
        }`}>
          <Fingerprint size={40} className={isLoading ? 'animate-pulse' : ''} />
        </div>
        
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Kiosk Terminal</h1>
        <p className="text-slate-400 mb-8 font-medium">Enter your ID to record attendance</p>

        <div className="relative">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="ENTER ID NUMBER"
            value={idNum}
            onChange={(e) => setIdNum(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-xl px-6 py-4 text-3xl text-center font-mono mb-6 focus:border-blue-500 focus:outline-none transition-all text-white placeholder:text-slate-800 disabled:opacity-50"
          />
        </div>

        <button 
          onClick={processAction} 
          disabled={isLoading || !idNum} 
          className="w-full bg-[#2563eb] hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Clock size={20} />}
          {isLoading ? 'PROCESSING...' : 'SUBMIT'}
        </button>

        <div className="min-h-[80px] mt-8">
          {status.type && (
            <div className={`p-4 rounded-xl flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-300 ${
              status.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
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