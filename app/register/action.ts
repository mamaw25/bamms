'use server'

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
  
  // Get the admin code from the form
  const adminCode = formData.get('adminCode') as string

  // --- SET YOUR SECRET CODE HERE ---
  const SECRET_ADMIN_PASS = "ADMIN123"; 
  const userRole = adminCode === SECRET_ADMIN_PASS ? 'admin' : 'staff';

  // Validate inputs
  if (!email || !email.trim()) return { success: false, error: "Email is required" }
  if (!password || password.length < 6) return { success: false, error: "Password must be at least 6 characters" }
  if (!first_name || !first_name.trim()) return { success: false, error: "First name is required" }
  if (!last_name || !last_name.trim()) return { success: false, error: "Last name is required" }

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { 
        first_name: first_name.trim(), 
        last_name: last_name.trim(),
        role: userRole // Optional: also store in auth metadata
      }
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Authentication failed" }
    }

    const userId = authData.user.id

    // Create profile with the assigned role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: userRole // This is crucial for your RLS policies
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
        unique_id_number: profile.unique_id_number,
        role: profile.role
      }
    }
  } catch (err) {
    console.error('Sign up error:', err)
    return { success: false, error: "An unexpected error occurred" }
  }
}