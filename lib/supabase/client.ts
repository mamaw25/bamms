import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error('This function should only be called in the browser')
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: {
            // Use localStorage for persistent session storage across browser restarts
            // This ensures refresh tokens are available for automatic token refresh
            getItem: (key: string) => {
              try {
                return localStorage.getItem(key)
              } catch (e) {
                console.warn('Failed to get item from localStorage:', key, e)
                return null
              }
            },
            setItem: (key: string, value: string) => {
              try {
                localStorage.setItem(key, value)
              } catch (e) {
                console.warn('Failed to set item in localStorage:', key, e)
              }
            },
            removeItem: (key: string) => {
              try {
                localStorage.removeItem(key)
              } catch (e) {
                console.warn('Failed to remove item from localStorage:', key, e)
              }
            },
          }
        }
      }
    )
  }

  return supabaseClient
}