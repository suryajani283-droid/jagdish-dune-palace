import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { amount, booking_id } = await req.json();

    const { data: booking } = await supabaseAdmin.from('bookings').select('total_amount').eq('id', booking_id).single();
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (Math.abs(booking.total_amount - amount) > 1) {
        return NextResponse.json({ error: 'Security Error: Amount mismatch' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: Math.round(booking.total_amount * 100), 
      currency: "INR",
      receipt: String(booking_id),
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}