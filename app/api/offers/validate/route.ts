import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) return NextResponse.json({ success: false, error: 'Code required' });

  const { data: offer } = await supabaseAdmin
    .from('offers')
    .select('discount_percent')
    .eq('coupon_code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (!offer) return NextResponse.json({ success: false, error: 'Invalid or expired coupon code' });

  return NextResponse.json({ success: true, discount_percent: offer.discount_percent });
}