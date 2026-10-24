'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateSettings(formData: FormData) {
  try {
    // 🔒 सुरक्षा जाँच
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) throw new Error('Unauthorized: Please login.');
    
    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error('Forbidden: Only admins can update settings.');

    const hotel_name = formData.get('hotel_name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const gstin = formData.get('gstin') as string;
    const hero_title = formData.get('hero_title') as string;
    const hero_subtitle = formData.get('hero_subtitle') as string;
    const active_theme_name = formData.get('active_theme') as string || 'default';

    let logo_url = formData.get('existing_logo_url') as string;
    let hero_image_url = formData.get('existing_hero_url') as string;

    // लोगो अपलोड
    const logoFile = formData.get('logo_file') as File;
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('hotel-images').upload(fileName, logoFile, { upsert: true });
      if (uploadError) throw new Error('Logo upload failed: ' + uploadError.message);
      const { data: { publicUrl } } = supabaseAdmin.storage.from('hotel-images').getPublicUrl(fileName);
      logo_url = publicUrl;
    }

    // हीरो इमेज अपलोड
    const heroFile = formData.get('hero_file') as File;
    if (heroFile && heroFile.size > 0) {
      const fileExt = heroFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('hotel-images').upload(fileName, heroFile, { upsert: true });
      if (uploadError) throw new Error('Hero image upload failed: ' + uploadError.message);
      const { data: { publicUrl } } = supabaseAdmin.storage.from('hotel-images').getPublicUrl(fileName);
      hero_image_url = publicUrl;
    }

    // ✅ थीम को डेटाबेस से मिलाएँ
    let manual_theme_override = null;
    if (active_theme_name !== 'default') {
      const { data: themeData } = await supabaseAdmin.from('theme_settings').select('id').eq('name', active_theme_name).single();
      if (themeData) manual_theme_override = themeData.id;
    }

    // ✅ डेटाबेस अपडेट करें
    const { error } = await supabaseAdmin
      .from('hotel_settings')
      .update({
        hotel_name, phone, email, address, gstin, logo_url, hero_image_url, hero_title, hero_subtitle,
        active_theme: active_theme_name,
        manual_theme_override
      })
      .eq('id', 1);

    if (error) throw new Error(error.message);

    // ✅ सबसे ज़रूरी: पूरे लेआउट का कैश साफ़ करें ताकि नया रंग तुरंत दिखे
    revalidatePath('/', 'layout'); 
    revalidatePath('/admin/settings');
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}