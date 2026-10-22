'use client'; // यह लाइन बहुत जरुरी है

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-[brand-accent] text-white px-8 py-3 text-sm font-bold shadow-lg hover:bg-[brand-primary] transition-colors rounded-sm"
    >
      🖨️ Print / Save PDF
    </button>
  );
}