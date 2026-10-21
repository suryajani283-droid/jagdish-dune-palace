'use client';

import { deleteStaff } from '@/app/admin/staff/actions';

export function DeleteStaffButton({ userId }: { userId: string }) {
  const handleDelete = async () => {
    const confirmDelete = window.confirm("क्या आप वाकई इस स्टाफ को डिलीट करना चाहते हैं? यह वापस नहीं आएगा।");
    
    if (confirmDelete) {
      const res = await deleteStaff(userId);
      if (!res.success) {
        alert("Error: " + res.error);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 font-bold text-xs uppercase tracking-wider transition-colors"
    >
      Delete
    </button>
  );
}