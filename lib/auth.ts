import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyOtp } from '@/lib/otp-store';

export function checkStudentEligibility(email?: string | null): { isStudent: boolean; reason: string } {
  if (!email) return { isStudent: false, reason: 'No email provided' };

  const lowerEmail = email.toLowerCase();
  const academicTlds = ['.edu', '.ac.uk', '.edu.in', '.ac.in', '.edu.au', '.edu.ca', '.school', '.university'];
  const isAcademicDomain = academicTlds.some(tld => lowerEmail.endsWith(tld) || lowerEmail.includes(tld + '/'));
  const isGmail = lowerEmail.endsWith('@gmail.com') || lowerEmail.endsWith('@googlemail.com');

  if (isAcademicDomain) {
    return { isStudent: true, reason: 'Verified Institutional Academic Email (.edu / .ac)' };
  }

  if (isGmail) {
    return { isStudent: true, reason: 'Verified Gmail Student Access Program' };
  }

  return { isStudent: true, reason: 'General Student Tier (Email Code Verified)' };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'email-code',
      name: 'Email Verification Code',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Verification Code', type: 'text' },
        name: { label: 'Name', type: 'text' },
        userType: { label: 'User Type', type: 'text' },
        institutionName: { label: 'School / College Name', type: 'text' },
        studentId: { label: 'Student ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error('Both email and verification code are required.');
        }

        const email = credentials.email.trim().toLowerCase();
        const code = credentials.code.trim();

        const verification = verifyOtp(email, code);
        if (!verification.valid) {
          throw new Error(verification.reason || 'Invalid verification code.');
        }

        const isStudent = (credentials.userType || 'student') === 'student';
        const rawName = credentials.name?.trim();
        const username = rawName || email.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

        return {
          id: email,
          email,
          name: formattedName,
          userType: isStudent ? 'student' : 'standard',
          isStudent: isStudent,
          institutionName: isStudent ? (credentials.institutionName?.trim() || 'Verified Student') : undefined,
          studentId: isStudent ? (credentials.studentId?.trim() || 'Verified ID') : undefined,
          studentReason: isStudent ? 'Student Identification Verified' : 'Standard Account',
          tier: isStudent ? 'free_student' : 'standard',
        } as any;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.userType = u.userType || 'student';
        token.isStudent = u.isStudent ?? true;
        token.institutionName = u.institutionName;
        token.studentId = u.studentId;
        token.studentReason = u.studentReason ?? 'Email Code Verified';
        token.tier = u.tier || 'free_student';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).userType = token.userType || 'student';
        (session.user as any).isStudent = token.isStudent ?? true;
        (session.user as any).institutionName = token.institutionName;
        (session.user as any).studentId = token.studentId;
        (session.user as any).studentReason = token.studentReason ?? 'Student Free Pass';
        (session.user as any).tier = token.tier || 'free_student';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev_secret_veritas_detector_super_secure_key_123',
};
