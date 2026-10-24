import { supabaseAdmin } from '@/lib/supabase/admin';

export type Theme = {
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  text_color: string;
  decoration_type: string;
  greeting_message: string;
  name: string;
};

export async function getActiveTheme(): Promise<Theme> {
  const defaultTheme: Theme = {
    primary_color: '#2B2520',
    secondary_color: '#C05C3E',
    bg_color: '#FDFBF7',
    text_color: '#2B2520',
    decoration_type: 'none',
    greeting_message: 'Welcome to Jagdish Dune Palace',
    name: 'default'
  };

  try {
    // 1. चेक करें कि एडमिन ने मैन्युअल थीम सेलेक्ट की है या नहीं
    const { data: settings } = await supabaseAdmin
      .from('hotel_settings')
      .select('manual_theme_override')
      .eq('id', 1)
      .single();

    if (settings?.manual_theme_override) {
      const { data: manualTheme } = await supabaseAdmin
        .from('theme_settings')
        .select('*')
        .eq('id', settings.manual_theme_override)
        .single();
      if (manualTheme) return manualTheme;
    }

    // 2. अगर मैन्युअल नहीं है, तो आज की तारीख (Asia/Kolkata) चेक करें
    const today = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    }).format(new Date());

    // 3. कैलेंडर से चेक करें कि आज कोई त्योहार है या नहीं
    const { data: activeFestivals } = await supabaseAdmin
      .from('festival_calendar')
      .select('*, theme_settings(*)')
      .lte('start_date', today)
      .gte('end_date', today)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1);

    if (activeFestivals && activeFestivals.length > 0) {
      return activeFestivals[0].theme_settings;
    }

    // 4. अगर कुछ नहीं मिला, तो डिफ़ॉल्ट थीम दिखाएँ
    const { data: defaultData } = await supabaseAdmin.from('theme_settings').select('*').eq('name', 'default').single();
    return defaultData || defaultTheme;
    
  } catch (error) {
    console.error("Theme Engine Error:", error);
    return defaultTheme;
  }
}