import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { getActiveTheme } from '@/lib/theme-engine';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace',
};

// ✅ कैश को रोकने के लिए ताकि थीम तुरंत बदले
export const dynamic = 'force-dynamic'; 

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme();

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body 
        suppressHydrationWarning
        className="font-sans antialiased transition-colors duration-500"
        style={{
          '--theme-primary': theme.primary_color,
          '--theme-secondary': theme.secondary_color,
          '--theme-bg': theme.bg_color,
          '--theme-text': theme.text_color,
          '--theme-navbar': theme.navbar_bg || theme.bg_color,
          '--theme-footer': theme.footer_bg || theme.primary_color,
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}