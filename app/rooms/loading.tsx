export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5]">
      <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-serif text-xl text-[#2c0e0e]">Loading Rooms...</p>
    </div>
  );
}