'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = "User123!" 

  // 1. Create the Auth account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) return { error: authError.message }

  // 2. Insert into profiles (No role field)
  if (authData.user) {
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .insert({ 
        id: authData.user.id, 
        first_name: firstName, 
        last_name: lastName, 
        email: email,
        is_verified: true 
      })
      .select('unique_id_number')
      .single()

    if (pError) {
      return { error: "Database Error: " + pError.message }
    }
    
    // 3. Success!
    redirect(`/register/success?id=${profile.unique_id_number}`)
  }
}