import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    console.log("--- 🚀 API START ---");
    
    // 1. चेक करें कि Environment Variables लोड हुए हैं या नहीं
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log("❌ ERROR: Supabase URL missing in .env.local");
      throw new Error("Supabase URL is missing.");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("❌ ERROR: Supabase Service Role Key missing in .env.local");
      throw new Error("Supabase Service Key is missing.");
    }

    const { searchParams } = new URL(req.url);
    const checkIn = searchParams.get('check_in');
    const checkOut = searchParams.get('check_out');
    console.log("📅 Dates received:", checkIn, "to", checkOut);

    // 2. बुकिंग चेक करें
    console.log("⏳ Checking conflicting bookings...");
    const { data: conflicting, error: bookingErr } = await supabaseAdmin
      .from('bookings')
      .select('room_id')
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .lt('check_in', checkOut)
      .gt('check_out', checkIn);

    if (bookingErr) {
      console.log("❌ ERROR fetching bookings:", bookingErr.message);
      throw new Error(bookingErr.message);
    }

    const bookedRoomIds = conflicting?.map((b: any) => b.room_id) || [];
    console.log("🚫 Booked Room IDs:", bookedRoomIds);

    // 3. कमरे प्राप्त करें
    console.log("⏳ Fetching available rooms...");
    let query = supabaseAdmin.from('rooms').select('*').eq('status', 'available');
    
    if (bookedRoomIds.length > 0) {
      query = query.not('id', 'in', `(${bookedRoomIds.join(',')})`);
    }

    const { data: available, error: roomErr } = await query;

    if (roomErr) {
      console.log("❌ ERROR fetching rooms:", roomErr.message);
      throw new Error(roomErr.message);
    }

    console.log("✅ SUCCESS! Rooms found:", available?.length);
    return NextResponse.json({ rooms: available || [] });

  } catch (err: any) {
    console.error("🔥 CRITICAL API ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}