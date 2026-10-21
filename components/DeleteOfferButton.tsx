'use client';

import { deleteOffer } from '@/app/admin/offers/actions';
import { useState } from 'react';

export function DeleteOfferButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("क्या आप वाकई इस ऑफर को डिलीट करना चाहते हैं?");
    
    if (confirmDelete) {
      setLoading(true);
      const res = await deleteOffer(id);
      setLoading(false);
      
      if (!res.success) {
        alert("Error: " + res.error);
      }
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleDelete} 
      disabled={loading}
      className="text-red-600 hover:text-red-800 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}