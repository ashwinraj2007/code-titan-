import { NextRequest, NextResponse } from 'next/server';
import { generateOtp, sendOtpEmail } from '@/lib/otp-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    // Validate basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email format (e.g. student@gmail.com or name@university.edu).' },
        { status: 400 }
      );
    }

    // Generate code
    const code = generateOtp(cleanEmail);

    // Send email
    const result = await sendOtpEmail(cleanEmail, code);

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: result.message,
      simulated: result.simulated,
      demoCode: result.simulated ? result.demoCode : undefined,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/send-code:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
