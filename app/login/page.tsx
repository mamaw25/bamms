'use client';

import { useState, Suspense } from 'react';
import { login } from './action';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('role') === 'admin';
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function clientAction(formData: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await login(formData);
      if (result && 'error' in result) {
        setError(result.error || 'An error occurred');
        setIsLoading(false);
      } else if (result && 'redirectUrl' in result) {
        // Redirect to dashboard after successful login
        router.push(result.redirectUrl);
      } else {
        setError('Unexpected response from server');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
      console.error(err);
    }
  }

  return (
    /* Unified background to match the landing page */
    <div className="min-h-screen bg-gradient-to-br from-[#1A4480] via-[#1a3a60] to-[#0f2344] flex items-center justify-center p-4 font-sans">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 text-center transition-all">
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
          isAdmin ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          {isAdmin ? <ShieldCheck className="text-white" size={32} /> : <User className="text-white" size={32} />}
        </div>

        <h2 className={`text-2xl font-black text-center uppercase tracking-tight mb-2 ${
          isAdmin ? 'text-blue-500' : 'text-emerald-500'
        }`}>
          {isAdmin ? 'Admin Portal' : 'Staff Portal'}
        </h2>
        <p className="text-blue-200 text-center text-sm mb-8 font-medium">Please sign in to your account</p>
        
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form action={clientAction} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2 block">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="name@example.com"
              className="w-full bg-[#1A4480] border border-blue-400/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-300 transition-all placeholder:text-blue-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2 block">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-[#1A4480] border border-blue-400/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-300 transition-all placeholder:text-blue-400"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 ${
              isAdmin ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/50' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/50'
            } disabled:opacity-50`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Fixed: Use <Link> instead of <a> to resolve ESLint error */}
        <div className="mt-8 pt-6 border-t border-blue-400/20 text-center">
            <Link 
              href="/" 
              className="text-[10px] font-bold text-blue-300 hover:text-blue-100 uppercase tracking-[0.2em] transition-colors"
            >
              ← Return to Landing Page
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a]" />}>
      <LoginForm />
    </Suspense>
  );
}
