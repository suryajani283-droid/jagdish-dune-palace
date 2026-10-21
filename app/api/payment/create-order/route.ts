import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, booking_id } = await req.json();

    if (!amount || !booking_id) {
      return NextResponse.json({ error: 'Amount and Booking ID required' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // पैसे (paise) में बदलें
      currency: "INR",
      receipt: String(booking_id), // रसीद हमेशा स्ट्रिंग होनी चाहिए
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ order });
    
  } catch (error: any) {
    console.error("❌ Razorpay Order Error Details:", JSON.stringify(error, null, 2));
    
    // Razorpay के असली एरर को फ्रंटएंड तक भेजें
    const errorMessage = error?.error?.description || error?.message || 'Something went wrong with Razorpay';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}