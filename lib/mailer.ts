// lib/mailer.ts
import nodemailer from 'nodemailer';

export const sendBookingEmail = async (
  guestEmail: string,
  guestName: string,
  bookingRef: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  totalAmount: number,
  paymentStatus: string
) => {
  // अगर कस्टमर ने ईमेल नहीं दिया है, तो चुपचाप बाहर निकल जाओ
  if (!guestEmail) return;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; padding: 20px;">
        <h2 style="color: #c9a961; text-align: center;">Jagdish Dune Palace</h2>
        <p style="text-align: center; color: #666;">Booking Confirmation</p>
        
        <p>Dear <strong>${guestName}</strong>,</p>
        <p>Thank you for choosing Jagdish Dune Palace. Your booking is successfully confirmed. Here are your details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Booking Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 18px; color: #c9a961;"><strong>${bookingRef}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Room Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${roomType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-in:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${checkIn}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-out:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${checkOut}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${totalAmount}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${paymentStatus}</td></tr>
        </table>
        
        <p style="margin-top: 30px;">We look forward to hosting you!</p>
        <p><strong>Jagdish Dune Palace Team</strong><br/>Chohtan, Barmer, Rajasthan</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Jagdish Dune Palace" <${process.env.EMAIL_USER}>`,
      to: guestEmail,
      subject: `Booking Confirmed - ${bookingRef}`,
      html: htmlContent,
    });

    console.log("✅ Booking email sent successfully to", guestEmail);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};