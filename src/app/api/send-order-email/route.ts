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

    // Generate items HTML for Customer and Admin
    let customerItemsHtml = items && Array.isArray(items) 
      ? items.map(item => `
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 15px 0;">
              <p style="margin: 0; font-weight: bold; color: #333333;">${item.name} ${item.productId ? `(#${item.productId.toString().slice(0, 6)})` : ''}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #999999;">Size: ${item.size} | Qty: ${item.quantity}</p>
            </td>
            <td style="padding: 15px 0; text-align: right; font-weight: bold; color: #d4af37;">
              ৳${item.price * item.quantity}
            </td>
          </tr>
        `).join('')
      : `<tr>
          <td style="padding: 15px 0; color: #333333;">
             <p style="margin: 0; font-weight: bold; color: #333333;">${productName}</p>
             <p style="margin: 5px 0 0 0; font-size: 12px; color: #999999;">Size: ${size} | Qty: ${quantity}</p>
          </td>
          <td style="padding: 15px 0; text-align: right; font-weight: bold; color: #d4af37;">৳${total}</td>
         </tr>`;

    const whatsAppLink = `https://wa.me/8801886141861`;

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
              .container { width: 100% !important; border-radius: 0 !important; }
              .header { padding: 30px 20px !important; }
              .header h1 { font-size: 24px !important; }
              .body-content { padding: 30px 20px !important; }
              .manifest-box { padding: 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 40px 10px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 600px;">
                  <!-- Header -->
                  <tr>
                    <td class="header" style="background-color: #050505; padding: 40px; text-align: center;">
                      <img src="https://pcgqfuvgmzusypmaiawy.supabase.co/storage/v1/object/public/products/logo.png" alt="Sufyra" style="width: 150px; margin-bottom: 20px; display: inline-block;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">Thank You for Your Selection</h1>
                      <p style="color: #d4af37; margin-top: 10px; text-transform: uppercase; letter-spacing: 3px; font-size: 10px; font-weight: bold;">Order Confirmed</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td class="body-content" style="padding: 40px;">
                      <p style="font-size: 16px; color: #444444; line-height: 1.6; margin-top: 0;">Dear <strong>${customerName}</strong>,</p>
                      <p style="font-size: 16px; color: #666666; line-height: 1.6;">Your journey into luxury has begun. We have received your order and our artisans are preparing your manifest with the utmost care.</p>
                      
                      <div class="manifest-box" style="margin: 40px 0; padding: 30px; background-color: #fafafa; border-radius: 15px; border: 1px solid #eeeeee;">
                        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; margin-bottom: 20px;">Procurement Manifest</h2>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          ${customerItemsHtml}
                          <tr>
                            <td style="padding: 20px 0 0 0; font-weight: bold; color: #333333; font-size: 16px;">Total Amount</td>
                            <td style="padding: 20px 0 0 0; text-align: right; font-size: 22px; font-weight: bold; color: #d4af37;">৳${total}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- WhatsApp Support - Highly Highlighted -->
                      <div style="text-align: center; margin-top: 40px; margin-bottom: 40px; padding: 35px 20px; background: linear-gradient(135deg, #128C7E 0%, #075E54 100%); border-radius: 15px; box-shadow: 0 10px 20px rgba(18,140,126,0.2);">
                        <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 20px; font-weight: bold;">Need assistance?</h2>
                        <p style="color: #e5ffe5; margin: 0 0 25px 0; font-size: 14px; line-height: 1.5;">Our support team is available on WhatsApp to help you with your order.</p>
                        <a href="${whatsAppLink}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 16px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                          Contact via WhatsApp
                        </a>
                      </div>

                      <div style="margin: 40px 0 0 0; border-top: 1px solid #eeeeee; padding-top: 30px;">
                        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; margin-bottom: 15px;">Delivery Coordinates</h2>
                        <p style="font-size: 15px; color: #444444; margin: 0; line-height: 1.5;">${address}</p>
                        <p style="font-size: 13px; color: #888888; margin-top: 5px; text-transform: uppercase;">Zone: <span style="color: #444;">${zone}</span></p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #fafafa; color: #999999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; border-top: 1px solid #eeeeee;">
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media only screen and (max-width: 600px) {
              .admin-container { width: 100% !important; border-radius: 0 !important; }
              .admin-content { padding: 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 20px 10px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" class="admin-container" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 600px;">
                  <tr>
                    <td style="background-color: #111827; padding: 20px; text-align: center; border-bottom: 4px solid #f59e0b;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Order Received</h1>
                      <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 14px;">Order ID: #${orderId?.slice(0, 8).toUpperCase()}</p>
                    </td>
                  </tr>
                  <tr>
                    <td class="admin-content" style="padding: 30px;">
                      
                      <!-- Customer Details -->
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                        <h2 style="font-size: 14px; text-transform: uppercase; color: #6b7280; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Customer Details</h2>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr><td style="padding: 5px 0; color: #4b5563; font-size: 14px;" width="120"><strong>Name:</strong></td><td style="padding: 5px 0; color: #111827; font-size: 14px;">${customerName}</td></tr>
                          <tr><td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>Email:</strong></td><td style="padding: 5px 0; color: #111827; font-size: 14px;">${customerEmail || 'N/A'}</td></tr>
                          <tr><td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>WhatsApp:</strong></td><td style="padding: 5px 0; color: #111827; font-size: 14px;">${whatsapp || 'N/A'}</td></tr>
                          <tr><td style="padding: 5px 0; color: #4b5563; font-size: 14px;"><strong>Payment:</strong></td><td style="padding: 5px 0; color: #111827; font-size: 14px; text-transform: capitalize;">${paymentMethod || 'Cash on Delivery'}</td></tr>
                        </table>
                      </div>

                      <!-- Shipment Details -->
                      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                        <h2 style="font-size: 14px; text-transform: uppercase; color: #d97706; margin: 0 0 15px 0; border-bottom: 1px solid #fde68a; padding-bottom: 10px;">Shipment Placement</h2>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr><td style="padding: 5px 0; color: #92400e; font-size: 14px;" width="120"><strong>Delivery Zone:</strong></td><td style="padding: 5px 0; color: #111827; font-size: 14px; font-weight: bold;">${zone}</td></tr>
                          <tr><td style="padding: 5px 0; color: #92400e; font-size: 14px; vertical-align: top;"><strong>Address:</strong></td><td style="padding: 5px 0; color: #111827; font-size: 14px; line-height: 1.5;">${address}</td></tr>
                        </table>
                      </div>

                      <!-- Order Items -->
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                        <h2 style="font-size: 14px; text-transform: uppercase; color: #6b7280; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Order Details</h2>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          ${customerItemsHtml}
                          <tr>
                            <td style="padding: 15px 0 0 0; font-weight: bold; color: #111827; font-size: 16px; border-top: 2px solid #e5e7eb;">Total Price</td>
                            <td style="padding: 15px 0 0 0; text-align: right; font-size: 18px; font-weight: bold; color: #dc2626; border-top: 2px solid #e5e7eb;">৳${total}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="text-align: center; margin-top: 30px;">
                        <a href="https://sufyra-fragrance.vercel.app/admin/orders" style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold;">Manage Order in Admin Panel</a>
                      </div>
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
