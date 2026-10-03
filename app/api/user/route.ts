import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({
      authenticated: false,
      tier: 'guest',
      isStudent: false,
      message: 'Sign in with your Google account to unlock unlimited Student Free Access.',
    });
  }

  const user = session.user as any;

  return NextResponse.json({
    authenticated: true,
    user: {
      name: user.name,
      email: user.email,
      image: user.image,
      isStudent: user.isStudent ?? true,
      studentReason: user.studentReason ?? 'Student Free Pass',
      tier: user.tier || 'free_student',
      scansAllowed: 'unlimited',
    },
  });
}
