'use client';

import { useState } from 'react';
import { addGalleryImage } from '@/app/admin/gallery/actions';

export function GalleryUploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await addGalleryImage(formData);

    if (res.success) {
      // सफल होने पर फॉर्म रीसेट करें
      (e.target as HTMLFormElement).reset();
    } else {
      setError(res.error || 'Failed to upload image');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-stone-200 shadow-sm space-y-4 sticky top-8">
      <h2 className="text-xl font-bold text-[#1a1815] mb-4 border-b pb-2">+ Upload Photo</h2>
      
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Select Image (JPG/PNG) *</label>
        <input 
          type="file" 
          name="image" 
          accept=".jpg,.jpeg,.png,.webp" 
          required 
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300" 
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Image Title (Optional)</label>
        <input 
          type="text" 
          name="title" 
          placeholder="e.g. Royal Suite View" 
          className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-2 focus:outline-none focus:border-[#c9a961]" 
        />
      </div>

      {error && <p className="text-red-600 text-xs bg-red-50 p-2 border border-red-200">{error}</p>}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#c9a961] text-white hover:bg-[#1a1815] py-3 text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </form>
  );
}