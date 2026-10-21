import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-serif font-bold mb-6">Our Story</h1>
        <div className="w-24 h-1 bg-[#c9a961] mx-auto mb-8"></div>
        <p className="text-lg text-stone-600 leading-relaxed mb-6">
          Welcome to Jagdish Dune Palace, a sanctuary of luxury nestled in the heart of the Thar Desert in Chohtan, Barmer. 
          Our heritage property offers a perfect blend of traditional Rajasthani hospitality and modern comfort.
        </p>
        <p className="text-lg text-stone-600 leading-relaxed">
          Every corner of our palace tells a story of royalty, crafted with intricate architecture, golden sands, and breathtaking sunsets. 
          Whether you are seeking a peaceful retreat or an adventurous desert safari, we promise an unforgettable experience.
        </p>
      </div>
      <Footer />
    </>
  );
}