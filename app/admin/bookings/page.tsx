import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils';
import { updateBookingStatus, generateInvoice, markAsPaid, markAsRefunded } from './actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const params = await searchParams;
  const filter = params.filter || 'all'; // all, pending, active, refund, history

  const supabase = supabaseAdmin;

  let query = supabase
    .from('bookings')
    .select('*, rooms(room_number, category), guests(full_name, phone), invoices(id)')
    .order('created_at', { ascending: false });

  // फिल्टर के हिसाब से डेटा लाएँ
  if (filter === 'pending') query = query.eq('status', 'pending');
  else if (filter === 'active') query = query.in('status', ['confirmed', 'checked_in']);
  else if (filter === 'refund') query = query.eq('status', 'cancelled');
  else if (filter === 'history') query = query.eq('status', 'checked_out');

  const { data: bookings, error } = await query;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  async function createBill(formData: FormData) {
    'use server';
    const bookingId = formData.get('bookingId') as string;
    const result = await generateInvoice(bookingId);
    if (result.success && result.invoiceId) redirect(`/admin/bookings/${bookingId}/invoice`);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'checked_in': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked_out': return 'bg-stone-100 text-stone-800 border-stone-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'pending', label: 'Pending' },
    { id: 'active', label: 'Active / In-House' },
    { id: 'refund', label: 'Cancelled & Refunds' },
    { id: 'history', label: 'Checked-Out (History)' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-[brand-primary]">Booking Management</h1>
        <Link href="/admin/bookings/new" className="bg-[text-desert-text] text-[brand-primary] px-6 py-2 text-sm font-bold rounded-sm hover:bg-[#b8984e] transition-colors">
          + Manual Booking
        </Link>
      </div>

      {/* Tabs (टैब्स) */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-2">
        {tabs.map(tab => (
          <Link 
            key={tab.id} 
            href={`/admin/bookings?filter=${tab.id}`}
            className={`px-4 py-2 text-sm font-bold rounded-t-sm transition-colors ${filter === tab.id ? 'bg-[brand-primary] text-[text-desert-text]' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-[brand-bg] border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-6 py-4 font-bold">Ref & Source</th>
              <th className="px-6 py-4 font-bold">Guest Info</th>
              <th className="px-6 py-4 font-bold">Amount & Payment</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {!bookings?.length ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-stone-500">No bookings found for this category.</td></tr>
            ) : (
              bookings.map((booking) => {
                const isPaid = booking.payment_status === 'paid';
                const isRefunded = booking.payment_status === 'refunded';

                return (
                  <tr key={booking.id} className="hover:bg-stone-50/50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-[brand-primary]">{booking.booking_reference}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${booking.source === 'website' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {booking.source === 'website' ? '🌐 Online' : '🏨 Reception'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-[brand-primary]">{booking.guests?.full_name}</p>
                      <p className="text-xs text-stone-500">{booking.guests?.phone}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-[text-desert-text] text-base">{formatINR(booking.total_amount)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        
                        {/* पेमेंट स्टेटस बैज */}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${isRefunded ? 'bg-stone-100 text-stone-500 border-stone-300' : isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {isRefunded ? 'Refunded' : isPaid ? 'Paid' : 'Unpaid'}
                        </span>

                        {/* Mark Paid बटन */}
                        {!isPaid && !isRefunded && (
                          <form action={async () => { 'use server'; await markAsPaid(booking.id); }}>
                            <button className="text-[10px] bg-[brand-primary] text-white px-2 py-0.5 rounded hover:bg-[text-desert-text] transition-colors">Mark Paid</button>
                          </form>
                        )}

                        {/* Refund बटन (सिर्फ कैंसिल और पेड बुकिंग के लिए) */}
                        {isPaid && booking.status === 'cancelled' && (
                          <form action={async () => { 'use server'; await markAsRefunded(booking.id); }}>
                            <button className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-800 transition-colors">Issue Refund</button>
                          </form>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-stone-400 mt-1">
                        {new Date(booking.check_in).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(booking.check_out).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'pending' && (
                          <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'confirmed'); }}>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs font-bold transition-colors">Confirm</button>
                          </form>
                        )}
                        {booking.status === 'confirmed' && (
                          <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'checked_in'); }}>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold transition-colors">Check In</button>
                          </form>
                        )}
                        {booking.status === 'checked_in' && (
                          <form action={createBill}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <button className="bg-[text-desert-text] hover:bg-[#b8984e] text-white px-3 py-1.5 text-xs font-bold transition-colors">Checkout & Bill</button>
                          </form>
                        )}
                        {booking.invoices && booking.invoices.length > 0 && (
                          <Link href={`/admin/bookings/${booking.id}/invoice`} className="border border-stone-300 text-stone-700 hover:bg-stone-100 px-3 py-1.5 text-xs font-bold transition-colors">
                            View Bill
                          </Link>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}