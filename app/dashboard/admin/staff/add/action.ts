'use server'

import { createClient } from '@supabase/supabase-js'
import { generateVerificationToken, getTokenExpirationTime, sendVerificationEmail } from '@/lib/email/emailService'

async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function addStaffMember(formData: FormData) {
  const supabase = await createAdminClient()
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const uniqueId = formData.get('uniqueId') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string || 'staff'

  // Generate verification token
  const verificationToken = generateVerificationToken()
  const tokenExpiresAt = getTokenExpirationTime()

  try {
    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: false, // Require email verification
      user_metadata: { first_name: firstName, last_name: lastName, role }
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create auth user' }
    }

    // 2. Create the profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        unique_id_number: uniqueId,
        role,
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_token_expires_at: tokenExpiresAt.toISOString()
      })

    if (profileError) {
      // Cleanup: delete the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (e) {
        console.error('Cleanup error:', e)
      }
      return { success: false, error: 'Failed to create staff profile' }
    }

    // 3. Send verification email
    const emailResult = await sendVerificationEmail(email.trim(), firstName, verificationToken)
    if (!emailResult.success) {
      console.warn('Email send warning:', emailResult.message)
    }

    return { 
      success: true, 
      error: null, 
      verification_token: verificationToken,
      message: 'Staff member created successfully! A verification email has been sent.' 
    }
  } catch (error) {
    console.error('Add staff error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
