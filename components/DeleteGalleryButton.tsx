'use client';

import { deleteGalleryImage } from '@/app/admin/gallery/actions';

export function DeleteGalleryButton({ id }: { id: string }) {
  const handleDelete = async () => {
    const confirmDelete = window.confirm("क्या आप इस फोटो को डिलीट करना चाहते हैं?");
    if (confirmDelete) {
      const res = await deleteGalleryImage(id);
      if (!res.success) alert("Error: " + res.error);
    }
  };

  return (
    <button type="button" onClick={handleDelete} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-10" title="Delete Image">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
      </svg>
    </button>
  );
}