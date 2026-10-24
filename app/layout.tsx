import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { getActiveTheme } from '@/lib/theme-engine';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace',
};

export const dynamic = 'force-dynamic'; 

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme();

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body 
        suppressHydrationWarning
        className="font-sans antialiased transition-colors duration-500 relative"
        style={{
          '--theme-primary': theme.primary_color,
          '--theme-secondary': theme.secondary_color,
          '--theme-bg': theme.bg_color,
          '--theme-text': theme.text_color,
          '--theme-navbar': theme.navbar_bg || theme.bg_color,
          '--theme-footer': theme.footer_bg || theme.primary_color,
        } as React.CSSProperties}
      >
        {/* ✅ अगर थीम में इमेज है, तो उसे बैकग्राउंड में लगाएँ */}
        {theme.bg_image && (
          <div 
            className="fixed inset-0 z-[-1]"
            style={{
              backgroundImage: `url(${theme.bg_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              filter: 'brightness(1.1) opacity(0.15)', // हल्का सा फीका करें ताकि टेक्स्ट दिखे
            }}
          />
        )}

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}