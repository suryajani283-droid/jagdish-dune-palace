import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[var(--theme-primary)] text-white/70 py-16 mt-20 border-t-4 border-[var(--theme-secondary)] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <h3 className="text-[var(--theme-secondary)] text-2xl font-serif mb-4">Jagdish Dune Palace</h3>
          <p className="text-sm leading-relaxed mb-6">A luxury heritage hotel nestled in the golden sands of Chohtan, Barmer.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Explore</h4>
          <ul className="text-sm space-y-3">
            <li><Link href="/rooms" className="hover:text-[var(--theme-secondary)] transition-colors">Our Rooms</Link></li>
            <li><Link href="/gallery" className="hover:text-[var(--theme-secondary)] transition-colors">Gallery</Link></li>
            <li><Link href="/offers" className="hover:text-[var(--theme-secondary)] transition-colors">Special Offers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Support</h4>
          <ul className="text-sm space-y-3">
            <li><Link href="/contact" className="hover:text-[var(--theme-secondary)] transition-colors">Contact Us</Link></li>
            <li><Link href="/my-booking" className="hover:text-[var(--theme-secondary)] transition-colors">My Booking</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--theme-secondary)] transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Contact</h4>
          <ul className="text-sm space-y-2 mb-4">
            <li>📍 Chohtan, Barmer, Rajasthan</li>
            <li>📞 +91 7599936000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 mt-12 pt-6 text-center text-xs text-white/50">© {new Date().getFullYear()} Jagdish Dune Palace.</div>
    </footer>
  );
}