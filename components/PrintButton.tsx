'use client'; 

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-[var(--theme-secondary)] text-[var(--theme-primary)] px-8 py-3 text-sm font-bold shadow-lg hover:bg-[var(--theme-primary)] hover:text-[var(--theme-secondary)] transition-colors rounded-sm"
    >
      🖨️ Print / Save PDF
    </button>
  );
}