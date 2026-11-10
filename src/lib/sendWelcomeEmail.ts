import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const FROM_EMAIL = 'sufyrafragrance@gmail.com';
const FROM_SENDER = `"Sufyra Fragrance" <${FROM_EMAIL}>`;

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.COMPANY_EMAIL || FROM_EMAIL,
    pass: process.env.COMPANY_PASSWORD,
  },
});

export interface SendWelcomeEmailParams {
  email: string;
  name?: string;
  userId?: string;
  provider?: string;
}

export async function sendWelcomeEmail({
  email,
  name,
  userId,
  provider,
}: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid recipient email address.' };
    }

    console.log(`[Welcome Email] Processing welcome dispatch for ${email} (via ${provider || 'credentials'})`);

    // Check if welcome email was already sent for this user
    if (userId) {
      try {
        const { data: isSent, error: rpcErr } = await supabase.rpc(
          'is_welcome_email_sent',
          { target_user_id: userId }
        );

        if (!rpcErr && isSent === true) {
          console.log(`[Welcome Email] Skipped: Welcome email already sent to ${email}`);
          return { success: true };
        }

        if (rpcErr) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('welcome_email_sent')
            .eq('id', userId)
            .single();

          if (existingUser?.welcome_email_sent === true) {
            console.log(`[Welcome Email] Skipped: Welcome email already sent to ${email}`);
            return { success: true };
          }
        }
      } catch (checkErr) {
        console.warn('[Welcome Email] Non-blocking check warning:', checkErr);
      }
    }

    const hasGmail = !!(process.env.COMPANY_EMAIL && process.env.COMPANY_PASSWORD);
    const hasResend = !!process.env.RESEND_API_KEY;

    if (!hasGmail && !hasResend) {
      console.warn('[Welcome Email] Skipped: No email provider configured.');
      return { success: false, error: 'No email service credentials configured.' };
    }

    const recipientName = name && name.trim() ? name.trim() : email.split('@')[0];
    const subject = `Welcome to the Sufyra Sanctuary, ${recipientName} ✨`;

    // Local embedded logo attachment
    const localLogoPath = path.join(process.cwd(), 'public', 'email-logo.jpeg');
    const logoAttachment = fs.existsSync(localLogoPath)
      ? { filename: 'email-logo.jpeg', path: localLogoPath, cid: 'sufyralogo' }
      : null;

    const logoSrc = logoAttachment
      ? 'cid:sufyralogo'
      : 'https://sufyra-fragrance.vercel.app/email-logo.jpeg';

    const boutiqueUrl = 'https://sufyra-fragrance.vercel.app/products';
    const whatsappUrl = 'https://wa.me/8801886141861';
    const facebookUrl = 'https://www.facebook.com/SufyraFragrance/';
    const instagramUrl = 'https://www.instagram.com/sufyra_fragrance';

    const welcomeHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Playfair Display', Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif; color: #FAF9F6; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0A0A0A; border: 1px solid rgba(197, 160, 89, 0.35); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.8);">
                
                <!-- Gold Accent Top Bar -->
                <tr>
                  <td style="background: linear-gradient(90deg, #8B5E3C, #C5A059, #8B5E3C); height: 4px;"></td>
                </tr>

                <!-- Header / Logo -->
                <tr>
                  <td align="center" style="padding: 40px 30px 25px 30px;">
                    <img src="${logoSrc}" alt="Sufyra Fragrance" width="130" style="display: block; border-radius: 10px; margin-bottom: 15px;" />
                    <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.35em; color: #C5A059; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      The Olfactory Sanctuary
                    </p>
                  </td>
                </tr>

                <!-- Hero Section -->
                <tr>
                  <td style="padding: 0 35px 25px 35px; text-align: center;">
                    <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: normal; color: #FAF9F6; line-height: 1.3;">
                      Welcome to the World of <br />
                      <span style="color: #C5A059; font-style: italic;">Artisanal Haute Perfumery</span>
                    </h1>
                    <p style="margin: 0 auto; max-width: 480px; font-size: 13px; line-height: 1.7; color: rgba(250, 249, 246, 0.7); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Dear <strong>${recipientName}</strong>, your account has been successfully registered. You now have privileged access to our curated private reserve of pure concentrated attars, royal oudh, and handcrafted flacons.
                    </p>
                  </td>
                </tr>

                <!-- Privileges Card -->
                <tr>
                  <td style="padding: 0 35px 30px 35px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(197, 160, 89, 0.2); border-radius: 14px; padding: 20px;">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #C5A059; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ✦ Exclusive Patron Privileges
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.8; color: rgba(250, 249, 246, 0.8);">
                          <div style="margin-bottom: 8px;">
                            <strong style="color: #FAF9F6;">100% Pure Alcohol-Free Attars</strong> — Hand-blended for enduring, all-day sillage.
                          </div>
                          <div style="margin-bottom: 8px;">
                            <strong style="color: #FAF9F6;">Signature Presentation</strong> — Every order arrives in bespoke luxury packaging.
                          </div>
                          <div style="margin-bottom: 8px;">
                            <strong style="color: #FAF9F6;">Fast Nationwide COD</strong> — Reliable cash on delivery across all 64 districts in Bangladesh.
                          </div>
                          <div>
                            <strong style="color: #FAF9F6;">VIP Concierge Support</strong> — Direct bespoke guidance from our master perfumers.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 0 35px 35px 35px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #C5A059 0%, #8B5E3C 100%);">
                          <a href="${boutiqueUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.25em; color: #0A0A0A; text-decoration: none; border-radius: 12px;">
                            Explore Scent Collection →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Concierge Support Contact Strip -->
                <tr>
                  <td style="padding: 25px 35px; background-color: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #C5A059; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Need Olfactory Advice?
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: rgba(250, 249, 246, 0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Chat directly with our fragrance concierge:
                    </p>
                    <table border="0" cellspacing="0" cellpadding="0" align="center">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="${whatsappUrl}" target="_blank" style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 8px; color: #C5A059; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-decoration: none; font-weight: 600;">
                            💬 WhatsApp +880 1886-141861
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="mailto:${FROM_EMAIL}" style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #FAF9F6; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-decoration: none; font-weight: 600;">
                            ✉️ ${FROM_EMAIL}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 25px 35px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: rgba(250, 249, 246, 0.4); line-height: 1.8;">
                    <div style="margin-bottom: 8px;">
                      <a href="${facebookUrl}" target="_blank" style="color: #C5A059; text-decoration: none; margin: 0 8px;">Facebook</a>
                      •
                      <a href="${instagramUrl}" target="_blank" style="color: #C5A059; text-decoration: none; margin: 0 8px;">Instagram</a>
                      •
                      <a href="${boutiqueUrl}" target="_blank" style="color: #C5A059; text-decoration: none; margin: 0 8px;">Online Boutique</a>
                    </div>
                    <p style="margin: 0;">
                      © ${new Date().getFullYear()} Sufyra Fragrance. All rights reserved.<br />
                      Handcrafted in Bangladesh • Artisanal Perfume Concentrates
                    </p>
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
    let lastError: string | undefined;

    // 1. Primary: Gmail SMTP
    if (hasGmail) {
      try {
        await transporter.sendMail({
          from: FROM_SENDER,
          to: email,
          subject,
          attachments: logoAttachment ? [logoAttachment] : [],
          html: welcomeHtml,
        });
        emailSent = true;
        console.log(`[Welcome Email] Successfully sent to ${email} via Gmail SMTP`);
      } catch (smtpErr) {
        console.error('[Welcome Email] Gmail SMTP error:', smtpErr);
        lastError = smtpErr instanceof Error ? smtpErr.message : 'SMTP failed';
      }
    }

    // 2. Fallback: Resend
    if (!emailSent && hasResend) {
      try {
        await resend.emails.send({
          from: 'Sufyra Fragrance <onboarding@resend.dev>',
          to: email,
          subject,
          html: welcomeHtml,
        });
        emailSent = true;
        console.log(`[Welcome Email] Successfully sent to ${email} via Resend fallback`);
      } catch (resendErr) {
        console.error('[Welcome Email] Resend fallback error:', resendErr);
        lastError = resendErr instanceof Error ? resendErr.message : 'Resend failed';
      }
    }

    // Mark as sent in public.users
    if (emailSent && userId) {
      try {
        const { error: rpcMarkErr } = await supabase.rpc(
          'mark_welcome_email_sent',
          { target_user_id: userId }
        );
        if (rpcMarkErr) {
          await supabase
            .from('users')
            .update({ welcome_email_sent: true })
            .eq('id', userId);
        }
      } catch (dbErr) {
        console.warn('[Welcome Email] Failed to update welcome_email_sent flag in db:', dbErr);
      }
    }

    return { success: emailSent, error: emailSent ? undefined : lastError };
  } catch (err) {
    console.error('[Welcome Email] Fatal error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown welcome email error',
    };
  }
}
