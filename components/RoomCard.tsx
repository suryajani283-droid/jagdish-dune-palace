'use client';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function RoomCard({ room }: { room: any }) {
  const images = (room.images && room.images.length > 0) ? room.images : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % images.length); };
  const prevSlide = (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col relative">
      
      {/* Slider */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((img: string, index: number) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img src={img} alt={`${room.category} - ${index}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        
        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10 flex items-center gap-1">
          📷 {images.length} Photos
        </div>

        {images.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 hover:bg-white text-[bg-desert-text] w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md">‹</button>
            <button onClick={nextSlide} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 hover:bg-white text-[bg-desert-text] w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md">›</button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_: any, idx: number) => (
                <button key={idx} onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-[#D4AF37] w-4' : 'bg-white/60 hover:bg-white'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-serif font-bold text-[bg-desert-text]">{room.category}</h3>
          <div className="text-right">
            <span className="block text-xl font-bold text-[#D4AF37]">{formatINR(room.base_price)}</span>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider">/ night</span>
          </div>
        </div>

        {/* Area & Capacity */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-stone-500 font-medium border-b border-stone-100 pb-3">
          <span className="flex items-center gap-1">📏 {room.area || '250 sq. ft.'}</span>
          <span className="flex items-center gap-1">👨‍🦱 {room.max_adults || room.capacity} Adults</span>
          <span className="flex items-center gap-1">👶 {room.max_children || 0} Children</span>
        </div>

        {/* Amenities Badges */}
        <div className="flex flex-wrap gap-2 mb-6 flex-grow">
          {room.amenities && room.amenities.length > 0 ? (
            room.amenities.slice(0, 4).map((amenity: string) => (
              <span key={amenity} className="text-[10px] bg-[#faf8f5] text-stone-600 px-2 py-1 rounded-sm border border-stone-200 font-semibold">
                {amenity}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-stone-400 italic">Premium Amenities Included</span>
          )}
          {room.amenities && room.amenities.length > 4 && (
            <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-sm font-semibold">+{room.amenities.length - 4} More</span>
          )}
        </div>

        {/* यहाँ गलती सुधार दी गई है: </button> की जगह </Link> कर दिया है */}
        <Link href={`/booking?room=${room.id}`} className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[bg-desert-text] w-full text-center py-2.5 text-xs uppercase tracking-widest font-bold transition-colors block">
          Book This Room
        </Link>
      </div>
    </div>
  );
}