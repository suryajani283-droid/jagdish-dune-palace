import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = supabaseAdmin;
  const today = new Date().toISOString().split('T')[0];

  // 1. सारी बुकिंग्स
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, guests(full_name)')
    .order('created_at', { ascending: false });

  // 2. सारे खर्चे (Expenses)
  const { data: allExpenses } = await supabase.from('expenses').select('amount');
  const totalExpenses = allExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

  // 3. आज आने और जाने वाले मेहमान
  const arrivals = allBookings?.filter(b => b.check_in === today && b.status !== 'cancelled') || [];
  const departures = allBookings?.filter(b => b.check_out === today && b.status !== 'cancelled') || [];

  // 4. रेवेन्यू
  let totalRevenue = 0;
  let pendingPayments = 0;

  allBookings?.forEach((booking) => {
    if (booking.status !== 'cancelled') {
      if (booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out') {
        if (booking.source === 'website' && booking.status === 'confirmed') {
           pendingPayments += Number(booking.total_amount); 
        } else {
           totalRevenue += Number(booking.total_amount);
        }
      } else if (booking.status === 'pending') {
        pendingPayments += Number(booking.total_amount);
      }
    }
  });

  // 5. मुनाफा (Net Profit = Revenue - Expenses)
  const netProfit = totalRevenue - totalExpenses;
  const recentBookings = allBookings?.slice(0, 5) || [];
  const { count: totalRooms } = await supabase.from('rooms').select('*', { count: 'exact', head: true });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1815]">Dashboard Overview</h1>
          <p className="text-stone-500 text-sm mt-1">Welcome back! Here is your hotel's performance today.</p>
        </div>
        <Link href="/admin/bookings/new" className="bg-[#c9a961] text-white px-6 py-3 text-sm font-bold rounded-sm hover:bg-[#1a1815] transition-colors">
          + Create Booking
        </Link>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-10">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 border border-stone-200 shadow-sm border-t-4 border-t-green-500">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatINR(totalRevenue)}</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 border border-stone-200 shadow-sm border-t-4 border-t-red-500">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">{formatINR(totalExpenses)}</p>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 border border-stone-200 shadow-sm border-t-4 border-t-[#c9a961]">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-[#c9a961]' : 'text-red-600'}`}>{formatINR(netProfit)}</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-5 border border-stone-200 shadow-sm border-t-4 border-t-yellow-500">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{formatINR(pendingPayments)}</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 border border-stone-200 shadow-sm border-t-4 border-t-blue-500">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Bookings</p>
          <p className="text-2xl font-bold text-[#1a1815]">{allBookings?.length || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Arrivals & Departures */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-stone-200 shadow-sm">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
              <h2 className="font-bold text-[#1a1815]">Arrivals Today</h2>
              <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-bold rounded-full">{arrivals.length}</span>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto">
              {!arrivals.length ? <p className="text-stone-500 text-sm text-center py-4">No arrivals today.</p> : (
                <ul className="space-y-3">
                  {arrivals.map((b) => (
                    <li key={b.id} className="text-sm border-b border-stone-100 pb-2">
                      <p className="font-bold text-[#1a1815]">{b.guests?.full_name}</p>
                      <p className="text-xs text-stone-500">{b.booking_reference} • {b.guests_count} Guests</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 shadow-sm">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
              <h2 className="font-bold text-[#1a1815]">Departures Today</h2>
              <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded-full">{departures.length}</span>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto">
              {!departures.length ? <p className="text-stone-500 text-sm text-center py-4">No departures today.</p> : (
                <ul className="space-y-3">
                  {departures.map((b) => (
                    <li key={b.id} className="text-sm border-b border-stone-100 pb-2">
                      <p className="font-bold text-[#1a1815]">{b.guests?.full_name}</p>
                      <p className="text-xs text-stone-500">{b.booking_reference} • {b.guests_count} Guests</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Bookings */}
        <div className="md:col-span-2 bg-white border border-stone-200 shadow-sm">
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
            <h2 className="font-bold text-[#1a1815]">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-[#c9a961] font-bold hover:underline">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-[#faf8f5] border-b border-stone-200 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Guest</th>
                  <th className="px-4 py-3 font-bold">Ref</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#1a1815]">{b.guests?.full_name}</p>
                      <p className="text-xs text-stone-400">{new Date(b.created_at).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{b.booking_reference}</td>
                    <td className="px-4 py-3 font-bold text-[#c9a961]">{formatINR(b.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        b.status === 'checked_in' ? 'bg-blue-100 text-blue-700' : 
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}