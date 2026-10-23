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
    <header className="sticky top-0 z-50 bg-[var(--theme-bg)] border-b border-black/10 shadow-sm transition-colors duration-500">
      {/* Top Bar */}
      <div className="bg-[var(--theme-primary)] text-white/80 text-xs py-2 hidden md:block transition-colors duration-500">
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
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[var(--theme-secondary)] shadow-md shrink-0 bg-white group-hover:scale-105 transition-transform duration-300">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[var(--theme-secondary)] flex items-center justify-center font-serif text-3xl font-bold text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)] group-hover:text-[var(--theme-secondary)] transition-all duration-300 shadow-md shrink-0">
              J
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xl md:text-3xl font-serif font-bold text-[var(--theme-primary)] tracking-wide uppercase leading-tight transition-colors">
              Jagdish Dune
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--theme-secondary)] font-sans font-bold text-left mt-1">
              Palace
            </span>
          </div>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-[var(--theme-text)]/70">
          <Link href="/" className="hover:text-[var(--theme-secondary)] transition-colors">Home</Link>
          <Link href="/rooms" className="hover:text-[var(--theme-secondary)] transition-colors">Rooms</Link>
          <Link href="/facilities" className="hover:text-[var(--theme-secondary)] transition-colors">Facilities</Link>
          <Link href="/gallery" className="hover:text-[var(--theme-secondary)] transition-colors">Gallery</Link>
          <Link href="/offers" className="hover:text-[var(--theme-secondary)] transition-colors">Offers</Link>
          <Link href="/contact" className="hover:text-[var(--theme-secondary)] transition-colors">Contact</Link>
          
          {user ? (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-black/10">
              <Link href="/my-booking" className="text-[var(--theme-primary)] flex items-center gap-1 hover:text-[var(--theme-secondary)]">👤 Profile</Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">Logout</button>
            </div>
          ) : (
            <Link href="/customer/login" className="text-[var(--theme-primary)] border border-black/20 px-3 py-1.5 rounded-sm hover:border-[var(--theme-secondary)]">Login</Link>
          )}

          <Link href="/booking" className="btn-primary py-3 px-6 ml-2">Book Now</Link>
        </nav>

        <button className="lg:hidden text-2xl text-[var(--theme-primary)]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}