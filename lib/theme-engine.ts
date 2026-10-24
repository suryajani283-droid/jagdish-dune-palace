import { supabaseAdmin } from '@/lib/supabase/admin';

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
  bg_image: string | null; // ✅ यह जोड़ा गया है
};

const fallbackTheme: Theme = {
  name: 'default',
  primary_color: '#17324D',
  secondary_color: '#C99A3B',
  bg_color: '#FFFFFF',
  text_color: '#24315D',
  navbar_bg: '#F4EFE6',
  footer_bg: '#2C1E16',
  bg_image: null,
};

export async function getActiveTheme(): Promise<Theme> {
  try {
    const { data: settings } = await supabaseAdmin
      .from('hotel_settings')
      .select('active_theme_id')
      .eq('id', 1)
      .single();

    if (!settings?.active_theme_id) return fallbackTheme;

    const { data: theme } = await supabaseAdmin
      .from('themes')
      .select('*')
      .eq('id', settings.active_theme_id)
      .single();

    return theme || fallbackTheme;
  } catch (error) {
    console.error("Theme Engine Error:", error);
    return fallbackTheme; 
  }
}