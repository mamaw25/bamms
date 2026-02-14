'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * Handles user login with Email and Password
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Handles user sign out and clears the session
 * Adding this fix to resolve the "Export signOut doesn't exist" build error
 */
export async function signOut() {
  const supabase = await createClient()

  // 1. Terminate the Supabase session
  await supabase.auth.signOut()

  // 2. Wipe the cache so the dashboard doesn't show old user data
  revalidatePath('/', 'layout')

  // 3. Send the user back to the login page
  redirect('/login')
}