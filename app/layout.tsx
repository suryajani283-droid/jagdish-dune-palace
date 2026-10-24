import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { getActiveTheme } from '@/lib/theme-engine';
import { FestiveDecorations } from '@/components/FestiveDecorations';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace',
};

// ✅ यह लाइन सबसे ज़रूरी है। यह Next.js को बताती है कि हर बार डेटाबेस से नया थीम उठाओ।
export const dynamic = 'force-dynamic'; 

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme();

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body 
        suppressHydrationWarning
        className="font-sans antialiased transition-colors duration-500"
        style={{
          '--theme-primary': theme?.primary_color || '#2B2520',
          '--theme-secondary': theme?.secondary_color || '#C05C3E',
          '--theme-bg': theme?.bg_color || '#FDFBF7',
          '--theme-text': theme?.text_color || '#2B2520',
        } as React.CSSProperties}
      >
        {/* यहाँ डेकोरेशन लोड होगा (दीये, रंग, राखियां) */}
        <FestiveDecorations type={theme?.decoration_type || 'none'} />
        {children}
      </body>
    </html>
  );
}