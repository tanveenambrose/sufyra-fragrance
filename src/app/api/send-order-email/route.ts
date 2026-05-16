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

    // Calculate pricing for the receipt
    const deliveryCharge = zone === 'Inside Dhaka' ? 80 : 150;
    const subtotal = total - deliveryCharge;

    const whatsAppLink = `https://wa.me/8801886141861`;
    const facebookLink = "https://www.facebook.com/SufyraFragrance/";
    const instagramLink = "https://www.instagram.com/sufyra_fragrance";
    const logoUrl = "https://sufyra-fragrance.vercel.app/logo.png";

    // 1. Send Confirmation Email to Customer (New Premium Design)
    await resend.emails.send({
      from: 'Sufyra Fragrance <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Your Sufyra Fragrance Order - #${orderId?.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f9f9f9; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background-color: #0a0a0a; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; color: #1a1a1a; margin-bottom: 15px; font-weight: 700; }
            .message { font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-bottom: 30px; }
            .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .receipt-header { border-bottom: 2px solid #f0f0f0; }
            .receipt-header th { text-align: left; padding: 12px 0; font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
            .receipt-item td { padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
            .item-name { font-weight: 600; color: #1a1a1a; font-size: 15px; }
            .item-variant { font-size: 13px; color: #888; margin-top: 4px; }
            .item-price { text-align: right; font-weight: 600; color: #d4af37; }
            .summary-row td { padding: 10px 0; font-size: 14px; color: #4a4a4a; }
            .summary-label { text-align: left; }
            .summary-value { text-align: right; font-weight: 600; }
            .total-row td { padding: 20px 0; border-top: 2px solid #f0f0f0; margin-top: 10px; }
            .total-label { font-size: 18px; font-weight: 700; color: #1a1a1a; }
            .total-value { font-size: 24px; font-weight: 800; color: #d4af37; text-align: right; }
            .whatsapp-section { background-color: #065f46; border-radius: 12px; padding: 40px 25px; text-align: center; margin-bottom: 40px; }
            .whatsapp-title { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 15px; }
            .whatsapp-text { color: #d1fae5; font-size: 15px; margin-bottom: 25px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto; }
            .whatsapp-btn { display: inline-block; background-color: #22c55e; color: #064e3b; padding: 16px 35px; border-radius: 50px; text-decoration: none; font-weight: 800; font-size: 16px; transition: all 0.2s; }
            .footer { padding: 40px 20px; text-align: center; background-color: #fdfdfd; border-top: 1px solid #f0f0f0; }
            .social-links { margin-bottom: 20px; }
            .social-icon { display: inline-block; margin: 0 10px; text-decoration: none; color: #d4af37; font-weight: 600; font-size: 14px; }
            .footer-text { font-size: 12px; color: #aaa; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <img src="${logoUrl}" alt="Sufyra Fragrance" width="160" style="display: block; margin: 0 auto;">
              </div>
              <div class="content">
                <h1 class="greeting">Thank You, ${customerName}!</h1>
                <p class="message">We've received your order and our team is already preparing it with the finest care. Your journey into luxury fragrances has begun.</p>
                
                <table class="receipt-table">
                  <tr class="receipt-header">
                    <th width="70%">Item Details</th>
                    <th width="30%" style="text-align: right;">Price</th>
                  </tr>
                  ${items && Array.isArray(items) ? items.map(item => `
                    <tr class="receipt-item">
                      <td>
                        <div class="item-name">${item.name}</div>
                        <div class="item-variant">Size: ${item.size} | Qty: ${item.quantity}</div>
                      </td>
                      <td class="item-price">৳${item.price * item.quantity}</td>
                    </tr>
                  `).join('') : `
                    <tr class="receipt-item">
                      <td>
                        <div class="item-name">${productName}</div>
                        <div class="item-variant">Size: ${size} | Qty: ${quantity}</div>
                      </td>
                      <td class="item-price">৳${total - deliveryCharge}</td>
                    </tr>
                  `}
                  <tr class="summary-row" style="padding-top: 20px;">
                    <td class="summary-label" style="padding-top: 20px;">Subtotal</td>
                    <td class="summary-value" style="padding-top: 20px;">৳${subtotal}</td>
                  </tr>
                  <tr class="summary-row">
                    <td class="summary-label">Delivery Charge</td>
                    <td class="summary-value">৳${deliveryCharge}</td>
                  </tr>
                  <tr class="total-row">
                    <td class="total-label">Grand Total</td>
                    <td class="total-value">৳${total}</td>
                  </tr>
                </table>

                <div class="whatsapp-section">
                  <div class="whatsapp-title">Need Instant Updates?</div>
                  <p class="whatsapp-text">Click below to chat with our support team on WhatsApp for delivery arrangements or any queries.</p>
                  <a href="${whatsAppLink}" class="whatsapp-btn">Chat on WhatsApp</a>
                </div>

                <div style="margin-top: 30px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
                  <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Shipping Address</p>
                  <p style="font-size: 14px; color: #4a4a4a; line-height: 1.5; margin: 0;">${address}</p>
                  <p style="font-size: 12px; color: #aaa; margin-top: 5px;">Zone: ${zone}</p>
                </div>
              </div>
              
              <div class="footer">
                <div class="social-links">
                  <a href="${facebookLink}" class="social-icon">Facebook</a>
                  <a href="${instagramLink}" class="social-icon">Instagram</a>
                </div>
                <p class="footer-text">Sufyra Fragrance &copy; 2026. All Rights Reserved.</p>
                <p class="footer-text">Artisanal Perfumery | Handcrafted in Bangladesh</p>
              </div>
            </div>
          </div>
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
