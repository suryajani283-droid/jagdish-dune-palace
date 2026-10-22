import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
  const role = profile?.role || 'admin'; 
  const displayName = profile?.full_name || user.email;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      
      <aside className="w-full md:w-64 bg-[bg-desert-text] text-white flex flex-col print:hidden shadow-xl z-20">
        <div className="p-6 border-b border-stone-800">
          <h2 className="text-xl font-serif font-bold text-[text-desert-text]">JDP Admin</h2>
          <p className="text-xs text-stone-400 mt-1">{displayName}</p>
          <p className="text-[10px] text-[text-desert-text] uppercase tracking-widest mt-1 bg-[text-desert-text]/10 inline-block px-2 py-0.5 rounded-sm">{role}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 text-sm overflow-y-auto">
          <Link href="/admin/dashboard" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors">Dashboard</Link>
          
          {/* Bookings के सब-लिंक्स */}
          <div className="pt-2">
            <p className="px-4 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Bookings</p>
            <Link href="/admin/bookings?filter=all" className="block px-4 py-2 hover:bg-white/5 rounded-sm transition-colors">All Bookings</Link>
            <Link href="/admin/bookings?filter=pending" className="block px-4 py-2 hover:bg-white/5 rounded-sm transition-colors">Pending</Link>
            <Link href="/admin/bookings?filter=refund" className="block px-4 py-2 hover:bg-white/5 rounded-sm transition-colors">Refunds & Cancelled</Link>
            <Link href="/admin/bookings?filter=history" className="block px-4 py-2 hover:bg-white/5 rounded-sm transition-colors">History (Checked-Out)</Link>
          </div>
          
          <div className="py-2">
            <Link href="/admin/bookings/new" className="block px-4 py-3 bg-[text-desert-text] text-[bg-desert-text] font-bold rounded-sm hover:bg-[#b8984e] transition-colors shadow-md">
              + New Booking
            </Link>
          </div>

          <Link href="/admin/rooms" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors">Manage Rooms</Link>
          
          {role === 'admin' && (
            <>
              <Link href="/admin/expenses" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors border-t border-stone-800 mt-2 pt-4">Expenses</Link>
              <Link href="/admin/offers" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors">Offers & Coupons</Link>
              <Link href="/admin/reports" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors">Reports</Link>
              <Link href="/admin/staff" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors">Staff</Link>
              <Link href="/admin/gallery" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors">Gallery</Link>
              <Link href="/admin/settings" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors">Settings</Link>
            </>
          )}
          
          <div className="mt-8 pt-4 border-t border-stone-800">
            <Link href="/" className="block px-4 py-3 hover:bg-white/5 rounded-sm transition-colors text-stone-400">← Back to Website</Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto print:overflow-visible print:bg-white print:p-0 print:m-0">
        {children}
      </main>
    </div>
  );
}