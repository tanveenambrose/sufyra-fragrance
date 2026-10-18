import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'sufyrafragrance@gmail.com';
const FROM_SENDER = `"Sufyra Fragrance" <${FROM_EMAIL}>`;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.COMPANY_EMAIL || FROM_EMAIL,
    pass: process.env.COMPANY_PASSWORD,
  },
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    // 1. Fetch order details to get customer info
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) throw new Error('Order not found');

    // 2. Resolve customer email
    let customerEmail = order.delivery_email;
    if (!customerEmail || !customerEmail.includes('@')) {
      if (order.user_id) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('email')
          .eq('id', order.user_id)
          .single();
        if (userRecord?.email) {
          customerEmail = userRecord.email;
        }
      }
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      console.warn(`No valid customer email found for order ${id}`);
    }

    // 3. Prepare email content
    let statusTitle = '';
    let statusDescription = '';
    let statusColor = '#d4af37';

    switch (status.toLowerCase()) {
      case 'received':
        statusTitle = 'Manifest Received';
        statusDescription = 'Your procurement request has been successfully recorded in our central ledger. Our artisans will begin preparation shortly.';
        break;
      case 'processing':
        statusTitle = 'Artisanal Preparation';
        statusDescription = 'Your selection is currently being curated and packaged with the meticulous care it deserves. Every detail is being perfected.';
        break;
      case 'shipped':
        statusTitle = 'Selection En Route';
        statusDescription = 'Your manifest has been handed over to our elite courier partners. Your sanctuary will soon be graced by your selected scent.';
        statusColor = '#25D366';
        break;
      case 'delivered':
        statusTitle = 'Delivered to Sanctuary';
        statusDescription = 'Your Sufyra fragrance has arrived. May it bring timeless elegance and captivating scents to your presence.';
        statusColor = '#10B981';
        break;
      default:
        statusTitle = `Status Update: ${status}`;
        statusDescription = `The status of your procurement manifest #${order.id.slice(0, 8).toUpperCase()} has been updated.`;
    }

    // Resolve email logo
    const logoUrl = "https://sufyra-fragrance.vercel.app/email-logo.jpeg";
    let logoAttachment: { filename: string; path: string; cid: string } | null = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'email-logo.jpeg');
      if (fs.existsSync(logoPath)) {
        logoAttachment = {
          filename: 'email-logo.jpeg',
          path: logoPath,
          cid: 'email-logo'
        };
      }
    } catch (err) {
      console.error('Error loading email logo:', err);
    }

    const emailHtml = `
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
                  <td style="padding: 45px 40px 35px 40px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                    <div style="margin-bottom: 25px;">
                      <img src="${logoAttachment ? 'cid:email-logo' : logoUrl}" alt="Sufyra Fragrance" width="170" style="display: block; margin: 0 auto; max-width: 170px; height: auto;">
                    </div>
                    <div style="display: inline-block; padding: 6px 18px; border-radius: 50px; background-color: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); color: ${statusColor}; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">
                      ● ${status}
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal; font-style: italic; letter-spacing: 1px;">${statusTitle}</h1>
                    <p style="color: #d4af37; margin-top: 8px; margin-bottom: 0; text-transform: uppercase; letter-spacing: 4px; font-size: 10px; font-weight: bold;">Order Update</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 50px 40px;">
                    <p style="font-size: 16px; color: rgba(255,255,255,0.8); line-height: 1.8; text-align: center;">Dear ${order.delivery_name || 'Valued Client'},</p>
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
                      <a href="https://wa.me/8801886141861" style="display: inline-block; border: 1px solid #d4af37; color: #d4af37; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">WhatsApp Concierge</a>
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
    `;

    let emailSent = false;
    let provider = 'none';
    let emailError: string | null = null;

    // Must be sent to the dynamic customer who placed the order
    if (!customerEmail || !customerEmail.includes('@')) {
      console.warn(`Cannot send status email: No customer email address associated with order #${order.id}`);
      return NextResponse.json({ 
        success: true, 
        emailSent: false, 
        error: `Order status updated in database, but customer email notification could not be sent: No customer email address on record for order #${order.id.slice(0, 8).toUpperCase()}` 
      });
    }

    // Try Gmail SMTP (Nodemailer) first
    if (process.env.COMPANY_PASSWORD) {
      try {
        await transporter.sendMail({
          from: FROM_SENDER,
          to: customerEmail,
          subject: `${statusTitle} - Sufyra Manifest #${order.id.slice(0, 8).toUpperCase()}`,
          attachments: logoAttachment ? [logoAttachment] : [],
          html: emailHtml,
        });
        emailSent = true;
        provider = 'gmail-smtp';
      } catch (gmailErr) {
        console.error('Gmail SMTP status update email failed:', gmailErr);
        emailError = gmailErr instanceof Error ? gmailErr.message : 'Gmail SMTP failed';
      }
    }

    // Fallback to Resend if Gmail failed or not configured
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Sufyra Mansion <onboarding@resend.dev>',
          to: customerEmail,
          subject: `${statusTitle} - Sufyra Manifest #${order.id.slice(0, 8).toUpperCase()}`,
          html: emailHtml,
        });
        emailSent = true;
        provider = 'resend';
      } catch (resendErr) {
        console.error('Resend status update email failed:', resendErr);
        emailError = (emailError ? emailError + ' | ' : '') + (resendErr instanceof Error ? resendErr.message : 'Resend failed');
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailSent, 
      provider, 
      recipient: customerEmail, 
      error: emailError 
    });
  } catch (error) {
    console.error('Status update email notification failed:', error);
    return NextResponse.json({ 
      success: true, 
      emailSent: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
