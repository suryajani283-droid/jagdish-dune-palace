import { supabaseAdmin } from '@/lib/supabase/admin';
import { createStaff } from './actions';
import { DeleteStaffButton } from '@/components/DeleteStaffButton';
import { createClient } from '@/lib/supabase/server';

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // ✅ यहाँ फ़िल्टर लगा दिया है कि सिर्फ admin और receptionist दिखें, customer नहीं
  const { data: staffMembers, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'receptionist']) 
    .order('created_at', { ascending: false });

  if (error) return <div className="p-8 text-red-600 font-bold">Error: {error.message}</div>;

  async function submitStaff(formData: FormData) {
    'use server';
    const res = await createStaff(formData);
    if (!res.success) throw new Error(res.error);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[bg-desert-text]">Staff Management</h1>
        <p className="text-stone-500 text-sm mt-1">Create, manage and remove hotel staff accounts</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Add Staff Form */}
        <div className="lg:col-span-1">
          <form action={submitStaff} className="bg-white p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-[bg-desert-text] mb-4 border-b pb-2">Add New Staff</h2>
            
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Full Name *</label>
              <input type="text" name="full_name" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#D4AF37]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email (Login ID) *</label>
              <input type="email" name="email" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#D4AF37]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Password *</label>
              <input type="text" name="password" required minLength={6} placeholder="Min 6 characters" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#D4AF37]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Role *</label>
              <select name="role" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#D4AF37]">
                <option value="receptionist">Receptionist (सिर्फ बुकिंग देख सकते हैं)</option>
                <option value="admin">Admin (पूरा एक्सेस)</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-[bg-desert-text] text-white hover:bg-[#D4AF37] py-3 text-xs uppercase tracking-widest font-bold transition-colors">
              Create Account
            </button>
          </form>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2 bg-white border border-stone-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Joined Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {!staffMembers?.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-stone-500">No staff members found.</td>
                </tr>
              ) : (
                staffMembers.map((staff) => (
                  <tr key={staff.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4 font-bold text-[bg-desert-text]">{staff.full_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded-sm border ${staff.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {new Date(staff.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* खुद को डिलीट करने का ऑप्शन नहीं दिखाएंगे */}
                      {staff.id !== currentUser?.id && (
                        <DeleteStaffButton userId={staff.id} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}