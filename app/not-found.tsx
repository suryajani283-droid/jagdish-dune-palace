import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-text)] p-6 text-center">
      <h1 className="text-6xl font-serif font-bold text-[var(--theme-primary)] mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <p className="mb-8 text-stone-500">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn-primary">
        Return to Homepage
      </Link>
    </div>
  );
}