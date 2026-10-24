import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️ Missing Supabase Admin keys. If this is a build step, it's okay.");
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://dummy-build-url.supabase.co', 
  supabaseServiceKey || 'dummy-build-key', 
  { auth: { persistSession: false } }
);