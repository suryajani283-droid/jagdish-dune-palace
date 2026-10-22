export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[brand-bg]">
      <div className="w-16 h-16 border-4 border-[text-desert-text] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-serif text-xl text-[brand-primary]">Loading Rooms...</p>
    </div>
  );
}