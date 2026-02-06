'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function loginWithID(formData: FormData) {
  const idNumber = formData.get('idNumber') as string

  // 1. Create a "Privileged" client to bypass RLS
  // This avoids the 'fetch failed' error caused by RLS restrictions on 'anon' users
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 2. Look up the email and verification status using the Master Key
  const { data: profile, error: pError } = await supabaseAdmin
    .from('profiles')
    .select('email, is_verified')
    .eq('unique_id_number', Number(idNumber))
    .single()

  // If the database can't find the ID
  if (pError || !profile) {
    return { error: "ID Number not found. Please register first." }
  }

  // 3. Block unverified accounts
  if (!profile.is_verified) {
    return { error: "Your account is pending Admin verification." }
  }

  // 4. Perform the actual Auth Sign-in with the standard client
  // This creates the session cookie for the user browser
  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: "User123!", 
  })

  if (authError) {
    return { error: "Authentication failed: " + authError.message }
  }

  // 5. Success!
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}