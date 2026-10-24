import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ यह बिल्ड के समय ESLint एरर्स को इग्नोर कर देगा
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ यह बिल्ड के समय TypeScript एरर्स को इग्नोर कर देगा
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;