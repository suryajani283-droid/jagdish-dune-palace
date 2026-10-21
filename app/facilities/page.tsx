import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const facilities = [
  { name: 'Royal Dining', desc: 'Authentic Rajasthani cuisine and multi-cuisine delicacies.', icon: '🍽️' },
  { name: 'Desert Safari', desc: 'Guided camel and jeep safaris into the Thar desert.', icon: '🐪' },
  { name: 'Swimming Pool', desc: 'Relax in our temperature-controlled outdoor pool.', icon: '🏊' },
  { name: 'Spa & Wellness', desc: 'Traditional Ayurvedic massages and therapies.', icon: '💆' },
  { name: 'High-Speed WiFi', desc: 'Complimentary internet access across the property.', icon: '📶' },
  { name: '24/7 Concierge', desc: 'Dedicated staff to cater to your every need.', icon: '🛎️' },
];

export default function FacilitiesPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-serif font-bold text-center mb-4">Hotel Facilities</h1>
        <p className="text-center text-stone-600 mb-16">Experience luxury at every step</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {facilities.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-sm shadow-sm border border-stone-100 text-center hover:shadow-md transition">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3">{f.name}</h3>
              <p className="text-stone-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}