import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  // ✅ Hardcoded public keys to bypass build issues on Cloudflare
  const url = 'https://qocvgplnvpscrzsknjhq.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvY3ZncGxudnBzY3J6c2tuamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODcwOTUsImV4cCI6MjEwODA2MzA5NX0.gzzceUzjjsgdGLUZ5gcRWG7iiZYk_zs-0StiPbTBvUY';

  return createBrowserClient(url, key);
};