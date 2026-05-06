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
    let statusMessage = '';
    let statusDetail = '';

    switch (status.toLowerCase()) {
      case 'processing':
        statusMessage = 'Your scent is being prepared';
        statusDetail = 'Our artisans are currently curating and packaging your selection with meticulous care.';
        break;
      case 'shipped':
        statusMessage = 'Your selection is en route';
        statusDetail = 'Your procurement manifest has been handed over to our courier partners. It should arrive at your sanctuary shortly.';
        break;
      case 'received':
        statusMessage = 'Order Manifest Received';
        statusDetail = 'We have successfully received your order request in our system.';
        break;
      default:
        statusMessage = `Order status updated to ${status}`;
        statusDetail = 'The status of your order has been changed in our management system.';
    }

    await resend.emails.send({
      from: 'Sufyra Mansion <onboarding@resend.dev>',
      to: 'racoctanveen15@gmail.com', // Admin notification for now
      subject: `Update on your Sufyra Manifest #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: 'serif', 'Times New Roman', serif; background-color: #050505; color: #ffffff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #d4af37; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
             <h2 style="color: #d4af37; font-size: 10px; text-transform: uppercase; letter-spacing: 5px; font-weight: bold;">Sufyra Fragrance</h2>
             <h1 style="color: #ffffff; margin-top: 10px; font-size: 24px; font-weight: normal; font-style: italic;">${statusMessage}</h1>
          </div>
          
          <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(212, 175, 55, 0.1); padding: 30px; border-radius: 15px; margin-bottom: 30px;">
            <p style="color: #ffffff; line-height: 1.6; margin-bottom: 20px;">Dear ${order.delivery_name},</p>
            <p style="color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 30px;">${statusDetail}</p>
            
            <div style="border-top: 1px solid rgba(212, 175, 55, 0.1); pt-20px;">
              <p style="font-size: 10px; text-transform: uppercase; color: #d4af37; letter-spacing: 2px; margin-bottom: 10px;">Manifest Details</p>
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: rgba(255,255,255,0.4); padding: 5px 0;">Product:</td>
                  <td style="text-align: right; color: #ffffff;">${order.product_name} (${order.variant_size})</td>
                </tr>
                <tr>
                  <td style="color: rgba(255,255,255,0.4); padding: 5px 0;">Manifest ID:</td>
                  <td style="text-align: right; color: #d4af37; font-family: monospace;">#${order.id.slice(0, 8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color: rgba(255,255,255,0.4); padding: 5px 0;">Current Status:</td>
                  <td style="text-align: right; color: #d4af37; font-weight: bold; text-transform: uppercase;">${status}</td>
                </tr>
              </table>
            </div>
          </div>

          <div style="text-align: center; font-size: 10px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 2px;">
            <p>Artisanal Perfumery Control System — Sufyra Mansion</p>
          </div>
        </div>
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
