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
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-white font-sans">
      
      {/* Main Kiosk Box */}
      <div className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md text-center transition-all">
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-300 ${
          status.type === 'success' ? 'bg-green-600' : 
          status.type === 'error' ? 'bg-red-600' : 
          'bg-blue-600'
        }`}>
          {status.type === 'success' ? <CheckCircle size={32} /> : 
           status.type === 'error' ? <AlertCircle size={32} /> : 
           <Fingerprint size={32} />}
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tight mb-">
          {status.type === 'success' ? '✓ Success' : 
           status.type === 'error' ? '✗ Error' : 
           'Attendance Kiosk'}
        </h1>
        <p className="text-slate-400 text-sm mb-8 font-medium">
          {status.type === 'success' ? status.msg : 
           status.type === 'error' ? status.msg :
           'Enter your ID number'}
        </p>

        {!status.type && (
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processAction()}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#0f172a] border-2 border-slate-700 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
            />
            <button
              onClick={processAction}
              disabled={isLoading || !idNumber}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
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
      <div className="mt-12 text-center text-slate-500 text-xs">
        <p>Kiosk System v1.0</p>
      </div>
    </div>
  );
}
