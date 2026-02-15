'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  // 1. Authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || "Invalid credentials" }
  }

  // 2. Fetch profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "Profile not found." }
  }

  /**
   * CORRECTED REDIRECT LOGIC
   * If database says 'admin' -> go to /dashboard/admin
   * Otherwise -> go to /dashboard (staff dashboard)
   */
  const redirectUrl = profile.role === 'admin' ? '/dashboard/admin' : '/dashboard'
  
  // Revalidate paths to ensure user data is fresh
  revalidatePath('/', 'layout')
  
  return { success: true, redirectUrl }
}

/**
 * FIXED: Added 'export' so the dashboard and layouts can see this member.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Clear the cache so the UI updates to "Logged Out" state
  revalidatePath('/', 'layout')
  redirect('/login')
}