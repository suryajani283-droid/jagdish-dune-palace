'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchLogo = async () => {
      const { data } = await supabase.from('hotel_settings').select('logo_url').eq('id', 1).single();
      if (data && data.logo_url) setLogoUrl(data.logo_url);
    };
    fetchLogo();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => setUser(session?.user || null));
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-brand-primary text-stone-300 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex gap-6 font-medium tracking-wide">
            <span>📞 +91 7599936000</span>
            <span>✉️ stay@jagdishdunepalace.com</span>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          {logoUrl ? (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-brand-accent shadow-md shrink-0 bg-white group-hover:scale-105 transition-transform duration-300">
              <img src={logoUrl} alt="Hotel Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-brand-accent flex items-center justify-center font-serif text-3xl font-bold text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-accent transition-all duration-300 shadow-md shrink-0">
              J
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xl md:text-3xl font-serif font-bold text-brand-primary tracking-wide uppercase leading-tight group-hover:text-brand-accent transition-colors">
              Jagdish Dune
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-brand-accent font-sans font-bold text-left mt-1">
              Palace
            </span>
          </div>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-stone-600">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/rooms" className="nav-link">Rooms</Link>
          <Link href="/facilities" className="nav-link">Facilities</Link>
          <Link href="/gallery" className="nav-link">Gallery</Link>
          <Link href="/offers" className="nav-link">Offers</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
          
          {user ? (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-stone-300">
              <Link href="/my-booking" className="nav-link text-brand-primary flex items-center gap-1">👤 Profile</Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">Logout</button>
            </div>
          ) : (
            <Link href="/customer/login" className="nav-link text-brand-primary border border-stone-300 px-3 py-1.5 rounded-sm hover:border-brand-accent">Login</Link>
          )}

          <Link href="/booking" className="btn-luxury py-3 px-6 ml-2">Book Now</Link>
        </nav>

        <button className="lg:hidden text-2xl text-brand-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-stone-200 px-6 py-6 flex flex-col gap-5 text-sm uppercase tracking-widest font-bold text-stone-600 shadow-lg absolute w-full left-0">
          <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">Home</Link>
          <Link href="/rooms" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">Rooms</Link>
          <Link href="/facilities" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">Facilities</Link>
          <Link href="/gallery" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">Gallery</Link>
          <Link href="/offers" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">Offers</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">Contact</Link>
          
          {user ? (
            <div className="flex flex-col gap-4 py-4 border-y border-stone-200">
              <Link href="/my-booking" onClick={() => setIsOpen(false)} className="hover:text-brand-accent">👤 My Profile</Link>
              <button onClick={handleLogout} className="text-red-500 text-left hover:text-red-700">Logout</button>
            </div>
          ) : (
            <Link href="/customer/login" onClick={() => setIsOpen(false)} className="hover:text-brand-accent py-4 border-y border-stone-200">Login / Register</Link>
          )}

          <Link href="/booking" onClick={() => setIsOpen(false)} className="btn-luxury text-center mt-2">Book Now</Link>
        </div>
      )}
    </header>
  );
}