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

    // 1. बुकिंग को कन्फर्म और पेड करें
    const { error: bErr } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' }) // <-- यहाँ paid कर दिया
      .eq('id', booking_id);

    if (bErr) throw new Error('Booking update failed');

    // 2. पेमेंट का रिकॉर्ड सेव करें
    await supabaseAdmin.from('payments').insert({
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      amount: 0,
      status: 'captured'
    });

    // 3. ईमेल भेजें
    const { data: bookingData } = await supabaseAdmin
      .from('bookings').select('*, guests(*), rooms(category)').eq('id', booking_id).single();

    if (bookingData && bookingData.guests?.email) {
      await sendBookingEmail(
        bookingData.guests.email, bookingData.guests.full_name, bookingData.booking_reference, 
        bookingData.rooms.category, bookingData.check_in, bookingData.check_out, 
        bookingData.total_amount, 'Paid Online (Successful)'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}