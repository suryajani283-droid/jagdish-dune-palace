import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';

export default async function GuestHistoryPage() {
  // सभी गेस्ट और उनकी बुकिंग्स का डेटा लाएँ
  const { data: guests, error } = await supabaseAdmin
    .from('guests')
    .select(`
      id, 
      full_name, 
      email, 
      phone, 
      created_at,
      bookings (
        id,
        total_amount,
        status,
        check_in,
        payment_status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2c0e0e]">Guest History (CRM)</h1>
          <p className="text-stone-500 text-sm mt-1">View all your past and current customers</p>
        </div>
        <div className="bg-[#2c0e0e] text-[#D4AF37] px-6 py-2 rounded-sm font-bold">
          Total Customers: {guests?.length || 0}
        </div>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-[#faf8f5] border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-6 py-4 font-bold">Guest Name</th>
              <th className="px-6 py-4 font-bold">Contact Info</th>
              <th className="px-6 py-4 font-bold text-center">Total Stays</th>
              <th className="px-6 py-4 font-bold text-right">Total Spent</th>
              <th className="px-6 py-4 font-bold text-right">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {guests?.map((guest) => {
              // केवल कैंसिल न हुई बुकिंग्स गिनें
              const validBookings = guest.bookings?.filter((b: any) => b.status !== 'cancelled') || [];
              const totalSpent = validBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);
              
              // आखिरी बार कब आया (सबसे नई चेक-इन तारीख)
              const lastVisit = validBookings.length > 0 
                ? validBookings.sort((a: any, b: any) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime())[0].check_in 
                : null;

              return (
                <tr key={guest.id} className="hover:bg-stone-50/50">
                  <td className="px-6 py-4 font-bold text-[#2c0e0e]">{guest.full_name}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-stone-600 font-medium">{guest.phone}</p>
                    <p className="text-xs text-stone-400">{guest.email || 'No email'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-bold border border-stone-200">
                      {validBookings.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#D4AF37]">
                    {formatINR(totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-right text-xs">
                    {lastVisit ? new Date(lastVisit).toLocaleDateString('en-IN') : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}