import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');

    if (!ref) {
      return NextResponse.json({ error: 'Reference number is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        rooms (category, room_number),
        guests (full_name, phone, email),
        invoices (id)
      `)
      .eq('booking_reference', ref.toUpperCase());

    // 🔒 अगर यूज़र लॉगिन है, तो सिर्फ उसी की बुकिंग दिखाएँ
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: booking, error } = await query.single();

    if (error || !booking) {
      return NextResponse.json({ error: 'No booking found with this reference.' }, { status: 404 });
    }

    return NextResponse.json({ booking });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}