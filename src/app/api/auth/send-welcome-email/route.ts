import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/sendWelcomeEmail';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, userId, provider } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const result = await sendWelcomeEmail({
      email: email.trim().toLowerCase(),
      name: typeof name === 'string' ? name.trim() : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
      provider: typeof provider === 'string' ? provider : 'email',
    });

    if (!result.success) {
      console.warn('[API Welcome Email] Delivery failed or skipped:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to dispatch welcome email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email dispatched successfully.',
    });
  } catch (error) {
    console.error('[API Welcome Email] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error.',
      },
      { status: 500 }
    );
  }
}
