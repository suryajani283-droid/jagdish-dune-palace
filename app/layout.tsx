import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { FestiveDecorations } from '@/components/FestiveDecorations'; // <-- इम्पोर्ट करें

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace | Luxury Desert Heritage',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await supabaseAdmin.from('hotel_settings').select('active_theme').eq('id', 1).single();
  const theme = settings?.active_theme || 'default';

  return (
    <html lang="en" data-theme={theme} className={`${playfair.variable} ${lato.variable}`}>
      <body className="font-sans antialiased">
        {/* यहाँ डेकोरेशन लगाएँ */}
        <FestiveDecorations theme={theme} />
        
        {children}
      </body>
    </html>
  );
}