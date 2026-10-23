'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { t, type Lang } from '@/lib/i18n';

export function Hero({ settings }: { settings: any }) {
  const [lang, setLang] = useState<Lang>('en');
  
  useEffect(() => {
    const update = () => setLang((localStorage.getItem('lang') as Lang) || 'en');
    update(); window.addEventListener('langChange', update);
    return () => window.removeEventListener('langChange', update);
  }, []);

  const bgImage = settings?.hero_image_url || 'https://images.unsplash.com/photo-1542314831-c6a4d1424b94?w=1920';
  const heroTitle = settings?.hero_title || t(lang, 'hotelName');
  const heroSubtitle = settings?.hero_subtitle || t(lang, 'tagline');

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden w-full">
      <Image src={bgImage} alt="Hotel Background" fill priority className="object-cover object-center z-0" />
      
      {/* यहाँ डार्क ओवरले लगा है */}
      <div className="absolute inset-0 hero-overlay z-10"></div>

      <div className="relative z-20 max-w-4xl px-6 text-white animate-fade-up w-full pt-16">
        {/* हार्डकोडेड #C5A059 हटाकर डायनामिक रंग लगाया */}
        <p className="text-[var(--theme-secondary)] uppercase tracking-[0.5em] text-xs md:text-sm mb-4 font-bold">
          Welcome to Chohtan, Barmer
        </p>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight text-white drop-shadow-xl">
          {heroTitle}
        </h1>
        <p className="text-lg md:text-2xl mb-10 text-stone-100 font-light max-w-2xl mx-auto drop-shadow-md">
          {heroSubtitle}
        </p>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Link href="/booking" className="btn-luxury w-full md:w-auto text-center">
            Book Your Stay
          </Link>
          <Link href="/rooms" className="border-2 border-white text-white hover:bg-white hover:text-[var(--theme-primary)] font-bold uppercase tracking-widest text-xs px-8 py-4 transition-all duration-300 w-full md:w-auto text-center">
            Explore Rooms
          </Link>
        </div>
      </div>
    </section>
  );
}