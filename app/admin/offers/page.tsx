import { supabaseAdmin } from '@/lib/supabase/admin';
import { createOffer } from './actions';
import { DeleteOfferButton } from '@/components/DeleteOfferButton'; // नीचे दिया है

export default async function AdminOffersPage() {
  const { data: offers } = await supabaseAdmin.from('offers').select('*').order('created_at', { ascending: false });

  async function submitOffer(formData: FormData) {
    'use server';
    await createOffer(formData);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-[#2c0e0e] mb-8">Manage Offers & Coupons</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form action={submitOffer} className="bg-white p-6 border shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">+ Create Offer</h2>
            <input type="text" name="title" placeholder="Offer Title (e.g. Summer Sale)" required className="w-full border p-2" />
            <input type="text" name="description" placeholder="Description" className="w-full border p-2" />
            <input type="text" name="coupon_code" placeholder="Coupon Code (e.g. SUMMER20)" required className="w-full border p-2 uppercase" />
            <input type="number" name="discount_percent" placeholder="Discount % (e.g. 20)" required className="w-full border p-2" />
            <button type="submit" className="w-full bg-brand-gold text-white py-2 font-bold">Create</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white border p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Code</th>
                <th className="py-2">Title</th>
                <th className="py-2">Discount</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {offers?.map((offer) => (
                <tr key={offer.id} className="border-b">
                  <td className="py-3 font-mono font-bold text-brand-gold">{offer.coupon_code}</td>
                  <td className="py-3">{offer.title}</td>
                  <td className="py-3 font-bold">{offer.discount_percent}%</td>
                  <td className="py-3 text-right">
                    <DeleteOfferButton id={offer.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}