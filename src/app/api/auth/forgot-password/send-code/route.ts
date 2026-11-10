import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { supabaseStatic } from '@/utils/supabase/static';

export const runtime = 'nodejs';

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

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Generate a secure 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // 2. Query DB and store time-sensitive code (10 minutes validity)
    const { data: rpcResult, error: rpcError } = await supabaseStatic.rpc('generate_reset_code', {
      p_email: cleanEmail,
      p_code: verificationCode,
      p_expires_minutes: 10,
    });

    if (rpcError) {
      console.error('generate_reset_code RPC error:', rpcError);
      return NextResponse.json(
        { success: false, error: 'Database verification failed. Please try again.' },
        { status: 500 }
      );
    }

    if (!rpcResult || !rpcResult.success) {
      return NextResponse.json(
        { success: false, error: rpcResult?.error || 'No account registered with this email address.' },
        { status: 404 }
      );
    }

    // 3. Prepare Luxury Email Template
    const emailSubject = `Your Sufyra Privé Security Code — [${verificationCode}]`;
    const logoUrl = 'https://sufyra-fragrance.vercel.app/email-logo.jpeg';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505;">
          <tr>
            <td align="center" style="padding: 40px 15px;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #0d0d0d; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 30px 25px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.15);">
                    <img src="${logoUrl}" alt="Sufyra Fragrance" width="150" style="display: block; margin: 0 auto; max-width: 150px; height: auto;">
                    <div style="margin-top: 20px; display: inline-block; padding: 4px 14px; border-radius: 50px; background-color: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); color: #d4af37; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                      Password Recovery
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 35px 35px 25px 35px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0 0 12px 0; font-size: 22px; font-weight: 600; font-style: italic; letter-spacing: 0.5px;">
                      Sanctuary Access Key
                    </h1>
                    <p style="color: rgba(255, 255, 255, 0.65); font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                      We received a request to reset the password for your Sufyra Privé account. Use the one-time verification code below to establish a new password:
                    </p>

                    <!-- Code Display Box -->
                    <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05)); border: 2px dashed rgba(212, 175, 55, 0.5); border-radius: 16px; padding: 22px; margin: 0 auto 30px auto; max-width: 320px;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #d4af37; display: block;">
                        ${verificationCode}
                      </span>
                    </div>

                    <!-- Expiration Notice -->
                    <p style="color: #f59e0b; font-size: 12px; margin: 0 0 20px 0; letter-spacing: 0.5px; font-weight: 500;">
                      ⏱ This security code expires in <strong>10 minutes</strong>.
                    </p>

                    <p style="color: rgba(255, 255, 255, 0.35); font-size: 12px; line-height: 1.5; margin: 0;">
                      If you did not initiate this request, you can safely disregard this email. Your credentials remain securely protected.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 30px; text-align: center; background-color: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(212, 175, 55, 0.1); color: rgba(255, 255, 255, 0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
                    Sufyra Fragrance &copy; 2026 • Artisanal Perfumery
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 4. Send email via Gmail SMTP or Resend fallback
    let emailDispatched = false;
    let dispatchError: string | null = null;

    if (process.env.COMPANY_PASSWORD) {
      try {
        await transporter.sendMail({
          from: FROM_SENDER,
          to: cleanEmail,
          subject: emailSubject,
          html: emailHtml,
        });
        emailDispatched = true;
      } catch (err) {
        console.error('Gmail SMTP dispatch failed:', err);
        dispatchError = err instanceof Error ? err.message : 'SMTP error';
      }
    }

    if (!emailDispatched && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Sufyra Privé <onboarding@resend.dev>',
          to: cleanEmail,
          subject: emailSubject,
          html: emailHtml,
        });
        emailDispatched = true;
        dispatchError = null;
      } catch (err) {
        console.error('Resend dispatch failed:', err);
        dispatchError = err instanceof Error ? err.message : 'Resend error';
      }
    }

    if (!emailDispatched) {
      return NextResponse.json(
        {
          success: false,
          error: dispatchError || 'Unable to deliver verification code. Please check email configuration.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully to your email.',
    });
  } catch (error) {
    console.error('Forgot password send-code error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error occurred.' },
      { status: 500 }
    );
  }
}

