// app/rooms/page.tsx

import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RoomCard } from '@/components/RoomCard';
import { createClient } from '@/lib/supabase/server';

// डेटा फेच करने के लिए एक अलग असिंक्रोनस कंपोनेंट
async function RoomsList() {
  const supabase = await createClient();
const { data: rooms } = await supabase.from('rooms').select('id, room_number, category, base_price, images, area, max_adults, max_children, amenities');

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {rooms?.map((room) => <RoomCard key={room.id} room={room} />)}
    </div>
  );
}

// मुख्य पेज
export default function RoomsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-serif font-bold text-center mb-4">Our Rooms</h1>
        <p className="text-center text-stone-600 mb-12">Choose from our curated collection</p>
        
        {/* Suspense का मतलब: जब तक RoomsList का डेटा नहीं आता, तब तक 'Loading rooms...' दिखाओ */}
        <Suspense fallback={<div className="text-center py-10 font-serif text-lg text-stone-500">Loading rooms...</div>}>
          <RoomsList />
        </Suspense>

      </div>
      <Footer />
    </>
  );
}