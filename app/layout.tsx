import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({ 
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'], 
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jagdish Dune Palace | Luxury Desert Heritage',
  description: 'A luxury boutique hotel in Chohtan, Barmer, Rajasthan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="font-sans antialiased bg-[#F8F9FA] text-[#1A1A1A]">
        {children}
      </body>
    </html>
  );
}