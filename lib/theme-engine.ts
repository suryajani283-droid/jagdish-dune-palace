import { supabaseAdmin } from '@/lib/supabase/admin';

// ✅ टाइप्स यहीं डाल दिए हैं
export type Theme = {
  id?: string;
  name: string;
  display_name?: string;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  text_color: string;
  navbar_bg: string | null;
  footer_bg: string | null;
};

// ✅ डिफ़ॉल्ट थीम यहीं डाल दी है
const fallbackTheme: Theme = {
  name: 'default',
  display_name: 'Default Desert',
  primary_color: '#17324D', // Navy
  secondary_color: '#C99A3B', // Gold
  bg_color: '#FFFFFF', // White
  text_color: '#24315D', // Dark Blue
  navbar_bg: '#F4EFE6', // Sandstone
  footer_bg: '#2C1E16', // Dark Brown
};

export async function getActiveTheme(): Promise<Theme> {
  try {
    // 1. होटल सेटिंग्स से एक्टिव थीम आईडी लाएँ
    const { data: settings } = await supabaseAdmin
      .from('hotel_settings')
      .select('active_theme_id')
      .eq('id', 1)
      .single();

    // अगर कोई थीम सेलेक्ट नहीं है, तो डिफ़ॉल्ट दिखाएँ
    if (!settings?.active_theme_id) {
      return fallbackTheme;
    }

    // 2. थीम की डिटेल्स लाएँ
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