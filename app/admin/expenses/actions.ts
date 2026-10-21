'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function addExpense(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const amount = Number(formData.get('amount'));
    const category = formData.get('category') as string;
    const expense_date = formData.get('expense_date') as string;
    const notes = formData.get('notes') as string;

    const { error } = await supabaseAdmin
      .from('expenses')
      .insert({
        title,
        amount,
        category,
        expense_date,
        notes,
      });

    if (error) throw new Error(error.message);

    revalidatePath('/admin/expenses');
    revalidatePath('/admin/dashboard');
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}