import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    // 1. Fetch order details to get customer email and product info
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) throw new Error('Order not found');

    if (!process.env.RESEND_API_KEY) {
      console.warn('Status update email skipped: RESEND_API_KEY is not configured.');
      return NextResponse.json({ 
        success: true, 
        emailSent: false, 
        message: 'Status updated, but email notification was skipped due to missing API key.' 
      });
    }

    // 2. Prepare email content
    let statusTitle = '';
    let statusDescription = '';
    let statusIcon = '';
    let statusColor = '#d4af37';

    switch (status.toLowerCase()) {
      case 'received':
        statusTitle = 'Manifest Received';
        statusDescription = 'Your procurement request has been successfully recorded in our central ledger. Our artisans will begin preparation shortly.';
        statusIcon = 'https://img.icons8.com/ios/100/d4af37/document--v1.png';
        break;
      case 'processing':
        statusTitle = 'Artisanal Preparation';
        statusDescription = 'Your selection is currently being curated and packaged with the meticulous care it deserves. Every detail is being perfected.';
        statusIcon = 'https://img.icons8.com/ios/100/d4af37/perfume-bottle.png';
        break;
      case 'shipped':
        statusTitle = 'Selection En Route';
        statusDescription = 'Your manifest has been handed over to our elite courier partners. Your sanctuary will soon be graced by your selected scent.';
        statusIcon = 'https://img.icons8.com/ios/100/d4af37/delivery-truck.png';
        statusColor = '#25D366';
        break;
      default:
        statusTitle = `Status Update: ${status}`;
        statusDescription = `The status of your procurement manifest #${order.id.slice(0, 8).toUpperCase()} has been updated.`;
        statusIcon = 'https://img.icons8.com/ios/100/d4af37/info--v1.png';
    }

    const customerEmail = order.delivery_email || 'rs80359@gmail.com'; // Fallback to provided admin email for testing

    await resend.emails.send({
      from: 'Sufyra Mansion <onboarding@resend.dev>',
      to: customerEmail,
      subject: `${statusTitle} - Sufyra Manifest #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'serif', 'Times New Roman', serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505;">
            <tr>
              <td style="padding: 40px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #0a0a0a; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 30px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 50px 40px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                      <img src="${statusIcon}" alt="Status" style="width: 60px; margin-bottom: 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal; font-style: italic; letter-spacing: 1px;">${statusTitle}</h1>
                      <p style="color: #d4af37; margin-top: 10px; text-transform: uppercase; letter-spacing: 4px; font-size: 10px; font-weight: bold;">Order Update</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <p style="font-size: 16px; color: rgba(255,255,255,0.8); line-height: 1.8; text-align: center;">Dear ${order.delivery_name},</p>
                      <p style="font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.8; text-align: center; margin-bottom: 40px;">${statusDescription}</p>
                      
                      <div style="background-color: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.1); padding: 30px; border-radius: 20px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 5px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Manifest ID</td>
                            <td style="padding: 5px 0; text-align: right; color: #d4af37; font-family: monospace; font-weight: bold;">#${order.id.slice(0, 8).toUpperCase()}</td>
                          </tr>
                          <tr>
                            <td style="padding: 5px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Selection</td>
                            <td style="padding: 5px 0; text-align: right; color: #ffffff; font-size: 14px;">${order.product_name}</td>
                          </tr>
                          <tr>
                            <td style="padding: 5px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Current Status</td>
                            <td style="padding: 5px 0; text-align: right; color: ${statusColor}; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">${status}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="text-align: center; margin-top: 50px;">
                        <a href="https://wa.me/8801700000000" style="display: inline-block; border: 1px solid #d4af37; color: #d4af37; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">WhatsApp Support</a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: rgba(255,255,255,0.02); color: rgba(255,255,255,0.2); font-size: 9px; text-transform: uppercase; letter-spacing: 3px; border-top: 1px solid rgba(212, 175, 55, 0.05);">
                      Sufyra Mansion — Artisanal Perfumery Control System
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
    console.error('Status update email notification failed (status updated):', error);
    return NextResponse.json({ 
      success: true, 
      emailSent: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
