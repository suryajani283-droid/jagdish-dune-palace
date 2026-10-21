'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createStaff(formData: FormData) {
  try {
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (password.length < 6) throw new Error('Password must be at least 6 characters long');

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw new Error(authError.message);

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        role,
      });

    if (profileError) throw new Error(profileError.message);

    revalidatePath('/admin/staff');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// नया फंक्शन: स्टाफ डिलीट करने के लिए
export async function deleteStaff(userId: string) {
  try {
    // auth.users से डिलीट करने पर profiles टेबल से भी अपने आप डिलीट हो जाएगा (CASCADE)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/staff');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}