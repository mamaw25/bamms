import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is missing' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Find the user with this verification token
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_verification_token', token)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const expirationTime = new Date(profile.email_verification_token_expires_at);
    if (new Date() > expirationTime) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json(
        { success: true, message: 'Email already verified' },
        { status: 200 }
      );
    }

    // Update the profile to mark email as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_token_expires_at: null
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Also update the auth user to confirm email
    try {
      await supabase.auth.admin.updateUserById(profile.id, {
        email_confirm: true
      });
    } catch (authError) {
      console.warn('Warning: Could not confirm auth email:', authError);
      // Continue anyway - the profile is verified
    }

    return NextResponse.json(
      { success: true, message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
