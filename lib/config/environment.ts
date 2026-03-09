/**
 * Environment configuration validation and helpers
 */

export function validateSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const errors: string[] = [];

  if (!url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  } else if (!url.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL should start with https://');
  }

  if (!anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  if (!serviceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set');
  }
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  }
  return key;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
