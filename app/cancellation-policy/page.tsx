// app/cancellation-policy/page.tsx
import { Navbar } from '@/components/Navbar'; // <-- कर्ली ब्रेसेस { } जोड़ें
import { Footer } from '@/components/Footer'; // <-- कर्ली ब्रेसेस { } जोड़ें

export default function CancellationPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-serif font-bold mb-8 text-brand-dark">Cancellation Policy</h1>
        <div className="space-y-6 text-stone-600 leading-relaxed font-light text-lg">
          <p>Cancellations made 7 days or more before the check-in date will receive a 100% refund.</p>
          <p>Cancellations made between 3 to 7 days before check-in will incur a 50% cancellation fee.</p>
          <p>Cancellations made less than 48 hours before check-in will not be eligible for any refund.</p>
          <p>For any cancellation requests, please contact reservations@jagdishdunepalace.com or call +91 98765 43210.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}