export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--theme-bg)]">
      <div className="w-16 h-16 border-4 text-[var(--theme-secondary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-serif text-xl text-[var(--theme-primary)]">Loading Rooms...</p>
    </div>
  );
}