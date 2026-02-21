'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { generateVerificationToken, getTokenExpirationTime, sendVerificationEmail } from '@/lib/email/emailService'

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

  // Generate verification token
  const verificationToken = generateVerificationToken();
  const tokenExpiresAt = getTokenExpirationTime();

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: false, // Don't auto-confirm - require email verification
      user_metadata: { first_name, last_name, role: userRole }
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return { success: false, error: authError?.message || "Auth failed" }
    }

    // Get the highest unique_id_number to continue the sequence
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('unique_id_number')
      .order('unique_id_number', { ascending: false })
      .limit(1);

    let nextId = 1000; // Default starting ID
    if (!fetchError && existingProfiles && existingProfiles.length > 0) {
      const lastId = parseInt(existingProfiles[0].unique_id_number, 10);
      if (!isNaN(lastId)) {
        nextId = lastId + 1;
      }
    }

    const unique_id_number = nextId.toString();

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email.trim(),
        first_name,
        last_name,
        unique_id_number: unique_id_number,
        role: userRole,
        email_verified: false, // Set email as not verified initially
        email_verification_token: verificationToken,
        email_verification_token_expires_at: tokenExpiresAt.toISOString()
      })
      .select()

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Optionally delete the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('Cleanup: Deleted auth user due to profile creation failure');
      } catch (cleanup_error) {
        console.error('Cleanup error:', cleanup_error);
      }
      return { success: false, error: `Profile creation failed: ${profileError.message}` }
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(email.trim(), first_name, verificationToken);
    if (!emailResult.success) {
      console.warn('Email send warning:', emailResult.message);
    }

    return { success: true, error: null, verification_sent: true, verification_token: verificationToken }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

export async function signOut(redirectTo: string = '/login') {
  const supabase = await createAdminClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(redirectTo) 
}
