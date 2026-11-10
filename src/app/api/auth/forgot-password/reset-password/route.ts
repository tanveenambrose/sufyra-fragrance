import { NextResponse } from 'next/server';
import { supabaseStatic } from '@/utils/supabase/static';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Reset password: Validates code, marks code as used, and hashes password with bcrypt
    const { data: result, error: rpcError } = await supabaseStatic.rpc('reset_password_with_code', {
      p_email: cleanEmail,
      p_code: cleanCode,
      p_new_password: newPassword,
    });

    if (rpcError) {
      console.error('reset_password_with_code RPC error:', rpcError);
      return NextResponse.json(
        { success: false, error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, error: result?.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error occurred.' },
      { status: 500 }
    );
  }
}

