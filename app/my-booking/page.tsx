'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { formatINR } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function Content() {
  const params = useSearchParams();
  const router = useRouter();
  const initialRef = params.get('ref'); 
  
  const [user, setUser] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  
  // सर्च के लिए स्टेट्स
  const [searchRef, setSearchRef] = useState(initialRef || '');
  const [searchedBooking, setSearchedBooking] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  
  // लोडिंग स्टेट्स
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 1. यूज़र लॉगिन चेक करें और उसकी हिस्ट्री लाएँ
  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      
      if (user) {
        setLoadingHistory(true);
        supabase.from('bookings')
          .select('*, rooms(category, room_number), invoices(id)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) {
              setUserBookings(data);
            } else {
              console.error("Error fetching history:", error);
            }
            setLoadingHistory(false);
          });
      }
      setLoadingProfile(false);
    });
  }, []);

  // 2. अगर URL में ?ref=... है, तो अपने आप सर्च करें
  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [initialRef]);

  // 3. सर्च करने का फंक्शन
  const handleSearch = async (refToSearch: string) => {
    if (!refToSearch) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchedBooking(null);

    try {
      const res = await fetch(`/api/bookings/search?ref=${refToSearch}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking not found');
      setSearchedBooking(data.booking);
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/my-booking?ref=${searchRef}`);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // बुकिंग कार्ड UI
  const renderBookingCard = (booking: any, isSearched: boolean = false) => (
    <div className={`bg-white border p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isSearched ? 'border-[text-desert-text] border-2' : 'border-stone-200'}`}>
      <div>
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Reference</p>
        <p className="text-xl font-mono font-bold text-[brand-primary] mb-2">{booking.booking_reference}</p>
        <p className="text-sm font-bold text-[text-desert-text]">{booking.rooms?.category} (Room {booking.rooms?.room_number})</p>
        <p className="text-xs text-stone-500 mt-1">
          {new Date(booking.check_in).toLocaleDateString('en-IN')} to {new Date(booking.check_out).toLocaleDateString('en-IN')}
        </p>
        {isSearched && booking.guests && (
          <p className="text-xs text-stone-600 mt-2 font-bold">Guest: {booking.guests.full_name}</p>
        )}
      </div>
      
      <div className="text-right flex flex-col items-end gap-2">
        <div>
          <p className="text-lg font-bold text-[brand-primary] mb-1">{formatINR(booking.total_amount)}</p>
          <div className="flex gap-2 justify-end">
            <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-sm border ${
              booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
              booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
              'bg-stone-100 text-stone-600 border-stone-200'
            }`}>
              {booking.status.replace('_', ' ')}
            </span>
            <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-sm border ${
              booking.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>
        </div>

        {/* ✅ डाउनलोड रसीद बटन */}
        {booking.invoices && booking.invoices.length > 0 && (
          <Link 
            href={`/my-booking/invoice/${booking.id}`} 
            target="_blank"
            className="mt-1 inline-flex items-center gap-1 bg-[brand-primary] text-[text-desert-text] border border-[text-desert-text] hover:bg-[text-desert-text] hover:text-[brand-primary] px-3 py-1.5 text-xs font-bold transition-colors rounded-sm"
          >
            📥 Download Receipt
          </Link>
        )}
      </div>
    </div>
  );

  if (loadingProfile) return <div className="p-20 text-center font-serif text-[brand-primary]">Loading Profile...</div>;

  return (
    <>
      <Navbar />
      <div className="bg-[brand-primary] py-16 text-center text-white">
        <h1 className="text-5xl font-serif font-bold mb-4 text-[text-desert-text]">
          {user ? 'My Profile & Bookings' : 'Find Your Booking'}
        </h1>
        {user && (
          <div className="flex flex-col items-center gap-2 mt-4">
            <p className="text-stone-300 text-sm">Logged in as: <strong>{user.email}</strong></p>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 underline">Logout</button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 min-h-[50vh]">
        
        {/* सर्च बार */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={onSearchSubmit} className="flex flex-col md:flex-row gap-2 bg-white p-4 border border-stone-200 shadow-sm">
            <input 
              type="text" 
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              placeholder="Enter Booking Reference (e.g. JDP-XXXXXX)" 
              className="w-full bg-[brand-bg] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[text-desert-text] uppercase font-mono" 
              required
            />
            <button type="submit" disabled={searchLoading} className="bg-[text-desert-text] text-[brand-primary] hover:bg-[brand-primary] hover:text-[text-desert-text] px-8 py-3 text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50 whitespace-nowrap">
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchError && <p className="text-red-600 text-sm mt-2 text-center font-bold bg-red-50 p-2 border border-red-200">{searchError}</p>}
        </div>

        {/* सर्च रिजल्ट */}
        {searchedBooking && (
          <div className="mb-12 animate-fade-up">
            <h3 className="text-2xl font-serif text-[brand-primary] mb-4 border-b pb-2">Search Result</h3>
            {renderBookingCard(searchedBooking, true)}
          </div>
        )}

        {/* पुरानी हिस्ट्री */}
        {user && (
          <div className="mt-16 pt-8 border-t border-stone-200">
            <h3 className="text-2xl font-serif text-[brand-primary] mb-6">My Booking History</h3>
            
            {loadingHistory ? (
              <div className="text-center p-10 font-serif text-stone-500">Loading your bookings...</div>
            ) : userBookings.length === 0 ? (
              <div className="text-center p-10 bg-white border border-stone-200">
                <p className="text-stone-500 mb-4">You have no past bookings.</p>
                <Link href="/rooms" className="bg-[text-desert-text] text-[brand-primary] px-6 py-2 font-bold uppercase tracking-widest text-xs inline-block">Book a Room</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div key={booking.id}>
                    {renderBookingCard(booking, false)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}

export default function MyBookingPage() {
  return <Suspense fallback={<div className="text-center py-20 font-serif text-[brand-primary]">Loading...</div>}><Content /></Suspense>;
}