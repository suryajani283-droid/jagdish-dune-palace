'use client';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function RoomCard({ room }: { room: any }) {
  const images = (room.images && room.images.length > 0) ? room.images : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="theme-card border border-black/5 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex flex-col relative rounded-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((img: string, index: number) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img src={img} alt={`${room.category}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-serif font-bold text-[var(--theme-primary)]">{room.category}</h3>
          <div className="text-right">
            <span className="block text-xl font-bold text-[var(--theme-secondary)]">{formatINR(room.base_price)}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">/ night</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-gray-500 font-medium border-b border-gray-100 pb-3">
          <span className="flex items-center gap-1">📏 {room.area || '250 sq. ft.'}</span>
          <span className="flex items-center gap-1">👨‍🦱 {room.max_adults || room.capacity} Adults</span>
          <span className="flex items-center gap-1">👶 {room.max_children || 0} Children</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 flex-grow">
          {room.amenities && room.amenities.slice(0, 4).map((amenity: string) => (
            <span key={amenity} className="text-[10px] bg-black/5 text-gray-600 px-2 py-1 rounded-sm font-semibold">{amenity}</span>
          ))}
        </div>

        <Link href={`/booking?room=${room.id}`} className="btn-outline-theme w-full text-center py-2.5 text-xs">Book This Room</Link>
      </div>
    </div>
  );
}