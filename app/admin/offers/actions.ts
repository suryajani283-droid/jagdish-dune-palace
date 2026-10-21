'use server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createOffer(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const coupon_code = (formData.get('coupon_code') as string).toUpperCase();
  const discount_percent = Number(formData.get('discount_percent'));

  const { error } = await supabaseAdmin.from('offers').insert({
    title, description, coupon_code, discount_percent
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/offers');
  revalidatePath('/offers');
  return { success: true };
}

export async function deleteOffer(id: string) {
  const { error } = await supabaseAdmin.from('offers').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/offers');
  revalidatePath('/offers');
  return { success: true };
}