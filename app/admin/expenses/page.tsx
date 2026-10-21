import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils';
import { addExpense } from './actions';
import { ExportButton } from '@/components/ExportButton';
import { PrintButton } from '@/components/PrintButton';
import Link from 'next/link';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  
  // डिफ़ॉल्ट रूप से आज का महीना और साल चुनें
  const selectedMonth = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const selectedYear = params.year ? parseInt(params.year) : now.getFullYear();

  // उस महीने की पहली और आखिरी तारीख निकालें
  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]; // महीने का आखिरी दिन

  // डेटाबेस से उस महीने के खर्चे लाएँ
  const { data: expenses, error } = await supabaseAdmin
    .from('expenses')
    .select('*')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-600 font-bold bg-red-50 m-8">Database Error: {error.message}</div>;
  }

  const totalExpense = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const today = new Date().toISOString().split('T')[0];

  async function submitExpense(formData: FormData) {
    'use server';
    await addExpense(formData);
  }

  // महीनों के नाम
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
      
      {/* हेडर, फिल्टर और बटन */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1815]">Expense Management</h1>
          <p className="text-stone-500 text-sm mt-1">Track and export monthly hotel expenses</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-stone-200 px-6 py-2 shadow-sm">
            <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-0.5">Selected Month Total</p>
            <p className="text-xl font-bold text-red-600">{formatINR(totalExpense)}</p>
          </div>
          
          <ExportButton 
            data={expenses || []} 
            headers={[
              { label: 'Date', key: 'expense_date' },
              { label: 'Title', key: 'title' },
              { label: 'Category', key: 'category' },
              { label: 'Amount (INR)', key: 'amount' },
              { label: 'Notes', key: 'notes' }
            ]}
            filename={`Expenses_${monthNames[selectedMonth - 1]}_${selectedYear}`}
          />
          <PrintButton />
        </div>
      </div>

      {/* Month & Year Filter */}
      <div className="bg-white border border-stone-200 p-4 mb-6 shadow-sm flex items-center gap-4 print:hidden">
        <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Filter Month:</span>
        <form method="GET" className="flex gap-2">
          <select name="month" defaultValue={selectedMonth} className="bg-[#faf8f5] border border-stone-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#c9a961]">
            {monthNames.map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
          <select name="year" defaultValue={selectedYear} className="bg-[#faf8f5] border border-stone-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#c9a961]">
            {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button type="submit" className="bg-[#1a1815] text-white px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-[#c9a961]">Apply Filter</button>
          {params.month && (
            <Link href="/admin/expenses" className="bg-stone-200 text-stone-700 px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-stone-300">Clear</Link>
          )}
        </form>
      </div>

      {/* प्रिंट हेडर */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase">Jagdish Dune Palace</h1>
        <p className="text-sm font-semibold text-gray-700">Expense Report: {monthNames[selectedMonth - 1]} {selectedYear}</p>
        <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString('en-IN')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 print:block">
        
        {/* Add Expense Form (प्रिंट में नहीं दिखेगा) */}
        <div className="lg:col-span-1 print:hidden">
          <form action={submitExpense} className="bg-white p-6 border border-stone-200 shadow-sm space-y-4 sticky top-8">
            <h2 className="text-xl font-bold text-[#1a1815] mb-4 border-b pb-2">Add New Expense</h2>
            
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Expense Title *</label>
              <input type="text" name="title" required placeholder="e.g. Electricity Bill" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Amount (₹) *</label>
              <input type="number" name="amount" required min={1} className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Category *</label>
              <select name="category" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]">
                <option value="Salary">Staff Salary</option>
                <option value="Electricity">Electricity / Water</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Food">Food & Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Date *</label>
              <input type="date" name="expense_date" required defaultValue={today} className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Notes (Optional)</label>
              <textarea name="notes" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961] h-20"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#c9a961] text-white hover:bg-[#1a1815] py-3 text-xs uppercase tracking-widest font-bold transition-colors">
              Save Expense
            </button>
          </form>
        </div>

        {/* Expenses Table */}
        <div className="lg:col-span-2 bg-white border border-stone-200 shadow-sm overflow-x-auto print:shadow-none print:border-none print:col-span-3">
          <table className="w-full text-left text-sm text-stone-600 print:text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500 print:bg-gray-100 print:text-black">
              <tr>
                <th className="px-6 py-4 font-bold border-r border-stone-100 print:border-gray-300">Date</th>
                <th className="px-6 py-4 font-bold border-r border-stone-100 print:border-gray-300">Title</th>
                <th className="px-6 py-4 font-bold border-r border-stone-100 print:border-gray-300">Category</th>
                <th className="px-6 py-4 font-bold border-r border-stone-100 print:border-gray-300">Notes</th>
                <th className="px-6 py-4 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 print:divide-gray-300">
              {!expenses?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-stone-500">No expenses found for {monthNames[selectedMonth - 1]} {selectedYear}.</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/50 print:hover:bg-transparent">
                    <td className="px-6 py-4 whitespace-nowrap border-r border-stone-50 print:border-gray-300">
                      {new Date(exp.expense_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1a1815] border-r border-stone-50 print:text-black print:border-gray-300">
                      {exp.title}
                    </td>
                    <td className="px-6 py-4 border-r border-stone-50 print:border-gray-300">
                      <span className="bg-stone-100 text-stone-600 px-2 py-1 text-xs font-bold rounded-sm border border-stone-200 print:border-none print:p-0 print:bg-transparent">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500 max-w-[200px] truncate border-r border-stone-50 print:border-gray-300">
                      {exp.notes || '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600 text-right print:text-black">
                      {formatINR(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {expenses && expenses.length > 0 && (
              <tfoot className="bg-stone-50 font-bold text-[#1a1815] print:bg-gray-100 print:text-black">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right border-r border-stone-200 print:border-gray-300 uppercase tracking-wider text-xs">Monthly Total</td>
                  <td className="px-6 py-4 text-right text-red-600 print:text-black text-lg">{formatINR(totalExpense)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

      </div>
    </div>
  );
}