import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { RoomCard } from '@/components/RoomCard';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Link from 'next/link';
import Image from 'next/image';

async function FeaturedRooms() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from('rooms').select('*').limit(3);
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {rooms?.map((room) => <RoomCard key={room.id} room={room} />)}
    </div>
  );
}

export default async function HomePage() {
  const { data: settings } = await supabaseAdmin.from('hotel_settings').select('*').eq('id', 1).single();

  const instaPosts = [
    'https://www.instagram.com/p/DXFlniek5a2',
    'https://www.instagram.com/reel/DXCc6Fikxjp',
    'https://www.instagram.com/p/DYoxC8_RvRQ',
    'https://www.instagram.com/p/DXFlniek5a2'
  ];

  return (
    <>
      <Navbar />
      <Hero settings={settings} />
      
      {/* Heritage Section */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] w-full">
            <Image src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800" alt="Hotel Heritage" fill className="object-cover rounded-t-[100px] rounded-bl-[100px] shadow-2xl" />
          </div>
          <div>
            <p className="text-[#C5A059] uppercase tracking-[0.3em] text-xs font-bold mb-4">Our Heritage</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1320] mb-6 leading-tight">A Royal Retreat in the Heart of the Thar Desert</h2>
            <p className="text-stone-500 leading-relaxed mb-6 font-light text-lg">Welcome to {settings?.hotel_name || 'Jagdish Dune Palace'}, a sanctuary of luxury nestled in the golden sands of Chohtan, Barmer.</p>
            <Link href="/about" className="btn-outline">Discover Our Story</Link>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C5A059] uppercase tracking-[0.3em] text-xs font-bold mb-3">Accommodation</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1320]">Rooms & Suites</h2>
            <div className="w-16 h-1 bg-[#C5A059] mx-auto mt-6"></div>
          </div>
          <Suspense fallback={<div className="text-center py-10 font-serif text-lg text-stone-500">Loading rooms...</div>}>
            <FeaturedRooms />
          </Suspense>
          <div className="text-center mt-16">
            <Link href="/rooms" className="btn-outline">View All Rooms</Link>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-20 bg-[#F8F9FA] border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#C5A059] uppercase tracking-[0.3em] text-xs font-bold mb-3">Follow Our Journey</p>
          <h2 className="text-4xl font-serif font-bold text-[#0B1320] mb-4">@jagdishpalacechohtan</h2>
          <p className="text-stone-500 mb-10 max-w-xl mx-auto">Experience the beauty of the palace through our latest photos and reels.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 items-start">
            {instaPosts.map((url, i) => (
              <div key={i} className="w-full flex justify-center overflow-hidden rounded-sm bg-white border border-stone-200 shadow-sm">
                <iframe src={`${url}/embed`} width="100%" height="450" frameBorder="0" scrolling="no" allow="encrypted-media" className="border-0" title={`Instagram Post ${i + 1}`}></iframe>
              </div>
            ))}
          </div>
          <a href="https://www.instagram.com/jagdishpalacechohtan" target="_blank" rel="noopener noreferrer" className="btn-luxury">Follow Us on Instagram</a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1920")' }} />
        <div className="relative z-20 max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Begin Your Royal Journey</h2>
          <p className="text-stone-200 mb-10 text-lg font-light">Book your stay today and experience the magic of the Thar Desert.</p>
          <Link href="/booking" className="btn-luxury">Reserve Now</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}