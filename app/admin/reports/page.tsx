import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils';
import { ExportButton } from '@/components/ExportButton';
import { PrintButton } from '@/components/PrintButton';

export default async function ReportsPage() {
  const supabase = supabaseAdmin;

  const { data: bookings } = await supabase.from('bookings').select('*');
  const { data: expenses } = await supabase.from('expenses').select('*');

  // पिछले 6 महीनों की लिस्ट बनाएँ
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
    };
  });

  // हर महीने का डेटा कैलकुलेट करें
  const reportData = months.map((m) => {
    const monthBookings = bookings?.filter((b) => {
      if (b.status === 'cancelled') return false;
      const d = new Date(b.created_at);
      return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
    }) || [];

    const monthExpenses = expenses?.filter((e) => {
      const d = new Date(e.expense_date);
      return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
    }) || [];

    const revenue = monthBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
    const expense = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const profit = revenue - expense;

    return {
      month: m.label, // For display
      totalBookings: monthBookings.length,
      revenue: revenue,
      expense: expense,
      profit: profit,
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[brand-primary]">Monthly Reports</h1>
          <p className="text-stone-500 text-sm mt-1">Financial performance for the last 6 months</p>
        </div>
        
        <div className="flex gap-3">
          <ExportButton 
            data={reportData} 
            headers={[
              { label: 'Month', key: 'month' },
              { label: 'Total Bookings', key: 'totalBookings' },
              { label: 'Revenue (INR)', key: 'revenue' },
              { label: 'Expenses (INR)', key: 'expense' },
              { label: 'Net Profit (INR)', key: 'profit' }
            ]}
            filename={`Financial_Report_Last_6_Months`}
          />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Jagdish Dune Palace</h1>
        <p className="text-sm font-semibold text-gray-700">6-Month Financial Report</p>
        <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString('en-IN')}</p>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto print:shadow-none print:border-none">
        <table className="w-full text-left text-sm text-stone-600 print:text-xs">
          <thead className="bg-[brand-bg] border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500 print:bg-gray-100 print:text-black">
            <tr>
              <th className="px-6 py-4 font-bold border-r border-stone-100 print:border-gray-300">Month</th>
              <th className="px-6 py-4 font-bold text-center border-r border-stone-100 print:border-gray-300">Total Bookings</th>
              <th className="px-6 py-4 font-bold text-right border-r border-stone-100 print:border-gray-300">Revenue</th>
              <th className="px-6 py-4 font-bold text-right border-r border-stone-100 print:border-gray-300">Expenses</th>
              <th className="px-6 py-4 font-bold text-right">Net Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 print:divide-gray-300">
            {reportData.map((row, i) => (
              <tr key={i} className="hover:bg-stone-50/50 transition-colors print:hover:bg-transparent">
                <td className="px-6 py-4 font-bold text-[brand-primary] border-r border-stone-50 print:text-black print:border-gray-300">{row.month}</td>
                <td className="px-6 py-4 text-center border-r border-stone-50 print:border-gray-300">
                  <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold border border-stone-200 print:border-none print:p-0 print:bg-transparent">
                    {row.totalBookings}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-green-600 border-r border-stone-50 print:text-black print:border-gray-300">
                  {formatINR(row.revenue)}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-red-600 border-r border-stone-50 print:text-black print:border-gray-300">
                  {formatINR(row.expense)}
                </td>
                <td className={`px-6 py-4 text-right font-bold print:text-black ${row.profit >= 0 ? 'text-[brand-accent]' : 'text-red-600'}`}>
                  {formatINR(row.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}