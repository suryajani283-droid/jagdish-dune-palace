'use client';
import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ सुधार: खतरनाक URL रीडायरेक्ट (Open Redirect) को रोकें
  const redirectParam = searchParams.get('redirect');
  const redirectUrl = (redirectParam && redirectParam.startsWith('/')) 
    ? redirectParam 
    : '/my-booking';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.verifyOtp({
      email, 
      token: otp, 
      type: 'email',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // चेक करें कि यूज़र के पास मोबाइल नंबर सेव है या नहीं
      const userPhone = data.user?.user_metadata?.phone;
      if (!userPhone) {
        setStep('phone');
        setLoading(false);
      } else {
        router.push(redirectUrl);
      }
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    const supabase = createClient();
    
    // 1. यूज़र के मेटाडेटा में फोन नंबर सेव करें
    const { data, error } = await supabase.auth.updateUser({
      data: { phone: phone }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // 2. profiles टेबल में भी सेव/अपडेट करें
    if (data.user) {
       await supabase.from('profiles').upsert({
           id: data.user.id,
           full_name: data.user.email?.split('@')[0] || 'Customer',
           phone: phone,
           role: 'customer'
       });
    }

    router.push(redirectUrl);
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex items-center justify-center bg-[var(--theme-bg)] py-16 px-6">
        <div className="bg-white p-8 md:p-12 border border-stone-200 shadow-xl w-full max-w-md">
          
          <h1 className="text-3xl font-serif font-bold text-[var(--theme-primary)] text-center mb-2">Customer Login</h1>
          
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-6 mt-6">
              <p className="text-center text-stone-500 text-sm mb-4">Enter your email to receive a login OTP</p>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Email Address</label>
                <input type="email" required placeholder="yourname@gmail.com" className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[var(--theme-secondary)]"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[var(--theme-primary)] text-[var(--theme-secondary)] hover:bg-[var(--theme-secondary)] hover:text-[var(--theme-primary)] py-3 font-bold uppercase tracking-widest text-xs transition-colors">
                {loading ? 'Sending OTP...' : 'Send Login OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 mt-6">
              <p className="text-center text-sm text-stone-600">OTP sent to <strong>{email}</strong></p>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Enter 6-Digit OTP</label>
                <input type="text" required placeholder="123456" maxLength={6} className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 text-center tracking-[0.5em] text-xl font-bold focus:outline-none focus:border-[var(--theme-secondary)]"
                  value={otp} onChange={(e) => setOtp(e.target.value)} />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[var(--theme-secondary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-secondary)] py-3 font-bold uppercase tracking-widest text-xs transition-colors">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSavePhone} className="space-y-6 mt-6">
              <p className="text-center text-sm text-stone-600 mb-4">Please enter your mobile number to complete your profile.</p>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Mobile Number (Compulsory)</label>
                <input type="tel" required placeholder="+91 98765 43210" className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[var(--theme-secondary)]"
                  value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[var(--theme-primary)] text-[var(--theme-secondary)] hover:bg-[var(--theme-secondary)] hover:text-[var(--theme-primary)] py-3 font-bold uppercase tracking-widest text-xs transition-colors">
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
            </form>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default function CustomerLogin() {
  return <Suspense fallback={<div className="text-center py-20 text-[var(--theme-primary)]">Loading...</div>}><LoginContent /></Suspense>;
}