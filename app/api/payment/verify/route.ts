import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendBookingEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const { data: bookingData, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('total_amount, guests(*), rooms(category), check_in, check_out, booking_reference')
      .eq('id', booking_id)
      .single();
      
    if (fetchErr || !bookingData) throw new Error('Booking not found');

    const guest = Array.isArray(bookingData.guests) ? bookingData.guests[0] : bookingData.guests;
    const room = Array.isArray(bookingData.rooms) ? bookingData.rooms[0] : bookingData.rooms;

    const { error: bErr } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('id', booking_id);

    if (bErr) throw new Error('Booking update failed');

    await supabaseAdmin.from('payments').insert({
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      amount: bookingData.total_amount,
      status: 'captured'
    });

    if (guest?.email) {
      await sendBookingEmail(
        guest.email, 
        guest.full_name, 
        bookingData.booking_reference, 
        room?.category || 'Room', 
        bookingData.check_in, 
        bookingData.check_out, 
        bookingData.total_amount, 
        'Paid Online (Successful)'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}