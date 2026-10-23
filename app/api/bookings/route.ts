import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendBookingEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.check_in || !body.check_out) return NextResponse.json({ error: 'Dates are required' }, { status: 400 });
    
    const checkInDate = new Date(body.check_in);
    const checkOutDate = new Date(body.check_out);
    
    if (checkOutDate <= checkInDate) return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });

    const { data: room } = await supabaseAdmin.from('rooms').select('base_price, category').eq('id', body.room_id).single();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000);
    
    const finalTotal = (room.base_price * nights) * 1.12;

    const { data: guest, error: gErr } = await supabaseAdmin.from('guests').insert({ full_name: body.full_name, email: body.email || null, phone: body.phone }).select().single();
    if (gErr) throw new Error(`Guest creation failed: ${gErr.message}`);

    const { data: refData } = await supabaseAdmin.rpc('generate_booking_reference');
    const ref = refData || `JDP-${Date.now()}`;

    const initialStatus = body.payment_method === 'pay_at_hotel' ? 'confirmed' : 'pending';
    
    const { data: booking, error: bErr } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_reference: ref,
        guest_id: guest.id,
        room_id: body.room_id,
        check_in: body.check_in,
        check_out: body.check_out,
        guests_count: body.guests_count,
        total_amount: finalTotal, 
        status: initialStatus, 
        payment_status: 'unpaid',
        source: 'website',
        special_requests: body.special_requests,
        user_id: body.user_id || null,
        guest_gstin: body.guest_gstin || null, 
      })
      .select().single();

    if (bErr) {
      if (bErr.code === '23P01') return NextResponse.json({ error: 'Room is already booked for these dates.' }, { status: 409 });
      throw new Error(`Booking failed: ${bErr.message}`);
    }

    if (body.email && body.payment_method === 'pay_at_hotel') {
      await sendBookingEmail(body.email, body.full_name, booking.booking_reference, room.category, body.check_in, body.check_out, finalTotal, 'Pay at Hotel (Pending)');
    }

    return NextResponse.json({ booking, total: finalTotal, nights });
    
  } catch (e: any) {
    console.error("API CRASH:", e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}