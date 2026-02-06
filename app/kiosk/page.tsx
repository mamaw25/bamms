'use client'

import { useState } from 'react';
import { handleKioskAction } from '../dashboard/actions';
import { Clock, Fingerprint, CheckCircle, AlertCircle, LogOut as LogOutIcon } from 'lucide-react';

export default function KioskPage() {
  const [idNum, setIdNum] = useState('');
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });

  const processAction = async (type: 'in' | 'out') => {
    if (!idNum) return;
    const res = await handleKioskAction(idNum, type);
    
    if (res.success) {
      setStatus({ msg: `Successfully Clocked ${type.toUpperCase()}`, type: 'success' });
      setIdNum('');
    } else {
      setStatus({ msg: res.error || 'Action failed', type: 'error' });
    }
    
    setTimeout(() => setStatus({ msg: '', type: null }), 6000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md text-center">
        <div className="bg-[#2563eb] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Fingerprint size={40} />
        </div>
        
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Kiosk Terminal</h1>
        <p className="text-slate-400 mb-8 font-medium">Enter your ID to record attendance</p>

        <input 
          type="text" 
          placeholder="ENTER ID NUMBER"
          value={idNum}
          onChange={(e) => setIdNum(e.target.value)}
          className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-xl px-6 py-4 text-3xl text-center font-mono mb-6 focus:border-blue-500 focus:outline-none transition-all text-white"
        />

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => processAction('in')} className="bg-[#16a34a] hover:bg-green-500 py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
            <Clock size={20} /> TIME IN
          </button>
          <button onClick={() => processAction('out')} className="bg-[#ea580c] hover:bg-orange-500 py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
            <LogOutIcon size={20} /> TIME OUT
          </button>
        </div>

        {status.type && (
          <div className={`mt-8 p-4 rounded-xl flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status.type === 'success' ? <CheckCircle size={22}/> : <AlertCircle size={22}/>}
            <span className="font-bold text-sm tracking-wide">{status.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}