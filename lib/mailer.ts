import nodemailer from 'nodemailer';

const escapeHtml = (unsafe: string) => {
  return (unsafe || '').replace(/[&<"'>]/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] as string;
  });
};

export const sendBookingEmail = async (
  guestEmail: string, guestName: string, bookingRef: string,
  roomType: string, checkIn: string, checkOut: string,
  totalAmount: number, paymentStatus: string
) => {
  if (!guestEmail) return;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; padding: 20px;">
        <h2 style="color: #D4AF37; text-align: center;">Jagdish Dune Palace</h2>
        <p>Dear <strong>${escapeHtml(guestName)}</strong>,</p>
        <p>Your booking is successfully confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Booking Ref:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #D4AF37;"><strong>${escapeHtml(bookingRef)}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Room Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(roomType)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-in:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(checkIn)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-out:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(checkOut)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${totalAmount}</td></tr>
        </table>
        <p><strong>Jagdish Dune Palace Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Jagdish Dune Palace" <${process.env.EMAIL_USER}>`,
      to: guestEmail,
      subject: `Booking Confirmed - ${bookingRef}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};