import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils';
import { ExportButton } from '@/components/ExportButton';
import { PrintButton } from '@/components/PrintButton';
import Link from 'next/link';

export default async function InvoicesPage() {
  // सभी इनवॉइस लाएँ (गेस्ट और बुकिंग डिटेल्स के साथ)
  const { data: invoices, error } = await supabaseAdmin
    .from('invoices')
    .select(`
      *,
      bookings (
        booking_reference,
        guests (full_name, phone)
      )
    `)
    .order('issued_at', { ascending: false });

  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  // Excel एक्सपोर्ट के लिए डेटा तैयार करें
  const exportData = invoices?.map(inv => ({
    invoice_number: inv.invoice_number,
    date: new Date(inv.issued_at).toLocaleDateString('en-IN'),
    guest_name: inv.bookings?.guests?.full_name || 'N/A',
    booking_ref: inv.bookings?.booking_reference || 'N/A',
    taxable_value: inv.taxable_value,
    cgst: inv.gst_amount / 2,
    sgst: inv.gst_amount / 2,
    total: inv.total
  })) || [];

  const exportHeaders = [
    { label: 'Invoice No', key: 'invoice_number' },
    { label: 'Date', key: 'date' },
    { label: 'Guest Name', key: 'guest_name' },
    { label: 'Booking Ref', key: 'booking_ref' },
    { label: 'Taxable Value (₹)', key: 'taxable_value' },
    { label: 'CGST (₹)', key: 'cgst' },
    { label: 'SGST (₹)', key: 'sgst' },
    { label: 'Total (₹)', key: 'total' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[brand-primary]">GST Invoices History</h1>
          <p className="text-stone-500 text-sm mt-1">Track all generated bills for GST filing</p>
        </div>
        
        <div className="flex gap-2">
          <ExportButton 
            data={exportData} 
            headers={exportHeaders} 
            filename="GST_Invoices_Report" 
          />
          <PrintButton />
        </div>
      </div>

      {/* प्रिंट हेडर */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Jagdish Dune Palace</h1>
        <p className="text-sm">GST Invoices History (Generated on {new Date().toLocaleDateString('en-IN')})</p>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto print:shadow-none print:border-none">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-[brand-bg] border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500 print:bg-gray-100 print:text-black">
            <tr>
              <th className="px-4 py-4 font-bold">Invoice No & Date</th>
              <th className="px-4 py-4 font-bold">Guest Details</th>
              <th className="px-4 py-4 font-bold text-right">Taxable Value</th>
              <th className="px-4 py-4 font-bold text-right">CGST (6%)</th>
              <th className="px-4 py-4 font-bold text-right">SGST (6%)</th>
              <th className="px-4 py-4 font-bold text-right">Total Amount</th>
              <th className="px-4 py-4 font-bold text-center print:hidden">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {invoices?.map((inv) => (
              <tr key={inv.id} className="hover:bg-stone-50/50">
                <td className="px-4 py-4">
                  <p className="font-mono font-bold text-[brand-primary]">{inv.invoice_number}</p>
                  <p className="text-xs text-stone-400">{new Date(inv.issued_at).toLocaleDateString('en-IN')}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-[brand-primary]">{inv.bookings?.guests?.full_name}</p>
                  <p className="text-xs text-stone-500 font-mono">{inv.bookings?.booking_reference}</p>
                </td>
                <td className="px-4 py-4 text-right">{formatINR(inv.taxable_value)}</td>
                <td className="px-4 py-4 text-right text-stone-500">{formatINR(inv.gst_amount / 2)}</td>
                <td className="px-4 py-4 text-right text-stone-500">{formatINR(inv.gst_amount / 2)}</td>
                <td className="px-4 py-4 text-right font-bold text-[text-desert-text]">{formatINR(inv.total)}</td>
                <td className="px-4 py-4 text-center print:hidden">
                  <Link href={`/admin/bookings/${inv.booking_id}/invoice`} className="text-xs font-bold text-[brand-primary] hover:text-[text-desert-text] underline">
                    View Bill
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          {/* कुल टैक्स का हिसाब */}
          {invoices && invoices.length > 0 && (
            <tfoot className="bg-[brand-primary] text-[text-desert-text] font-bold print:bg-gray-200 print:text-black">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right uppercase tracking-wider text-xs">Total (All Invoices)</td>
                <td className="px-4 py-3 text-right">{formatINR(invoices.reduce((sum, inv) => sum + Number(inv.taxable_value), 0))}</td>
                <td className="px-4 py-3 text-right">{formatINR(invoices.reduce((sum, inv) => sum + Number(inv.gst_amount / 2), 0))}</td>
                <td className="px-4 py-3 text-right">{formatINR(invoices.reduce((sum, inv) => sum + Number(inv.gst_amount / 2), 0))}</td>
                <td className="px-4 py-3 text-right text-lg">{formatINR(invoices.reduce((sum, inv) => sum + Number(inv.total), 0))}</td>
                <td className="print:hidden"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}