export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5]">
      <div className="w-16 h-16 border-4 border-[text-desert-text] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-serif text-xl text-[bg-desert-text]">Loading Rooms...</p>
    </div>
  );
}