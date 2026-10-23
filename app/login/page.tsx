'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[[var(--theme-primary)]]">
      <form onSubmit={submit} className="bg-white p-10 border border-stone-200 shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[var(--theme-primary)]">Admin Panel</h1>
          <p className="text-stone-500 text-sm mt-2">Sign in to manage your hotel</p>
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
          <input type="email" required className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[var(--theme-secondary)]"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Password</label>
          <input type="password" required className="w-full bg-[var(--theme-bg)] border border-stone-200 px-4 py-3 focus:outline-none focus:border-[var(--theme-secondary)]"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 text-center">{error}</p>}
        
        <button type="submit" disabled={loading} className="w-full bg-[var(--theme-secondary)] text-white hover:bg-[[var(--theme-primary)]] py-4 text-xs uppercase tracking-widest font-bold transition-colors">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}