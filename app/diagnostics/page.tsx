'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([
    { name: 'Environment Configuration', status: 'loading', message: 'Checking...' },
    { name: 'Internet Connectivity', status: 'loading', message: 'Checking...' },
    { name: 'Supabase Connection', status: 'loading', message: 'Checking...' },
  ]);

  useEffect(() => {
    const runDiagnostics = async () => {
      const newResults: DiagnosticResult[] = [];

      // Check environment variables
      try {
        const envResponse = await fetch('/api/diagnostics/env');
        const envData = await envResponse.json();
        newResults.push({
          name: 'Environment Configuration',
          status: envData.isConfigured ? 'success' : 'error',
          message: envData.isConfigured
            ? 'Supabase environment variables are configured'
            : 'Missing Supabase configuration',
          details: envData.message,
        });
      } catch (error) {
        newResults.push({
          name: 'Environment Configuration',
          status: 'error',
          message: 'Failed to check environment',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Check internet connectivity
      try {
        await fetch('https://www.google.com', {
          mode: 'no-cors',
          cache: 'no-store',
        });
        newResults.push({
          name: 'Internet Connectivity',
          status: 'success',
          message: 'Internet connection is available',
        });
      } catch (error) {
        newResults.push({
          name: 'Internet Connectivity',
          status: 'error',
          message: 'No internet connection detected',
          details: error instanceof Error ? error.message : 'Failed to connect',
        });
      }

      // Check Supabase connection
      try {
        const dbResponse = await fetch('/api/diagnostics/db');
        const dbData = await dbResponse.json();
        newResults.push({
          name: 'Supabase Connection',
          status: dbData.connected ? 'success' : 'error',
          message: dbData.connected
            ? 'Successfully connected to Supabase'
            : 'Failed to connect to Supabase',
          details: dbData.message,
        });
      } catch (error) {
        newResults.push({
          name: 'Supabase Connection',
          status: 'error',
          message: 'Failed to test Supabase connection',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      setResults(newResults);
    };

    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">System Diagnostics</h1>
        <p className="text-slate-600 mb-8">Check your system configuration and connectivity</p>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-6 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(result.status)}</div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-900">{result.name}</h3>
                  <p className="text-slate-700 mt-1">{result.message}</p>
                  {result.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                        Details
                      </summary>
                      <pre className="mt-2 bg-white/50 p-3 rounded text-xs text-slate-600 overflow-auto">
                        {result.details}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-100 rounded-lg">
          <h2 className="font-semibold text-slate-900 mb-3">Need Help?</h2>
          <ul className="space-y-2 text-slate-700 text-sm">
            <li>• Make sure your internet connection is working</li>
            <li>• Verify that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local</li>
            <li>• Check that your Supabase project is active and not deleted</li>
            <li>• Try restarting the development server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
