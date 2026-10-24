import { createClient } from '@supabase/supabase-js';

// ✅ Hardcoded URL
const supabaseUrl = 'https://qocvgplnvpscrzsknjhq.supabase.co';
// Service role key must stay in environment variables for security, with a fallback for build
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-build-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});