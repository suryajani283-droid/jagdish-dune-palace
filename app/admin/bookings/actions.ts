'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const { error } = await supabaseAdmin.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAsPaid(bookingId: string) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const { error } = await supabaseAdmin.from('bookings').update({ payment_status: 'paid' }).eq('id', bookingId);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAsRefunded(bookingId: string) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const { error } = await supabaseAdmin.from('bookings').update({ payment_status: 'refunded' }).eq('id', bookingId);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createManualBooking(formData: FormData) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const full_name = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const room_id = formData.get('room_id') as string;
    const check_in = formData.get('check_in') as string;
    const check_out = formData.get('check_out') as string;
    const guests_count = Number(formData.get('guests_count'));

    const { data: room, error: roomErr } = await supabaseAdmin.from('rooms').select('base_price').eq('id', room_id).single();
    if (roomErr || !room) throw new Error('Room not found');

    const nights = Math.max(1, Math.round((new Date(check_out).getTime() - new Date(check_in).getTime()) / 86400000));
    const total_amount = room.base_price * nights * 1.12;

    const { data: guest, error: gErr } = await supabaseAdmin.from('guests').insert({ full_name, email: email || null, phone }).select().single();
    if (gErr) throw new Error('Guest creation failed');

    const { data: refData } = await supabaseAdmin.rpc('generate_booking_reference');
    const ref = refData || `JDP-${Date.now()}`;

    const { error: bErr } = await supabaseAdmin.from('bookings').insert({
        booking_reference: ref, guest_id: guest.id, room_id, check_in, check_out, guests_count, 
        total_amount, status: 'confirmed', payment_status: 'unpaid', source: 'reception',
    });

    if (bErr) throw new Error(bErr.message);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateInvoice(bookingId: string) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const { data: booking } = await supabaseAdmin.from('bookings').select('*').eq('id', bookingId).single();
    if (!booking) throw new Error('Booking not found');

    const { data: existingInvoice } = await supabaseAdmin.from('invoices').select('*').eq('booking_id', bookingId).single();
    if (existingInvoice) return { success: true, invoiceId: existingInvoice.id };

    const total = Number(booking.total_amount);
    const taxableValue = total / 1.12;
    const gstAmount = total - taxableValue;

    const { data: invNumData } = await supabaseAdmin.rpc('generate_invoice_number');
    const { data: invoice, error: iErr } = await supabaseAdmin.from('invoices').insert({
        invoice_number: invNumData, booking_id: bookingId, taxable_value: taxableValue, gst_rate: 12, gst_amount: gstAmount, total: total,
    }).select().single();

    if (iErr) throw new Error(iErr.message);
    await supabaseAdmin.from('bookings').update({ status: 'checked_out', payment_status: 'paid' }).eq('id', bookingId);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin/dashboard');
    return { success: true, invoiceId: invoice.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}