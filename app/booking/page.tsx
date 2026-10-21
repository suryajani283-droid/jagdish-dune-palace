'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { formatINR, nightsBetween } from '@/lib/utils';
import Script from 'next/script';
import { createClient } from '@/lib/supabase/client';

function BookingContent() {
  const params = useSearchParams();
  const router = useRouter();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // लोडिंग स्टेट
  
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    room_id: params.get('room') || '',
    check_in: '', check_out: '',
    guests_count: 2, special_requests: '',
    payment_method: 'online',
    coupon_code: '',
    guest_gstin: '',
  });

  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // ✅ लॉगिन चेक करने का लॉजिक
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // अगर लॉगिन नहीं है, तो लॉगिन पेज पर भेजें (और बाद में वापस यहीं आएँ)
        router.push('/customer/login?redirect=/booking');
      } else {
        setUser(user);
        // प्रोफाइल से नाम और नंबर भरें
        setForm(prev => ({ 
          ...prev, 
          email: user.email || prev.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || prev.full_name,
          phone: user.user_metadata?.phone || prev.phone
        }));
        setIsCheckingAuth(false);
      }
    });
  }, [router]);

  // अगर ऑथ चेक हो रहा है, तो लोडिंग दिखाएँ
  if (isCheckingAuth) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center font-serif text-xl text-[#2c0e0e]">
          Checking authentication...
        </div>
        <Footer />
      </>
    );
  }

  const search = async () => {
    if (!form.check_in || !form.check_out) return alert('Please select dates');
    setSearching(true); setError('');
    try {
      const res = await fetch(`/api/rooms/availability?check_in=${form.check_in}&check_out=${form.check_out}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch rooms');
      setRooms(data.rooms || []);
      if (data.rooms?.length === 0) setError('No rooms available for these dates.');
    } catch (err: any) {
      setError(err.message);
    } finally { setSearching(false); }
  };

  const applyCoupon = async () => {
    if (!couponInput) return;
    setCheckingCoupon(true); setCouponMessage(''); setIsCouponValid(false); setDiscountPercent(0);
    try {
      const res = await fetch(`/api/offers/validate?code=${couponInput.toUpperCase()}`);
      const data = await res.json();
      if (data.success) {
        setDiscountPercent(data.discount_percent);
        setIsCouponValid(true);
        setCouponMessage(`Coupon Applied! You got ${data.discount_percent}% OFF.`);
        setForm({ ...form, coupon_code: couponInput.toUpperCase() });
      } else { setCouponMessage(data.error || 'Invalid Coupon Code'); }
    } catch (err) { setCouponMessage('Failed to validate coupon. Try again.'); } 
    finally { setCheckingCoupon(false); }
  };

  const selected = rooms.find((r) => r.id === form.room_id);
  const nights = form.check_in && form.check_out ? nightsBetween(form.check_in, form.check_out) : 0;
  const baseTotal = selected ? selected.base_price * nights : 0;
  const discountAmount = (baseTotal * discountPercent) / 100;
  const taxableValue = baseTotal - discountAmount;
  const gstAmount = taxableValue * 0.12;
  const finalTotal = taxableValue + gstAmount;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.room_id) return setError('Please select a room first');
    if (!form.phone) return setError('Mobile number is required for booking');
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            ...form, 
            final_total: finalTotal, 
            discount_applied: discountAmount,
            user_id: user?.id 
        }),
      });
      
      const textData = await res.text();
      let data;
      try { data = JSON.parse(textData); } catch { throw new Error("Server error. Check terminal."); }
      
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      const booking = data.booking;

      if (form.payment_method === 'pay_at_hotel') {
        router.push(`/my-booking?ref=${booking.booking_reference}`);
        return; 
      }

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal, booking_id: booking.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

      if (!(window as any).Razorpay) throw new Error("Razorpay SDK failed to load. Are you online?");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Jagdish Dune Palace",
        description: `Booking Ref: ${booking.booking_reference}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, booking_id: booking.id }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) router.push(`/my-booking?ref=${booking.booking_reference}`);
          else { setError('Payment succeeded but verification failed.'); setSubmitting(false); }
        },
        prefill: { name: form.full_name, email: form.email, contact: form.phone },
        theme: { color: "#D4AF37" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
        setSubmitting(false);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <Navbar />
      <div className="bg-[#2c0e0e] py-16 text-center text-white">
        <h1 className="text-5xl font-serif font-bold mb-4 text-[#D4AF37]">Reserve Your Stay</h1>
        <p className="text-stone-300">Complete your booking securely</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <form onSubmit={submit} className="space-y-10">
          
          {/* 1. Dates */}
          <div className="bg-white p-8 border border-stone-200 shadow-sm">
            <h3 className="text-2xl font-serif mb-6 text-[#2c0e0e]">1. Select Dates</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Check-in</label>
                <input type="date" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                  min={new Date().toISOString().split('T')[0]} value={form.check_in}
                  onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Check-out</label>
                <input type="date" required className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                  min={form.check_in || new Date().toISOString().split('T')[0]} value={form.check_out}
                  onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Guests</label>
                <input type="number" min={1} max={6} className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                  value={form.guests_count} onChange={(e) => setForm({ ...form, guests_count: +e.target.value })} />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={search} disabled={searching} className="w-full bg-[#2c0e0e] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2c0e0e] py-3 text-xs uppercase tracking-widest transition-colors font-bold">
                  {searching ? 'Searching...' : 'Check Rooms'}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Rooms */}
          {rooms.length > 0 && (
            <div className="bg-white p-8 border border-stone-200 shadow-sm animate-fade-up">
              <h3 className="text-2xl font-serif mb-6 text-[#2c0e0e]">2. Select Room</h3>
              <div className="space-y-4">
                {rooms.map((r) => (
                  <label key={r.id} className={`flex justify-between items-center p-4 border cursor-pointer transition-colors ${form.room_id === r.id ? 'border-[#D4AF37] bg-[#faf8f5]' : 'border-stone-200 hover:border-stone-400'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="room" value={r.id} className="accent-[#D4AF37] w-4 h-4"
                        checked={form.room_id === r.id} onChange={() => setForm({ ...form, room_id: r.id })} />
                      <div>
                        <span className="font-bold text-[#2c0e0e] block">{r.category}</span>
                        <span className="text-xs text-stone-500 uppercase tracking-widest">Room {r.room_number}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#D4AF37]">{formatINR(r.base_price)} <span className="text-xs font-normal text-stone-400">/ night</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}

         {/* 3. Guest Details */}
<div className="bg-white p-8 border border-stone-200 shadow-sm">
  <h3 className="text-2xl font-serif mb-6 text-[#2c0e0e]">3. Guest Details</h3>
  <div className="grid md:grid-cols-3 gap-4">
    <input required placeholder="Full Name" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
      value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
    <input readOnly placeholder="Email" type="email" className="w-full bg-stone-100 border border-stone-200 px-4 py-3 text-stone-500 cursor-not-allowed"
      value={form.email} />
    <input required placeholder="Phone Number" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
  </div>
  
  {/* GSTIN फील्ड */}
  <div className="mt-4">
    <input placeholder="Company GSTIN (Optional - for business invoices)" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[#D4AF37] uppercase"
      value={form.guest_gstin} onChange={(e) => setForm({ ...form, guest_gstin: e.target.value.toUpperCase() })} />
  </div>

  <textarea placeholder="Any special requests? (Optional)" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 mt-4 focus:outline-none focus:border-[#D4AF37] h-24"
    value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} />
</div>

          {/* 4. Payment Method */}
          <div className="bg-white p-8 border border-stone-200 shadow-sm">
            <h3 className="text-2xl font-serif mb-6 text-[#2c0e0e]">4. Payment Method</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${form.payment_method === 'online' ? 'border-[#D4AF37] bg-[#faf8f5]' : 'border-stone-200'}`}>
                <input type="radio" name="payment_method" value="online" className="accent-[#D4AF37] w-4 h-4 mt-1"
                  checked={form.payment_method === 'online'} onChange={() => setForm({ ...form, payment_method: 'online' })} />
                <div>
                  <span className="font-bold text-[#2c0e0e] block mb-1">Pay Online (सुरक्षित)</span>
                  <span className="text-xs text-stone-500">UPI, Credit Card, Debit Card, Netbanking के ज़रिए अभी पेमेंट करें।</span>
                </div>
              </label>
              <label className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${form.payment_method === 'pay_at_hotel' ? 'border-[#D4AF37] bg-[#faf8f5]' : 'border-stone-200'}`}>
                <input type="radio" name="payment_method" value="pay_at_hotel" className="accent-[#D4AF37] w-4 h-4 mt-1"
                  checked={form.payment_method === 'pay_at_hotel'} onChange={() => setForm({ ...form, payment_method: 'pay_at_hotel' })} />
                <div>
                  <span className="font-bold text-[#2c0e0e] block mb-1">Pay at Hotel (होटल में भुगतान)</span>
                  <span className="text-xs text-stone-500">होटल पहुँचकर कैश या कार्ड से पेमेंट करें।</span>
                </div>
              </label>
            </div>
          </div>

          {/* 5. Coupon Code */}
          <div className="bg-white p-8 border border-stone-200 shadow-sm">
            <h3 className="text-2xl font-serif mb-4 text-[#2c0e0e]">5. Have a Coupon Code?</h3>
            <div className="flex gap-2">
              <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter Code" className="w-full bg-[#faf8f5] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[#D4AF37] uppercase font-mono" />
              <button type="button" onClick={applyCoupon} disabled={checkingCoupon} className="bg-[#2c0e0e] text-[#D4AF37] border border-[#2c0e0e] hover:bg-[#D4AF37] hover:text-[#2c0e0e] px-6 py-3 font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                {checkingCoupon ? '...' : 'Apply'}
              </button>
            </div>
            {couponMessage && <p className={`text-sm font-bold mt-2 ${isCouponValid ? 'text-green-600' : 'text-red-600'}`}>{couponMessage}</p>}
          </div>

          {/* 6. Summary */}
          {selected && nights > 0 && (
            <div className="bg-[#2c0e0e] text-white p-8 border border-[#D4AF37] animate-fade-up shadow-xl">
              <h3 className="text-2xl font-serif mb-6 text-[#D4AF37]">Booking Summary</h3>
              <div className="flex justify-between text-sm mb-2 text-stone-300"><span>{selected.category} ({nights} Nights)</span><span>{formatINR(baseTotal)}</span></div>
              {discountPercent > 0 && <div className="flex justify-between text-sm mb-2 text-green-400 font-bold"><span>Discount ({discountPercent}% OFF)</span><span>- {formatINR(discountAmount)}</span></div>}
              <div className="flex justify-between text-sm mb-2 text-stone-300 border-t border-stone-700 pt-2"><span>Taxable Value</span><span>{formatINR(taxableValue)}</span></div>
              <div className="flex justify-between text-sm mb-4 text-stone-400"><span>GST (CGST 6% + SGST 6%)</span><span>+ {formatINR(gstAmount)}</span></div>
              <div className="flex justify-between font-bold text-2xl border-t border-stone-700 pt-4">
                <span>{form.payment_method === 'online' ? 'Total Payable Now' : 'Total Payable at Hotel'}</span>
                <span className="text-[#D4AF37]">{formatINR(finalTotal)}</span>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 font-bold text-center bg-red-50 p-4 border border-red-200 animate-fade-up">{error}</p>}
          
          <button type="submit" disabled={submitting || !form.room_id} className={`w-full py-5 text-sm uppercase tracking-widest font-bold transition-all shadow-lg ${form.room_id ? 'bg-[#2c0e0e] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2c0e0e]' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}>
            {submitting ? 'Processing...' : form.payment_method === 'online' ? 'Proceed to Pay' : 'Confirm Booking'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default function BookingPage() {
  return <Suspense fallback={<div className="text-center py-20 font-serif text-[#2c0e0e]">Loading...</div>}><BookingContent /></Suspense>;
}