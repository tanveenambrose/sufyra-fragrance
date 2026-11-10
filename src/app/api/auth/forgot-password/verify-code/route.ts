import { NextResponse } from 'next/server';
import { supabaseStatic } from '@/utils/supabase/static';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Query database to verify the code matches and is unexpired
    const { data: result, error: rpcError } = await supabaseStatic.rpc('verify_reset_code', {
      p_email: cleanEmail,
      p_code: cleanCode,
    });

    if (rpcError) {
      console.error('verify_reset_code RPC error:', rpcError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify code. Please try again.' },
        { status: 500 }
      );
    }

    if (!result || !result.valid) {
      return NextResponse.json(
        { success: false, error: result?.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code verified successfully.',
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error occurred.' },
      { status: 500 }
    );
  }
}

