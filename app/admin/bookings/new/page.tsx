import { supabaseAdmin } from '@/lib/supabase/admin';
import { createManualBooking } from '../actions'; // <-- यहाँ ../actions है
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NewManualBooking() {
  const { data: rooms } = await supabaseAdmin.from('rooms').select('*').eq('status', 'available').order('room_number');
  const today = new Date().toISOString().split('T')[0];

  async function submitForm(formData: FormData) {
    'use server';
    const result = await createManualBooking(formData);
    
    if (result.success) {
      redirect('/admin/bookings'); 
    } else {
      redirect(`/admin/bookings/new?error=${encodeURIComponent(result.error || 'Booking failed')}`);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/bookings" className="text-stone-500 hover:text-[#c9a961]">← Back</Link>
        <h1 className="text-3xl font-serif font-bold text-[#1a1815]">New Manual Booking</h1>
      </div>

      <form action={submitForm} className="bg-white p-8 border border-stone-200 shadow-sm space-y-6">
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Guest Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1a1815] border-b pb-2">Guest Details</h2>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Full Name *</label>
              <input type="text" name="full_name" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Phone Number *</label>
              <input type="text" name="phone" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email (Optional)</label>
              <input type="email" name="email" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
          </div>

          {/* Booking Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1a1815] border-b pb-2">Stay Details</h2>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Select Room *</label>
              <select name="room_id" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]">
                <option value="">-- Choose Room --</option>
                {rooms?.map(r => (
                  <option key={r.id} value={r.id}>Room {r.room_number} - {r.category} (₹{r.base_price})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Check-in *</label>
                <input type="date" name="check_in" min={today} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Check-out *</label>
                <input type="date" name="check_out" min={today} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Guests *</label>
              <input type="number" name="guests_count" defaultValue={1} min={1} max={6} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end">
          <button type="submit" className="bg-[#c9a961] text-white hover:bg-[#1a1815] px-8 py-3 text-sm uppercase tracking-widest font-bold transition-colors">
            Create Booking
          </button>
        </div>
      </form>
    </div>
  );
}