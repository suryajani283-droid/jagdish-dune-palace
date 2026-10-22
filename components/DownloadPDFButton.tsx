'use client';
import { useState } from 'react';

export function DownloadPDFButton({ elementId, filename }: { elementId: string, filename: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById(elementId);
    
    if (element) {
      const opt = {
        margin:       0.5,
        filename:     `${filename}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      } as any; 
      
      html2pdf().set(opt).from(element).save().then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      disabled={loading}
      className="bg-[bg-desert-text] text-[text-desert-text] border border-[text-desert-text] hover:bg-[text-desert-text] hover:text-[bg-desert-text] px-8 py-3 text-sm font-bold shadow-lg transition-colors rounded-sm flex items-center gap-2"
    >
      {loading ? (
        <>⏳ Generating PDF...</>
      ) : (
        <>📥 Download PDF</>
      )}
    </button>
  );
}