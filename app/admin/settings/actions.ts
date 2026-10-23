'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
  try {
    const hotel_name = formData.get('hotel_name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const gstin = formData.get('gstin') as string;
    const hero_title = formData.get('hero_title') as string;
    const hero_subtitle = formData.get('hero_subtitle') as string;
    
    // ✅ त्योहारों की थीम (Festival Theme) निकालें
    const active_theme = formData.get('active_theme') as string || 'default';

    // पुराने URL (अगर यूजर ने नई इमेज अपलोड नहीं की है)
    let logo_url = formData.get('existing_logo_url') as string;
    let hero_image_url = formData.get('existing_hero_url') as string;

    // 1. नया लोगो अपलोड करें (अगर सेलेक्ट किया गया है)
    const logoFile = formData.get('logo_file') as File;
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('hotel-images')
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) throw new Error('Logo upload failed: ' + uploadError.message);

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('hotel-images')
        .getPublicUrl(fileName);
        
      logo_url = publicUrl;
    }

    // 2. नई हीरो इमेज अपलोड करें (अगर सेलेक्ट की गई है)
    const heroFile = formData.get('hero_file') as File;
    if (heroFile && heroFile.size > 0) {
      const fileExt = heroFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('hotel-images')
        .upload(fileName, heroFile, { upsert: true });

      if (uploadError) throw new Error('Hero image upload failed: ' + uploadError.message);

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('hotel-images')
        .getPublicUrl(fileName);
        
      hero_image_url = publicUrl;
    }

    // 3. डेटाबेस अपडेट करें (साथ में active_theme भी सेव करें)
    const { error } = await supabaseAdmin
      .from('hotel_settings')
      .update({
        hotel_name,
        phone,
        email,
        address,
        gstin,
        logo_url,
        hero_image_url,
        hero_title,
        hero_subtitle,
        active_theme, // ✅ यहाँ थीम सेव हो रही है
      })
      .eq('id', 1);

    if (error) throw new Error(error.message);

    // कैश साफ़ करें ताकि पूरी वेबसाइट पर नई थीम तुरंत दिखे
    revalidatePath('/', 'layout'); 
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}