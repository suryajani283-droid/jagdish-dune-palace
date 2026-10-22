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

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

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
      <div className="bg-[bg-desert-text] text-stone-300 text-xs py-2 hidden md:block">
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
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          {logoUrl ? (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md shrink-0 bg-white group-hover:scale-105 transition-transform duration-300">
              <img src={logoUrl} alt="Hotel Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#D4AF37] flex items-center justify-center font-serif text-3xl font-bold text-[bg-desert-text] group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-300 shadow-md shrink-0">
              J
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xl md:text-3xl font-serif font-bold text-[bg-desert-text] tracking-wide uppercase leading-tight group-hover:text-[#D4AF37] transition-colors">
              Jagdish Dune
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-sans font-bold text-left mt-1">
              Palace
            </span>
          </div>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-stone-600">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/rooms" className="nav-link">Rooms</Link>
          <Link href="/facilities" className="nav-link">Facilities</Link>
          <Link href="/gallery" className="nav-link">Gallery</Link>
          <Link href="/offers" className="nav-link">Offers</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
          
          {/* Login / Profile */}
          {user ? (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-stone-300">
              <Link href="/my-booking" className="nav-link text-[bg-desert-text] flex items-center gap-1">
                👤 Profile
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/customer/login" className="nav-link text-[bg-desert-text] border border-stone-300 px-3 py-1.5 rounded-sm hover:border-[#D4AF37]">
              Login
            </Link>
          )}

          {/* Book Now Button (Premium Animation) */}
          <Link 
            href="/booking" 
            className="bg-[bg-desert-text] text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[bg-desert-text] transition-all duration-300 py-3 px-6 ml-2 font-bold shadow-md hover:-translate-y-1 hover:shadow-xl"
          >
            Book Now
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="lg:hidden text-2xl text-[bg-desert-text]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-stone-200 px-6 py-6 flex flex-col gap-5 text-sm uppercase tracking-widest font-bold text-stone-600 shadow-lg absolute w-full left-0">
          <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37]">Home</Link>
          <Link href="/rooms" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37]">Rooms</Link>
          <Link href="/facilities" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37]">Facilities</Link>
          <Link href="/gallery" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37]">Gallery</Link>
          <Link href="/offers" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37]">Offers</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37]">Contact</Link>
          
          {user ? (
            <div className="flex flex-col gap-4 py-4 border-y border-stone-200">
              <Link href="/my-booking" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37]">👤 My Profile</Link>
              <button onClick={handleLogout} className="text-red-500 text-left hover:text-red-700">Logout</button>
            </div>
          ) : (
            <Link href="/customer/login" onClick={() => setIsOpen(false)} className="hover:text-[#D4AF37] py-4 border-y border-stone-200">
              Login / Register
            </Link>
          )}

          <Link 
            href="/booking" 
            onClick={() => setIsOpen(false)} 
            className="bg-[bg-desert-text] text-[#D4AF37] border border-[#D4AF37] text-center py-4 mt-2 shadow-md transition-all"
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  );
}