// app/privacy-policy/page.tsx
import { Navbar } from '@/components/Navbar'; // <-- कर्ली ब्रेसेस { } जोड़ें
import { Footer } from '@/components/Footer'; // <-- कर्ली ब्रेसेस { } जोड़ें

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-serif font-bold mb-8 text-brand-dark">Privacy Policy</h1>
        <div className="space-y-6 text-stone-600 leading-relaxed font-light text-lg">
          <p>Your privacy is important to us. We collect personal information (name, email, phone) only to process your bookings and provide better service.</p>
          <p>We do not sell or share your data with third parties, except for payment processing (Razorpay) and legal requirements.</p>
          <p>All payment data is securely processed by our payment gateway partners. We do not store your credit/debit card details on our servers.</p>
          <p>By using our website, you consent to our privacy policy.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}