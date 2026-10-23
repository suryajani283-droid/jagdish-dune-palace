import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css'; // <--- यह लाइन होनी चाहिए
import { supabaseAdmin } from '@/lib/supabase/admin';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = await supabaseAdmin.from('hotel_settings').select('active_theme').eq('id', 1).single();
  const theme = settings?.active_theme || 'default';

  return (
    <html lang="en" data-theme={theme} className={`${playfair.variable} ${lato.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}