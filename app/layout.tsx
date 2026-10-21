import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({ 
  weight: ['300', '400', '700'],
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
      <body className="font-lato bg-[#faf8f5] text-[#2a2520] antialiased">
        {children}
      </body>
    </html>
  );
}