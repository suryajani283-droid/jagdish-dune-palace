'use client';
import { useEffect, useState } from 'react';
import type { Lang } from '@/lib/i18n';

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored) setLang(stored);
  }, []);
  const change = (l: Lang) => {
    setLang(l); localStorage.setItem('lang', l);
    window.dispatchEvent(new Event('langChange'));
  };
  return (
    <div className="flex gap-1 text-xs">
      <button onClick={() => change('en')} className={`px-2 py-1 ${lang === 'en' ? 'bg-[brand-accent] text-white' : 'text-stone-600'}`}>EN</button>
      <button onClick={() => change('hi')} className={`px-2 py-1 ${lang === 'hi' ? 'bg-[brand-accent] text-white' : 'text-stone-600'}`}>हिं</button>
    </div>
  );
}