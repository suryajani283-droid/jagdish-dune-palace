import { supabaseAdmin } from '@/lib/supabase/admin';
import { updateSettings } from './actions';

export default async function SettingsPage() {
  const { data: settings } = await supabaseAdmin
    .from('hotel_settings')
    .select('*')
    .eq('id', 1)
    .single();

  async function submitSettings(formData: FormData) {
    'use server';
    const res = await updateSettings(formData);
    if (!res.success) throw new Error(res.error);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1a1815]">Website Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Manage your hotel's information, images and branding</p>
      </div>

      {/* यहाँ से encType हटा दिया गया है */}
      <form action={submitSettings} className="space-y-8">
        
        {/* SECTION 1: HOTEL INFORMATION */}
        <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm">
          <h2 className="text-xl font-bold text-[#1a1815] mb-4 border-b pb-2">1. Hotel Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Hotel Name</label>
              <input type="text" name="hotel_name" defaultValue={settings?.hotel_name} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Phone Number</label>
              <input type="text" name="phone" defaultValue={settings?.phone} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email Address</label>
              <input type="email" name="email" defaultValue={settings?.email} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">GSTIN Number</label>
              <input type="text" name="gstin" defaultValue={settings?.gstin} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Full Address</label>
              <textarea name="address" defaultValue={settings?.address} required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961] h-20"></textarea>
            </div>
          </div>
        </div>

        {/* SECTION 2: HOME PAGE CONTENT */}
        <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm">
          <h2 className="text-xl font-bold text-[#1a1815] mb-4 border-b pb-2">2. Home Page (Hero Section)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Main Heading (Title)</label>
              <input type="text" name="hero_title" defaultValue={settings?.hero_title} className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Sub Heading (Description)</label>
              <textarea name="hero_subtitle" defaultValue={settings?.hero_subtitle} className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961] h-20"></textarea>
            </div>
            
            <div className="bg-[#faf8f5] p-4 border border-stone-200">
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Upload New Hero Background (JPG/PNG)</label>
              <input type="hidden" name="existing_hero_url" value={settings?.hero_image_url || ''} />
              <input type="file" name="hero_file" accept=".jpg,.jpeg,.png,.webp" className="w-full text-sm mb-2" />
              {settings?.hero_image_url && (
                <img src={settings.hero_image_url} alt="Current Hero" className="h-32 object-cover rounded border" />
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: BRANDING (LOGO) */}
        <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm">
          <h2 className="text-xl font-bold text-[#1a1815] mb-4 border-b pb-2">3. Branding & Logo</h2>
          <div className="bg-[#faf8f5] p-4 border border-stone-200">
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Upload New Logo (JPG/PNG)</label>
            <input type="hidden" name="existing_logo_url" value={settings?.logo_url || ''} />
            <input type="file" name="logo_file" accept=".jpg,.jpeg,.png,.webp" className="w-full text-sm mb-2" />
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="Current Logo" className="h-16 object-contain bg-white p-2 rounded border" />
            )}
          </div>
        </div>

        <div className="flex justify-end sticky bottom-4">
          <button type="submit" className="bg-[#1a1815] text-white hover:bg-[#c9a961] px-10 py-4 text-sm uppercase tracking-widest font-bold transition-colors shadow-lg rounded-sm">
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}