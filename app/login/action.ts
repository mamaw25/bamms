'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    let supabase
    try {
      supabase = await createClient()
    } catch (error) {
      console.error('Supabase client creation error:', error)
      return { 
        success: false, 
        error: "Unable to connect to authentication service. Please check your internet connection and try again." 
      }
    }

    // 1. Authenticate
    let authData
    let authError
    try {
      const result = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      authData = result.data
      authError = result.error
    } catch (error) {
      console.error('Authentication error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication service error'
      if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('fetch')) {
        return { 
          success: false, 
          error: "Unable to reach the authentication server. Please check your internet connection and try again." 
        }
      }
      return { success: false, error: errorMessage }
    }

    if (authError || !authData?.user) {
      return { success: false, error: authError?.message || "Invalid credentials" }
    }

    // 2. Fetch profile to check role and email verification status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email_verified')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: "Profile not found." }
    }

    // 3. Check if email is verified
    if (!profile.email_verified) {
      return { 
        success: false, 
        error: "Please verify your email address before logging in. Check your inbox for the verification link."
      }
    }

    // If database says 'admin' -> go to /dashboard/admin
    // Otherwise -> go to /dashboard (staff dashboard)
    const redirectUrl = profile.role === 'admin' ? '/dashboard/admin' : '/dashboard'
    
    // Revalidate paths to ensure user data is fresh
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'layout')
    revalidatePath('/dashboard/admin', 'layout')
    
    return { success: true, redirectUrl }
  } catch (error) {
    console.error('Login error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred during login"
    }
  }
}

 // Added 'export' so the dashboard and layouts can see this member.
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Clear the cache so the UI updates to "Logged Out" state
  revalidatePath('/', 'layout')
  redirect('/login')
}
