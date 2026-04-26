'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Fetch All Staff Profiles
export async function getStaffProfiles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Database Error:', error.message);
    throw new Error('Failed to fetch staff profiles');
  }

  return data;
}

// Delete Staff Member
export async function deleteStaff(userId: string) {
  const supabase = await createClient();

  try {
    // Delete the profile from the profiles table first (due to FK constraints)
    const { error: profileError, count: deletedCount } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Profile Delete Error:', profileError.message);
      throw new Error(`Failed to delete staff profile: ${profileError.message}`);
    }

    if (deletedCount === 0) {
      console.warn('No profiles deleted - staff member may not exist or RLS policy blocking deletion');
      throw new Error('Staff member not found or deletion blocked by policy');
    }

    console.log(`Successfully deleted profile for user ${userId}`);

    // Delete the user from auth after profile is deleted
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Auth Delete Error:', authError.message);
      // Profile is deleted but auth user deletion failed - still return success but log warning
      console.warn('Profile deleted but auth user deletion failed - user record may still exist in auth');
    } else {
      console.log(`Successfully deleted auth user ${userId}`);
    }

    // Revalidate the staff page to refresh the data
    revalidatePath('/dashboard/admin/staff');
    
    return { success: true };
  } catch (error) {
    console.error('Delete Staff Error:', error);
    throw error;
  }
}

// Update Staff Member
export async function updateStaff(
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
  }
) {
  const supabase = await createClient();

  // Update the profile in the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (profileError) {
    console.error('Profile Update Error:', profileError.message);
    throw new Error('Failed to update staff profile');
  }

  // If email was changed, try to update auth email as well
  if (updates.email) {
    try {
      await supabase.auth.admin.updateUserById(userId, {
        email: updates.email,
      });
    } catch (authError) {
      // Log the error but don't fail - the profile email was updated successfully
      console.warn('Auth email update warning (profile email updated):', authError);
      // Only throw if we absolutely cannot update the profile email
    }
  }

  return { success: true };
}
