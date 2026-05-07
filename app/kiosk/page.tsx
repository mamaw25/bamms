'use client'

import { useState, useEffect, useRef } from 'react';
import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { handleKioskAction } from './actions';

export default function KioskPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-[#1A4480] via-[#1a3a60] to-[#0f2344] flex flex-col items-center justify-center p-4 text-white font-sans">
      
      {/* Main Kiosk Box */}
      <div className="bg-white/10 backdrop-blur-md pt-10 px-8 pb-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md text-center transition-all">
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-300 ${
          status.type === 'success' ? 'bg-green-600' : 
          status.type === 'error' ? 'bg-red-600' : 
          'bg-blue-600'
        }`}>
          {status.type === 'success' ? <CheckCircle size={32} /> : 
           status.type === 'error' ? <AlertCircle size={32} /> : 
           <Fingerprint size={32} />}
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          {status.type === 'success' ? '✓ Success' : 
           status.type === 'error' ? '✗ Error' : 
           'ATTENDANCE KIOSK'}
        </h1>
        <p className="text-blue-200 text-sm mb-8 font-medium">
          {status.type === 'success' ? status.msg : 
           status.type === 'error' ? status.msg :
           'Enter your ID number'}
        </p>

        {!status.type && (
          <div className="flex flex-col items-center justify-center min-h-[140px] space-y-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processAction()}
              disabled={isLoading}
              className="w-full px-6 py-5 bg-[#1A4480] border-2 border-blue-400/30 rounded-xl text-white font-bold text-2xl focus:outline-none focus:border-blue-300 transition-all placeholder:text-blue-300 placeholder:text-center text-center"
            />
            <button
              onClick={processAction}
              disabled={isLoading || !idNumber}
              className="max-w-xs mx-auto bg-blue-600 hover:bg-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 disabled:bg-slate-600 text-white py-2 px-8 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-blue-300 text-[11px] font-mono uppercase tracking-[0.3em]">
        <p>Kiosk System v2.0</p>
      </div>
    </div>
  );
}
