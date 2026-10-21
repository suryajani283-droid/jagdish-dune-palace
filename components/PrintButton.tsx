'use client'; // यह लाइन बहुत जरुरी है

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-[#c9a961] text-white px-8 py-3 text-sm font-bold shadow-lg hover:bg-[#1a1815] transition-colors rounded-sm"
    >
      🖨️ Print / Save PDF
    </button>
  );
}