import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { FestiveDecorations } from '@/components/FestiveDecorations';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // डेटाबेस से एक्टिव थीम लाएँ
  const { data: settings } = await supabaseAdmin.from('hotel_settings').select('active_theme').eq('id', 1).single();
  const theme = settings?.active_theme || 'default';

  // थीम के हिसाब से शानदार रंग तय करें
  let primary = '#0B1320'; // Default Royal Navy
  let secondary = '#C5A059'; // Default Gold
  let bg = '#F8F9FA'; // Default Light
  let text = '#1A1A1A';

  if (theme === 'diwali') {
    primary = '#3E0606'; // Deep Maroon
    secondary = '#FFD700'; // Bright Gold
    bg = '#FFF4E6'; // Warm Cream
    text = '#2B1A1A';
  } else if (theme === 'holi') {
    primary = '#2B1055'; // Deep Purple
    secondary = '#FF007F'; // Bright Pink
    bg = '#FDF0F5'; // Soft Pinkish White
    text = '#1D3557';
  } else if (theme === 'rakshabandhan') {
    primary = '#4A1525'; // Deep Maroon
    secondary = '#FF9933'; // Saffron
    bg = '#FFF8F0'; // Light Cream
    text = '#2B1A1A';
  } else if (theme === 'newyear') {
    primary = '#000000'; // Black
    secondary = '#E5E5E5'; // Silver
    bg = '#F9F9F9'; // White/Grey
    text = '#111111';
  }

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body 
        suppressHydrationWarning
        className="font-sans antialiased transition-colors duration-500"
        style={{
          '--theme-primary': primary,
          '--theme-secondary': secondary,
          '--theme-bg': bg,
          '--theme-text': text,
        } as React.CSSProperties}
      >
        {/* यहाँ हमने डेकोरेशन कंपोनेंट जोड़ दिया है ताकि स्क्रीन पर दिखे */}
        <FestiveDecorations theme={theme} />
        {children}
      </body>
    </html>
  );
}