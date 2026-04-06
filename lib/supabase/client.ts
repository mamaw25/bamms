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
            // Use sessionStorage instead of localStorage for tab-specific sessions
            getItem: (key: string) => {
              try {
                return sessionStorage.getItem(key)
              } catch (e) {
                return null
              }
            },
            setItem: (key: string, value: string) => {
              try {
                sessionStorage.setItem(key, value)
              } catch (e) {
                // Ignore quota exceeded errors
              }
            },
            removeItem: (key: string) => {
              try {
                sessionStorage.removeItem(key)
              } catch (e) {
                // Ignore errors
              }
            },
          }
        }
      }
    )
  }

  return supabaseClient
}