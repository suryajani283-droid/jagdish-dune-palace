'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
export async function addGalleryImage(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    const title = formData.get('title') as string || 'Hotel Gallery';

    if (!file || file.size === 0) throw new Error('No image selected');

    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('hotel-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('hotel-images')
      .getPublicUrl(fileName);
    const { error: dbError } = await supabaseAdmin
      .from('gallery')
      .insert({ image_url: publicUrl, title });

    if (dbError) throw new Error('Database error: ' + dbError.message);

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
export async function deleteGalleryImage(id: string) {
  try {
    const { error } = await supabaseAdmin.from('gallery').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}