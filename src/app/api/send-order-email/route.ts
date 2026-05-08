import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      customerName, 
      productName, 
      size, 
      quantity, 
      items, 
      total, 
      zone, 
      address, 
      whatsapp,
      paymentMethod,
      customerEmail 
    } = body;

    if (!process.env.RESEND_API_KEY) {
      console.warn('Email notification skipped: RESEND_API_KEY is not configured.');
      return NextResponse.json({ 
        success: true, 
        emailSent: false, 
        message: 'Order saved, but email notification was skipped due to missing API key.' 
      });
    }

    // Generate items HTML for Customer
    let customerItemsHtml = items && Array.isArray(items) 
      ? items.map(item => `
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 15px 0;">
              <p style="margin: 0; font-weight: bold; color: #333333;">${item.name}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #999999;">Size: ${item.size} | Qty: ${item.quantity}</p>
            </td>
            <td style="padding: 15px 0; text-align: right; font-weight: bold; color: #d4af37;">
              ৳${item.price * item.quantity}
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="2" style="padding: 15px 0; color: #333333;">${productName} (${size}) x ${quantity}</td></tr>`;

    const whatsAppLink = `https://wa.me/8801700000000`; // Placeholder WhatsApp number, user should update

    // 1. Send Confirmation Email to Customer
    await resend.emails.send({
      from: 'Sufyra Mansion <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Thank You for Your Order - #${orderId?.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 20px !important; }
              .header h1 { font-size: 24px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 40px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #050505; padding: 40px; text-align: center;">
                      <img src="https://pcgqfuvgmzusypmaiawy.supabase.co/storage/v1/object/public/products/logo.png" alt="Sufyra" style="width: 150px; margin-bottom: 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Thank You for Your Selection</h1>
                      <p style="color: #d4af37; margin-top: 10px; text-transform: uppercase; letter-spacing: 3px; font-size: 10px; font-weight: bold;">Order Confirmed</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="font-size: 16px; color: #666666; line-height: 1.6;">Dear <strong>${customerName}</strong>,</p>
                      <p style="font-size: 16px; color: #666666; line-height: 1.6;">Your journey into luxury has begun. We have received your order and our artisans are preparing your manifest with the utmost care.</p>
                      
                      <div style="margin: 40px 0; padding: 30px; background-color: #fafafa; border-radius: 15px; border: 1px solid #eeeeee;">
                        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; margin-bottom: 20px;">Procurement Manifest</h2>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          ${customerItemsHtml}
                          <tr>
                            <td style="padding: 20px 0 0 0; font-weight: bold; color: #333333;">Total Amount</td>
                            <td style="padding: 20px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #d4af37;">৳${total}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="margin: 40px 0;">
                        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; margin-bottom: 15px;">Delivery Coordinates</h2>
                        <p style="font-size: 14px; color: #666666; margin: 0;">${address}</p>
                        <p style="font-size: 12px; color: #999999; margin-top: 5px;">Zone: ${zone}</p>
                      </div>

                      <!-- WhatsApp Support -->
                      <div style="text-align: center; margin-top: 50px; padding: 30px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 15px;">
                        <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">Need assistance with your procurement?</p>
                        <a href="${whatsAppLink}" style="display: inline-block; background-color: #ffffff; color: #128C7E; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Contact via WhatsApp</a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #fafafa; color: #999999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
                      Sufyra Fragrance &copy; 2026 — Artisanal Perfumery
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    // 2. Send Notification to Admin
    await resend.emails.send({
      from: 'Sufyra Mansion <onboarding@resend.dev>',
      to: 'racoctanveen15@gmail.com',
      subject: `NEW ORDER ALERT - ${customerName} - #${orderId?.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; background-color: #f0f0f0; padding: 40px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; border-left: 5px solid #d4af37;">
            <h2 style="margin: 0 0 20px 0; color: #333;">New Order Incoming</h2>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Total:</strong> ৳${total}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp || 'N/A'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p>Check the admin panel for full details.</p>
            <a href="https://sufyra-fragrance.vercel.app/admin/orders" style="display: inline-block; background: #333; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-size: 12px;">Open Admin Panel</a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Email notification failed (order saved):', error);
    return NextResponse.json({ 
      success: true, 
      emailSent: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
