import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[bg-desert-text] text-stone-300 py-16 mt-20 border-t-4 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        
        {/* 1. ब्रांडिंग सेक्शन */}
        <div className="md:col-span-1">
          <h3 className="text-[#D4AF37] text-2xl font-serif mb-4">Jagdish Dune Palace</h3>
          <p className="text-sm leading-relaxed text-stone-400 mb-6">
            A luxury heritage hotel nestled in the golden sands of Chohtan, Barmer. Experience the royal Rajasthani hospitality.
          </p>
          {/* सोशल मीडिया लिंक्स */}
          <div className="flex gap-4">
            <a href="https://www.instagram.com/jagdishpalacechohtan" target="_blank" rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[bg-desert-text] transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[bg-desert-text] transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
          </div>
        </div>

        {/* 2. एक्सप्लोर लिंक्स */}
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Explore</h4>
          <ul className="text-sm space-y-3 text-stone-400">
            <li><Link href="/rooms" className="hover:text-[#D4AF37] transition-colors">Our Rooms</Link></li>
            <li><Link href="/facilities" className="hover:text-[#D4AF37] transition-colors">Facilities</Link></li>
            <li><Link href="/gallery" className="hover:text-[#D4AF37] transition-colors">Gallery</Link></li>
            <li><Link href="/offers" className="hover:text-[#D4AF37] transition-colors">Special Offers</Link></li>
          </ul>
        </div>

        {/* 3. सपोर्ट लिंक्स */}
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Support</h4>
          <ul className="text-sm space-y-3 text-stone-400">
            <li><Link href="/contact" className="hover:text-[#D4AF37] transition-colors">Contact Us</Link></li>
            <li><Link href="/my-booking" className="hover:text-[#D4AF37] transition-colors">My Booking</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/cancellation-policy" className="hover:text-[#D4AF37] transition-colors">Cancellation Policy</Link></li>
          </ul>
        </div>

        {/* 4. संपर्क और Google Map सेक्शन */}
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Contact & Location</h4>
          <ul className="text-sm space-y-2 text-stone-400 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37]">📍</span> 
              <span>Chohtan, Barmer, Rajasthan - 344702</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#D4AF37]">📞</span> 
              <span>+91 98765 43210</span>
            </li>
          </ul>

          {/* Footer वाला छोटा सा Google Map */}
          <div className="w-full h-32 rounded-sm overflow-hidden border border-stone-700 relative mb-3 group">
            <iframe 
              src="https://maps.google.com/maps?q=Jagdish%20Dune%20Palace%20Chohtan%20Barmer%20Rajasthan&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Footer Map"
              className="grayscale group-hover:grayscale-0 transition-all duration-500"
            ></iframe>
            
            {/* मैप के ऊपर क्लिक करने लायक लिंक (ताकि क्लिक करने पर बड़ा मैप खुले) */}
            <a 
              href="https://maps.app.goo.gl/A4xZ4vZ8gLtWraGU7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute inset-0 z-10"
              title="Open in Google Maps"
            ></a>
          </div>
          
          <a 
            href="https://maps.app.goo.gl/A4xZ4vZ8gLtWraGU7" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-[#D4AF37] hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            Get Directions →
          </a>
        </div>

      </div>
      
      <div className="border-t border-stone-800 mt-12 pt-6 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Jagdish Dune Palace. All rights reserved.
      </div>
    </footer>
  );
}