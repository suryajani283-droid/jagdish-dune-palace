import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const revalidate = 0;

export default async function OffersPage() {
  const { data: offers } = await supabaseAdmin.from('offers').select('*').eq('is_active', true);

  return (
    <>
      <Navbar />
      <div className="bg-[[var(--theme-primary)]] py-20 text-center text-white">
        <h1 className="text-5xl font-serif font-bold mb-4 text-brand-gold">Special Offers</h1>
        <p className="text-stone-300">Exclusive packages for a memorable stay</p>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {offers?.map((offer) => (
            <div key={offer.id} className="bg-white border text-[var(--theme-secondary)] p-8 flex flex-col justify-between rounded-sm shadow-lg">
              <div>
                <h2 className="text-3xl font-serif text-[var(--theme-primary)] mb-3">{offer.title}</h2>
                <p className="text-stone-600 mb-6">{offer.description}</p>
              </div>
              <div className="bg-[var(--theme-bg)] p-4 border border-dashed text-[var(--theme-secondary)] flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-stone-500 uppercase">Use Code:</span>
                <span className="text-xl font-mono font-bold text-brand-gold tracking-widest">{offer.coupon_code}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-600">Save {offer.discount_percent}%</p>
                <a href="/booking" className="btn-luxury text-xs py-2 px-4">Book Now</a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}