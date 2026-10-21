import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

// Next.js को बताएँ कि हर बार नया डेटा लाएँ (कैश का इस्तेमाल न करें)
export const revalidate = 0;

export default async function GalleryPage() {
  const supabase = await createClient();
  
  // डेटाबेस से गैलरी की सारी इमेजेज लाएँ
  const { data: images, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />
      <div className="bg-[#2a2520] py-20 text-center text-white">
        <h1 className="text-5xl font-serif font-bold mb-4">Gallery</h1>
        <p className="text-stone-300">A glimpse into the beauty of Jagdish Dune Palace</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-20 min-h-[50vh]">
        
        {/* अगर कोई इमेज नहीं है */}
        {!images || images.length === 0 ? (
          <div className="text-center text-stone-500 py-16 bg-white border border-stone-200 rounded-sm">
            <p className="text-2xl font-serif mb-2">Photos are coming soon...</p>
            <p className="text-sm">Our gallery is being updated. Please check back later.</p>
          </div>
        ) : (
          
          /* Masonry Layout (Pinterest जैसा) */
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img) => (
              <div 
                key={img.id} 
                className="break-inside-avoid overflow-hidden rounded-sm group relative bg-stone-100 border border-stone-200"
              >
                <img 
                  src={img.image_url} 
                  alt={img.title || 'Jagdish Dune Palace'} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                  loading="lazy"
                />
                
                {/* इमेज पर माउस ले जाने पर टाइटल दिखेगा */}
                {img.title && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white font-serif text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {img.title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
        )}
      </div>
      <Footer />
    </>
  );
}