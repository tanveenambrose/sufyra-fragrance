import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      customerName, 
      productName, 
      size, 
      quantity, 
      total, 
      zone, 
      address, 
      whatsapp,
      paymentMethod,
      customerEmail 
    } = body;

    // Create transporter
    // IMPORTANT: In production, these should be in .env.local
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'racoctanveen15@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // App Password from Google
      },
    });

    const mailOptions = {
      from: '"Sufyra Mansion" <racoctanveen15@gmail.com>',
      to: 'racoctanveen15@gmail.com',
      subject: `New Order Received - #${orderId?.slice(0, 8)}`,
      html: `
        <div style="font-family: 'serif', 'Times New Roman', serif; background-color: #050505; color: #ffffff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; text-align: center; border-bottom: 1px solid #d4af37; padding-bottom: 20px;">New Procurement Manifest</h1>
          
          <div style="margin-top: 30px;">
            <p style="text-transform: uppercase; letter-spacing: 2px; color: #d4af37; font-weight: bold; font-size: 12px;">Customer Details</p>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp || 'N/A'}</p>
          </div>

          <div style="margin-top: 30px; background-color: rgba(212, 175, 55, 0.05); padding: 20px; border-radius: 10px;">
            <p style="text-transform: uppercase; letter-spacing: 2px; color: #d4af37; font-weight: bold; font-size: 12px;">Order Summary</p>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Size:</strong> ${size}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Zone:</strong> ${zone}</p>
            <p><strong>Payment:</strong> ${paymentMethod || 'Cash on Delivery'}</p>
            <p style="font-size: 24px; color: #d4af37; margin-top: 10px;"><strong>Total: ৳${total}</strong></p>
          </div>

          <div style="margin-top: 30px;">
            <p style="text-transform: uppercase; letter-spacing: 2px; color: #d4af37; font-weight: bold; font-size: 12px;">Delivery Location</p>
            <p style="font-style: italic;">${address}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #222; pt-20px;">
            <p>Sufyra Fragrance — Artisanal Perfumery Control System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Email notification failed (order saved):', error);
    // Return 200 because the order was already saved to database successfully
    return NextResponse.json({ 
      success: true, 
      emailSent: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
