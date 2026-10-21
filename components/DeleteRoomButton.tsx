'use client';

import { deleteRoom } from '@/app/admin/rooms/actions';

export function DeleteRoomButton({ roomId }: { roomId: string }) {
  const handleDelete = async () => {
    const confirmDelete = window.confirm("क्या आप वाकई इस रूम को डिलीट करना चाहते हैं? (अगर इसकी बुकिंग हिस्ट्री है तो यह डिलीट नहीं होगा)");
    if (confirmDelete) {
      const res = await deleteRoom(roomId);
      if (!res.success) alert("Error: " + res.error);
    }
  };

  return (
    <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-xs font-bold uppercase tracking-wider transition-colors">
      Delete Room
    </button>
  );
}