import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[var(--theme-primary)] py-20 text-center text-white">
        <h1 className="text-5xl font-serif font-bold mb-4 text-[var(--theme-secondary)]">Contact Us</h1>
        <p className="text-stone-300">We are here to help you plan your perfect getaway</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* ===== 1. Contact Details & Form ===== */}
          <div>
            <h3 className="text-3xl font-serif mb-6 text-[var(--theme-primary)]">Get In Touch</h3>
            <p className="text-stone-600 mb-8">Our dedicated team is available 24/7 to assist you with your bookings, queries, and special requests.</p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <span className="text-2xl text-[var(--theme-secondary)]">📍</span>
                <div>
                  <h4 className="font-bold text-[var(--theme-primary)]">Address</h4>
                  <p className="text-sm text-stone-600">Jagdish Dune Palace, Vishnoi Dharmshala Ke Samne,<br/>Barmer Road, Chohtan, Barmer, Rajasthan - 344702</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl text-[var(--theme-secondary)]">📞</span>
                <div>
                  <h4 className="font-bold text-[var(--theme-primary)]">Phone</h4>
                  <p className="text-sm text-stone-600">+91 7599936000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl text-[var(--theme-secondary)]">✉️</span>
                <div>
                  <h4 className="font-bold text-[var(--theme-primary)]">Email</h4>
                  <p className="text-sm text-stone-600">jagdishdunepalace@gmail.com</p>
                </div>
              </div>
            </div>
            
            <form className="space-y-5 bg-white p-8 border border-stone-200 shadow-sm rounded-sm">
              <h3 className="text-2xl font-serif mb-2 text-[var(--theme-primary)]">Send a Message</h3>
              <input type="text" placeholder="Your Full Name" className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:text-[var(--theme-secondary)]" required />
              <input type="email" placeholder="Your Email" className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:text-[var(--theme-secondary)]" required />
              <input type="tel" placeholder="Your Phone Number" className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:text-[var(--theme-secondary)]" required />
              <textarea placeholder="How can we help you?" className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:text-[var(--theme-secondary)] h-32" required></textarea>
              <button type="button" className="w-full bg-[var(--theme-primary)] text-[var(--theme-secondary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primary)] py-4 font-bold uppercase tracking-widest text-sm transition-colors">
                Submit Message
              </button>
            </form>
          </div>

          {/* ===== 2. Google Map Section ===== */}
          <div className="flex flex-col h-full">
            <h3 className="text-3xl font-serif mb-6 text-[var(--theme-primary)]">Our Location</h3>
            <p className="text-stone-600 mb-6">Find us easily on Google Maps. Click the button below to get directions directly to our hotel.</p>
            
            {/* Google Map Embed (iframe) */}
            <div className="flex-grow w-full min-h-[400px] border-4 text-[var(--theme-secondary)] shadow-lg mb-6 relative">
              <iframe 
                src="https://maps.google.com/maps?q=Jagdish%20Dune%20Palace%20Chohtan%20Barmer%20Rajasthan&t=&z=14&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Jagdish Dune Palace Location"
              ></iframe>
            </div>

            {/* Get Directions Button */}
            <a 
              href="https://maps.app.goo.gl/A4xZ4vZ8gLtWraGU7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primary)] py-4 font-bold uppercase tracking-widest text-sm transition-colors text-center flex items-center justify-center gap-2 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Get Directions on Google Maps
            </a>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}























































































































































































































