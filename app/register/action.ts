'use server'

// Helper: Create admin client with service role key
async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  return createSupabaseClient(
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

  // Validate inputs
  if (!email || !email.trim()) {
    return { success: false, error: "Email is required" }
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }
  if (!first_name || !first_name.trim()) {
    return { success: false, error: "First name is required" }
  }
  if (!last_name || !last_name.trim()) {
    return { success: false, error: "Last name is required" }
  }

  try {
    // Use admin API to create user without requiring email confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { 
        first_name: first_name.trim(), 
        last_name: last_name.trim() 
      }
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Authentication failed" }
    }

    const userId = authData.user.id

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim()
      })
      .select()
      .single()

    if (profileError) {
      return { success: false, error: "Profile creation failed: " + profileError.message }
    }

    return {
      success: true,
      user: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        unique_id_number: profile.unique_id_number
      }
    }
  } catch (err) {
    console.error('Sign up error:', err)
    return { success: false, error: "An unexpected error occurred" }
  }
}