import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DownloadPDFButton } from '@/components/DownloadPDFButton'; // <-- नया बटन इम्पोर्ट किया

function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }
  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero';
  return inWords(rounded).trim() + ' Rupees Only';
}

export default async function CustomerInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  const { data: settings } = await supabaseAdmin.from('hotel_settings').select('*').eq('id', 1).single();

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, guests(*), rooms(*), invoices(*)')
    .eq('id', bookingId)
    .single();

  if (!booking || !booking.invoices || booking.invoices.length === 0) {
    notFound();
  }

  const invoice = booking.invoices[0];
  const guest = booking.guests;
  const room = booking.rooms;
  const amountInWords = numberToWords(invoice.total);
  const cgst = invoice.gst_amount / 2;
  const sgst = invoice.gst_amount / 2;

  const hotelName = settings?.hotel_name || 'Jagdish Dune Palace';
  const hotelAddress = settings?.address || 'Barmer Road, Chohtan, Barmer, Rajasthan - 344702';
  const hotelPhone = settings?.phone || '+91 98765 43210';
  const hotelEmail = settings?.email || 'stay@jagdishdunepalace.com';
  const hotelGstin = settings?.gstin || '08BBLPR0814E2ZP';
  const hotelLogo = settings?.logo_url || '';

  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 flex justify-center print:bg-white print:p-0 print:block font-sans">
      
      {/* ✅ id="invoice-container" जोड़ा गया है ताकि PDF जनरेट हो सके */}
      <div id="invoice-container" className="bg-white w-full max-w-4xl p-8 md:p-12 shadow-xl border border-stone-200 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
          <div className="flex gap-4">
            {hotelLogo && (
              <div className="w-24 h-24 relative shrink-0">
                <img src={hotelLogo} alt="Logo" className="w-full h-full object-contain object-left" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-wide">{hotelName}</h1>
              <p className="text-xs text-gray-600 mt-1 max-w-sm">{hotelAddress}</p>
              <p className="text-xs text-gray-800 mt-2 font-semibold">GSTIN: <span className="font-bold">{hotelGstin}</span></p>
              <p className="text-xs text-gray-800 font-semibold">State Code: 08 (Rajasthan)</p>
              <p className="text-xs text-gray-600 mt-1">Email: {hotelEmail} | Phone: {hotelPhone}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-2">Tax Invoice</h2>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong className="text-gray-900">Invoice No:</strong> {invoice.invoice_number}</p>
              <p><strong className="text-gray-900">Date:</strong> {new Date(invoice.issued_at).toLocaleDateString('en-IN')}</p>
              <p><strong className="text-gray-900">Booking Ref:</strong> {booking.booking_reference}</p>
              <p><strong className="text-gray-900">Place of Supply:</strong> Rajasthan (08)</p>
            </div>
          </div>
        </div>

        {/* GUEST DETAILS */}
        <div className="flex justify-between mb-8 text-xs">
          <div className="w-1/2">
            <h3 className="font-bold text-gray-400 uppercase mb-2 border-b pb-1">Billed To:</h3>
            <p className="font-bold text-sm text-gray-900">{guest?.full_name}</p>
            <p className="text-gray-600 mt-1">Phone: {guest?.phone}</p>
            {guest?.email && <p className="text-gray-600">Email: {guest?.email}</p>}
            {booking.guest_gstin && (
              <p className="text-gray-900 font-bold mt-1">Customer GSTIN: {booking.guest_gstin}</p>
            )}
          </div>
          <div className="w-1/2 text-right">
            <h3 className="font-bold text-gray-400 uppercase mb-2 border-b pb-1">Stay Details:</h3>
            <p><span className="text-gray-500">Check-in:</span> <strong className="text-gray-900">{new Date(booking.check_in).toLocaleDateString('en-IN')}</strong></p>
            <p><span className="text-gray-500">Check-out:</span> <strong className="text-gray-900">{new Date(booking.check_out).toLocaleDateString('en-IN')}</strong></p>
            <p><span className="text-gray-500">Room Type:</span> <strong className="text-gray-900">{room?.category}</strong></p>
            <p><span className="text-gray-500">Guests:</span> <strong className="text-gray-900">{booking.guests_count}</strong></p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table className="w-full text-left text-xs mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300 text-gray-800 uppercase">
              <th className="py-3 px-2 font-bold w-12 text-center">S.No</th>
              <th className="py-3 px-4 font-bold">Description of Service</th>
              <th className="py-3 px-2 font-bold text-center">SAC Code</th>
              <th className="py-3 px-2 font-bold text-right">Rate</th>
              <th className="py-3 px-2 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-4 px-2 text-center">1</td>
              <td className="py-4 px-4">
                <p className="font-bold text-gray-900">Accommodation Services</p>
                <p className="text-gray-500 mt-1">{room?.category} (Room No: {room?.room_number})</p>
              </td>
              <td className="py-4 px-2 text-center">996311</td>
              <td className="py-4 px-2 text-right">{formatINR(invoice.taxable_value)}</td>
              <td className="py-4 px-2 text-right">{formatINR(invoice.taxable_value)}</td>
            </tr>
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="flex justify-between items-start">
          <div className="w-1/2 pr-4 text-xs">
            <p className="text-gray-500 mb-1">Total Amount (in words):</p>
            <p className="font-bold text-gray-900 text-sm">{amountInWords}</p>
          </div>
          <div className="w-1/2">
            <table className="w-full text-xs text-right border-collapse">
              <tbody>
                <tr><td className="py-2 text-gray-500">Taxable Value:</td><td className="py-2 font-semibold text-gray-900">{formatINR(invoice.taxable_value)}</td></tr>
                <tr><td className="py-2 text-gray-500">CGST @ 6%:</td><td className="py-2 font-semibold text-gray-900">{formatINR(cgst)}</td></tr>
                <tr><td className="py-2 text-gray-500">SGST @ 6%:</td><td className="py-2 font-semibold text-gray-900">{formatINR(sgst)}</td></tr>
                <tr className="border-t-2 border-gray-800">
                  <td className="py-3 font-bold text-sm text-gray-900">Grand Total:</td>
                  <td className="py-3 font-bold text-lg text-gray-900">{formatINR(invoice.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 pt-6 border-t border-gray-300 flex justify-between items-end text-xs text-gray-500">
          <div>
            <p className="font-bold text-gray-900 mb-1">Terms & Conditions:</p>
            <p>1. This is a computer-generated invoice and does not require a signature.</p>
            <p>2. All disputes are subject to Barmer (Rajasthan) jurisdiction only.</p>
          </div>
          <div className="text-center">
            <p className="mb-10">For <strong className="text-gray-900">{hotelName}</strong></p>
            <p className="border-t border-gray-400 pt-1 px-8">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex gap-4 print:hidden z-50">
        <Link href="/my-booking" className="bg-white border border-stone-300 text-stone-600 px-6 py-3 text-sm font-bold shadow-lg hover:bg-stone-50 transition-colors rounded-sm">
          ← Back to Bookings
        </Link>
        {/* ✅ प्रिंट की जगह नया PDF डाउनलोड बटन */}
        <DownloadPDFButton elementId="invoice-container" filename={`Invoice_${invoice.invoice_number}`} />
      </div>
    </div>
  );
}