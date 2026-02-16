'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function signUp(formData: FormData) {
  const supabase = await createAdminClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const first_name = formData.get('firstName') as string
  const last_name = formData.get('lastName') as string
  const adminCode = formData.get('adminCode') as string

  const SECRET_ADMIN_PASS = "ADMIN123"; 
  const userRole = adminCode === SECRET_ADMIN_PASS ? 'admin' : 'staff';

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name, role: userRole }
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Auth failed" }
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email.trim(),
        first_name,
        last_name,
        role: userRole 
      })

    if (profileError) return { success: false, error: "Profile creation failed" }

    return { success: true, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signOut(redirectTo: string = '/login') {
  const supabase = await createAdminClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(redirectTo) 
}
