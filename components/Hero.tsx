'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { t, type Lang } from '@/lib/i18n';

// अब हम प्रॉप्स के जरिए डेटा लेंगे
export function Hero({ settings }: { settings: any }) {
  const [lang, setLang] = useState<Lang>('en');
  
  useEffect(() => {
    const update = () => setLang((localStorage.getItem('lang') as Lang) || 'en');
    update(); window.addEventListener('langChange', update);
    return () => window.removeEventListener('langChange', update);
  }, []);

  // डिफ़ॉल्ट इमेज अगर सेटिंग्स में नहीं है
  const bgImage = settings?.hero_image_url || 'https://images.unsplash.com/photo-1542314831-c6a4d1424b94?w=1920';
  const heroTitle = settings?.hero_title || t(lang, 'hotelName');
  const heroSubtitle = settings?.hero_subtitle || t(lang, 'tagline');

  return (
    <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center text-center overflow-hidden w-full">
      
      <Image
        src={bgImage}
        alt="Hotel Background"
        fill
        priority
        className="object-cover object-center z-0"
      />
      
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="relative z-20 max-w-4xl px-6 text-white animate-fade-up w-full">
        <p className="text-[#c9a961] uppercase tracking-[0.5em] text-xs md:text-sm mb-6 font-semibold">
          Welcome to Chohtan, Barmer
        </p>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight drop-shadow-lg">
          {heroTitle}
        </h1>
        <p className="text-lg md:text-2xl mb-12 text-stone-200 font-light max-w-2xl mx-auto">
          {heroSubtitle}
        </p>
        
        {/* Quick Search Bar */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 md:p-4 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto rounded-sm">
          <input type="date" className="bg-white/90 text-[#1a1815] px-4 py-3 w-full md:w-auto flex-1 focus:outline-none rounded-sm" />
          <input type="date" className="bg-white/90 text-[#1a1815] px-4 py-3 w-full md:w-auto flex-1 focus:outline-none rounded-sm" />
          <select className="bg-white/90 text-[#1a1815] px-4 py-3 w-full md:w-auto flex-1 focus:outline-none rounded-sm">
            <option>2 Adults</option>
            <option>1 Adult</option>
            <option>Family</option>
          </select>
          <Link href="/booking" className="btn-luxury w-full md:w-auto whitespace-nowrap text-center">Check Availability</Link>
        </div>
      </div>
    </section>
  );
}