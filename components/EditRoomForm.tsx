'use client';

import { useState } from 'react';
import { updateRoomDetails } from '@/app/admin/rooms/actions';
import { DeleteRoomButton } from '@/components/DeleteRoomButton';

// सुविधाओं की लिस्ट
const ALL_AMENITIES = ['AC', 'WiFi', 'TV', 'Geyser', 'Room Heater', 'Balcony', 'Mini Bar', 'Spa', 'Kitchen'];

export function EditRoomForm({ room }: { room: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>(room.images || []);

  const handleRemoveImage = (imgUrl: string) => {
    setCurrentImages(currentImages.filter(url => url !== imgUrl));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const newFiles = formData.getAll('room_images') as File[];
    const validFiles = newFiles.filter(f => f.size > 0);
    const totalImages = currentImages.length + validFiles.length;

    if (totalImages < 3) {
      setError('Minimum 3 images required.'); setLoading(false); return;
    }
    if (totalImages > 5) {
      setError('Maximum 5 images allowed.'); setLoading(false); return;
    }

    formData.set('existing_images', currentImages.join(','));
    const res = await updateRoomDetails(room.id, formData);
    
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || 'Failed to update room.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t pt-4">
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Room Number</label>
          <input type="text" name="room_number" defaultValue={room.room_number} required className="w-full bg-[#faf8f5] border border-stone-200 px-2 py-1 text-sm focus:border-[#D4AF37]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Category</label>
          <input type="text" name="category" defaultValue={room.category} required className="w-full bg-[#faf8f5] border border-stone-200 px-2 py-1 text-sm focus:border-[#D4AF37]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Area (Sq.ft.)</label>
          <input type="text" name="area" defaultValue={room.area || '250 sq. ft.'} required className="w-full bg-[#faf8f5] border border-stone-200 px-2 py-1 text-sm focus:border-[#D4AF37]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Price (₹)</label>
          <input type="number" name="base_price" defaultValue={room.base_price} required className="w-full bg-[#faf8f5] border border-stone-200 px-2 py-1 text-sm focus:border-[#D4AF37]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Max Adults</label>
          <input type="number" name="max_adults" defaultValue={room.max_adults || room.capacity} min={1} required className="w-full bg-[#faf8f5] border border-stone-200 px-2 py-1 text-sm focus:border-[#D4AF37]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Max Children</label>
          <input type="number" name="max_children" defaultValue={room.max_children || 0} min={0} required className="w-full bg-[#faf8f5] border border-stone-200 px-2 py-1 text-sm focus:border-[#D4AF37]" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Status</label>
        <select name="status" defaultValue={room.status} className="w-full bg-[#faf8f5] border border-stone-200 px-2 py-1 text-sm focus:border-[#D4AF37]">
          <option value="available">Available</option>
          <option value="maintenance">Maintenance</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Amenities (Checkboxes) */}
      <div>
        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Facilities & Amenities</label>
        <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 border border-stone-200">
          {ALL_AMENITIES.map(amenity => (
            <label key={amenity} className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
              <input 
                type="checkbox" 
                name="amenities" 
                value={amenity} 
                defaultChecked={room.amenities?.includes(amenity)}
                className="accent-[#D4AF37] w-4 h-4" 
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-stone-50 p-3 border border-stone-200">
        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-2">Manage Photos ({currentImages.length}/5)</label>
        
        {currentImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {currentImages.map((img, i) => (
              <div key={i} className="relative w-14 h-14 group">
                <img src={img} alt="Room" className="w-full h-full object-cover rounded-sm border border-stone-300 shadow-sm" />
                <button type="button" onClick={() => handleRemoveImage(img)} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-800">✕</button>
              </div>
            ))}
          </div>
        )}

        <input type="file" name="room_images" multiple accept=".jpg,.jpeg,.png,.webp" className="w-full text-xs bg-white border border-stone-200 file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[bg-desert-text] file:text-white hover:file:bg-[#D4AF37]" />
        <input type="hidden" name="existing_images" value={currentImages.join(',')} />
      </div>

      {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-2 border border-red-200">{error}</p>}
      {success && <p className="text-green-600 text-xs font-bold bg-green-50 p-2 border border-green-200">Room updated successfully!</p>}

      <div className="flex justify-between items-center pt-2">
        <DeleteRoomButton roomId={room.id} />
        <button type="submit" disabled={loading} className="bg-[bg-desert-text] text-white hover:bg-[#D4AF37] px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}