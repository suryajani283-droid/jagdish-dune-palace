// app/terms/page.tsx
import { Navbar } from '@/components/Navbar'; // <-- कर्ली ब्रेसेस { } जोड़ें
import { Footer } from '@/components/Footer'; // <-- कर्ली ब्रेसेस { } जोड़ें

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-serif font-bold mb-8 text-[var(--theme-primary)]">Terms & Conditions</h1>
        <div className="space-y-6 text-stone-600 leading-relaxed font-light text-lg">
          <p>Check-in time is 2:00 PM and check-out time is 11:00 AM. Early check-in and late check-out are subject to availability.</p>
          <p>Valid government-issued ID is mandatory for all guests at the time of check-in.</p>
          <p>Outside food and beverages are not allowed in the premises without prior permission.</p>
          <p>The hotel reserves the right to cancel bookings in case of invalid information or payment failure.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}