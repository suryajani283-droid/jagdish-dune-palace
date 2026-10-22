import { supabaseAdmin } from '@/lib/supabase/admin';
import { createRoom } from './actions';
import { EditRoomForm } from '@/components/EditRoomForm';

const ALL_AMENITIES = ['AC', 'WiFi', 'TV', 'Geyser', 'Room Heater', 'Balcony', 'Mini Bar', 'Spa', 'Kitchen'];

export default async function ManageRoomsPage() {
  const supabase = supabaseAdmin;
  const today = new Date().toISOString().split('T')[0];

  const { data: rooms, error: roomErr } = await supabase
    .from('rooms')
    .select('*')
    .order('room_number', { ascending: true });

  const { data: activeBookings } = await supabase
    .from('bookings')
    .select('room_id, guest_id, guests(full_name)')
    .lte('check_in', today)
    .gt('check_out', today)
    .in('status', ['confirmed', 'checked_in']);

  if (roomErr) return <div className="p-8 text-red-600">Error loading rooms</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[bg-desert-text]">Manage Rooms</h1>
        <p className="text-stone-500 text-sm mt-1">Add, edit or remove hotel rooms</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Add New Room Form */}
        <div className="lg:col-span-1">
          <form action={async (formData: FormData) => { 'use server'; await createRoom(formData); }} className="bg-white p-6 border border-stone-200 shadow-sm space-y-3 sticky top-8">
            <h2 className="text-xl font-bold text-[bg-desert-text] mb-2 border-b pb-2">+ Add New Room</h2>
            
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Room Number *</label>
              <input type="text" name="room_number" required placeholder="e.g. 401" className="w-full bg-[#faf8f5] border border-stone-200 px-3 py-1.5 text-sm focus:border-[text-desert-text]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Category *</label>
              <input type="text" name="category" required placeholder="e.g. Deluxe" className="w-full bg-[#faf8f5] border border-stone-200 px-3 py-1.5 text-sm focus:border-[text-desert-text]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Area *</label>
                <input type="text" name="area" required placeholder="300 sq. ft." className="w-full bg-[#faf8f5] border border-stone-200 px-3 py-1.5 text-sm focus:border-[text-desert-text]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Price (₹) *</label>
                <input type="number" name="base_price" required placeholder="3500" className="w-full bg-[#faf8f5] border border-stone-200 px-3 py-1.5 text-sm focus:border-[text-desert-text]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Max Adults *</label>
                <input type="number" name="max_adults" required defaultValue={2} min={1} className="w-full bg-[#faf8f5] border border-stone-200 px-3 py-1.5 text-sm focus:border-[text-desert-text]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Max Children *</label>
                <input type="number" name="max_children" required defaultValue={0} min={0} className="w-full bg-[#faf8f5] border border-stone-200 px-3 py-1.5 text-sm focus:border-[text-desert-text]" />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Amenities</label>
              <div className="grid grid-cols-2 gap-1">
                {ALL_AMENITIES.map(a => (
                  <label key={a} className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
                    <input type="checkbox" name="amenities" value={a} className="accent-[text-desert-text] w-3 h-3" /> {a}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Status *</label>
              <select name="status" required className="w-full bg-[#faf8f5] border border-stone-200 px-3 py-1.5 text-sm focus:border-[text-desert-text]">
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-[text-desert-text] text-[bg-desert-text] hover:bg-[bg-desert-text] hover:text-[text-desert-text] py-2 text-xs uppercase tracking-widest font-bold transition-colors mt-2">
              Create Room
            </button>
          </form>
        </div>

        {/* Rooms List */}
        <div className="lg:col-span-3 grid md:grid-cols-2 gap-6 items-start">
          {rooms?.map((room) => {
            const currentBooking = activeBookings?.find(b => b.room_id === room.id);
            const isOccupied = !!currentBooking;

            return (
              <div key={room.id} className="bg-white border border-stone-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[bg-desert-text]">{room.category}</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Room {room.room_number}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-bold uppercase rounded-sm border ${isOccupied ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {isOccupied ? 'Occupied' : room.status}
                  </div>
                </div>

                {room.images && room.images.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-stone-100">
                    {room.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt={`Room ${i}`} className="w-16 h-16 object-cover rounded-sm border border-stone-200 shrink-0" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-red-500 font-bold mb-4 bg-red-50 p-2 border border-red-100">⚠️ No images uploaded yet.</p>
                )}

                <EditRoomForm room={room} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}