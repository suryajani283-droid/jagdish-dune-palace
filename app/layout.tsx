import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { supabaseAdmin } from '@/lib/supabase/admin';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // डेटाबेस से एक्टिव थीम लाएँ
  const { data: settings } = await supabaseAdmin.from('hotel_settings').select('active_theme').eq('id', 1).single();
  const theme = settings?.active_theme || 'default';

  // थीम के हिसाब से रंग तय करें
  let primary = '#0B1320';
  let secondary = '#C5A059';
  let bg = '#F8F9FA';
  let text = '#1A1A1A';

  if (theme === 'diwali') {
    primary = '#3E0606'; secondary = '#FFD700'; bg = '#FFF4E6'; text = '#2B1A1A';
  } else if (theme === 'holi') {
    primary = '#2B1055'; secondary = '#FF007F'; bg = '#F4F9F4'; text = '#1D3557';
  } else if (theme === 'rakshabandhan') {
    primary = '#4A1525'; secondary = '#FF9933'; bg = '#FFF8F0'; text = '#2B1A1A';
  } else if (theme === 'newyear') {
    primary = '#000000'; secondary = '#E5E5E5'; bg = '#F9F9F9'; text = '#111111';
  }

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body 
        className="font-sans antialiased transition-colors duration-500"
        style={{
          '--theme-primary': primary,
          '--theme-secondary': secondary,
          '--theme-bg': bg,
          '--theme-text': text,
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}