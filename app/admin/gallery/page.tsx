import { supabaseAdmin } from '@/lib/supabase/admin';
import { GalleryUploadForm } from '@/components/GalleryUploadForm';
import { DeleteGalleryButton } from '@/components/DeleteGalleryButton';

export default async function AdminGalleryPage() {
  const { data: images, error } = await supabaseAdmin
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-600 font-bold">Error loading gallery: {error.message}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1a1815]">Manage Gallery</h1>
        <p className="text-stone-500 text-sm mt-1">Upload and manage photos for the public gallery</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* 1. अपलोड फॉर्म */}
        <div className="lg:col-span-1">
          <GalleryUploadForm />
        </div>

        {/* 2. गैलरी ग्रिड */}
        <div className="lg:col-span-3">
          {!images || images.length === 0 ? (
            <div className="bg-white p-10 text-center text-stone-500 border border-stone-200 rounded-sm">
              No images uploaded yet. Use the form to upload your first photo.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square bg-stone-100 rounded-sm overflow-hidden border border-stone-200 shadow-sm">
                  <img 
                    src={img.image_url} 
                    alt={img.title || 'Gallery'} 
                    className="w-full h-full object-cover" 
                  />
                  
                  <DeleteGalleryButton id={img.id} />
                  
                  {img.title && (
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs p-2 truncate">
                      {img.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}