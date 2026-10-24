import { supabaseAdmin } from '@/lib/supabase/admin';
import { Theme, fallbackTheme } from './theme-types';

export async function getActiveTheme(): Promise<Theme> {
  try {
    // होटल सेटिंग्स से एक्टिव थीम आईडी लाएँ
    const { data: settings } = await supabaseAdmin
      .from('hotel_settings')
      .select('active_theme_id')
      .eq('id', 1)
      .single();

    // अगर कोई थीम सेलेक्ट नहीं है, तो डिफ़ॉल्ट दिखाएँ
    if (!settings?.active_theme_id) {
      return fallbackTheme;
    }

    // थीम की डिटेल्स लाएँ
    const { data: theme } = await supabaseAdmin
      .from('themes')
      .select('*')
      .eq('id', settings.active_theme_id)
      .single();

    return theme || fallbackTheme;
    
  } catch (error) {
    console.error("Theme Engine Error:", error);
    return fallbackTheme; // अगर एरर आए तो वेबसाइट न टूटे
  }
}