'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createRoom(formData: FormData) {
  try {
    const room_number = formData.get('room_number') as string;
    const category = formData.get('category') as string;
    const base_price = Number(formData.get('base_price'));
    const status = formData.get('status') as string;
    
    // नए फील्ड्स
    const area = formData.get('area') as string;
    const max_adults = Number(formData.get('max_adults'));
    const max_children = Number(formData.get('max_children'));
    const amenities = formData.getAll('amenities') as string[]; // चेकबॉक्स से ऐरे

    const { error } = await supabaseAdmin
      .from('rooms')
      .insert({ 
        room_number, 
        category, 
        base_price, 
        status, 
        area, 
        max_adults, 
        max_children, 
        amenities,
        capacity: max_adults + max_children // पुराने कॉलम को भी अपडेट रखें
      });

    if (error) {
      if (error.code === '23505') throw new Error('This Room Number already exists.');
      throw new Error(error.message);
    }

    revalidatePath('/admin/rooms');
    revalidatePath('/rooms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateRoomDetails(roomId: string, formData: FormData) {
  try {
    const room_number = formData.get('room_number') as string;
    const category = formData.get('category') as string;
    const base_price = Number(formData.get('base_price'));
    const status = formData.get('status') as string;
    
    const area = formData.get('area') as string;
    const max_adults = Number(formData.get('max_adults'));
    const max_children = Number(formData.get('max_children'));
    const amenities = formData.getAll('amenities') as string[];

    // पुरानी इमेजेज
    const existingImagesStr = formData.get('existing_images') as string;
    let finalImages = existingImagesStr ? existingImagesStr.split(',').filter(i => i.trim() !== '') : [];

    // नई इमेजेज
    const files = formData.getAll('room_images') as File[];
    const validFiles = files.filter(f => f.size > 0);

    const totalImages = finalImages.length + validFiles.length;
    
    if (totalImages < 3) return { success: false, error: 'Minimum 3 images required' };
    if (totalImages > 5) return { success: false, error: 'Maximum 5 images allowed' };

    for (const file of validFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `room-${room_number}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('hotel-images')
        .upload(fileName, file, { upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('hotel-images')
          .getPublicUrl(fileName);
        finalImages.push(publicUrl);
      }
    }

    const { error } = await supabaseAdmin
      .from('rooms')
      .update({ 
        room_number, 
        category, 
        base_price, 
        status, 
        area, 
        max_adults, 
        max_children, 
        amenities,
        capacity: max_adults + max_children,
        images: finalImages 
      })
      .eq('id', roomId);

    if (error) {
      if (error.code === '23505') throw new Error('This Room Number already exists.');
      throw new Error(error.message);
    }

    revalidatePath('/admin/rooms');
    revalidatePath('/rooms');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteRoom(roomId: string) {
  try {
    const { error } = await supabaseAdmin.from('rooms').delete().eq('id', roomId);
    if (error) {
      if (error.code === '23503') throw new Error('Cannot delete. Room has past bookings.');
      throw new Error(error.message);
    }
    revalidatePath('/admin/rooms');
    revalidatePath('/rooms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}