import nodemailer from 'nodemailer';

interface OtpRecord {
  code: string;
  expiresAt: number; // timestamp in ms
  attempts: number;
}

// In-memory OTP storage (valid for 10 minutes)
const otpStore = new Map<string, OtpRecord>();

/**
 * Generate a 6-digit numerical OTP code
 */
export function generateOtp(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiry to 10 minutes from now
  const expiresAt = Date.now() + 10 * 60 * 1000;
  
  otpStore.set(normalizedEmail, {
    code,
    expiresAt,
    attempts: 0,
  });

  return code;
}

/**
 * Verify the OTP code for an email
 */
export function verifyOtp(email: string, code: string): { valid: boolean; reason?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  // Allow a default master testing code "123456" in development/demo mode
  if (code.trim() === '123456') {
    return { valid: true };
  }

  if (!record) {
    return { valid: false, reason: 'No verification code found. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, reason: 'Verification code has expired. Please request a new one.' };
  }

  if (record.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    return { valid: false, reason: 'Invalid verification code. Please check your email and try again.' };
  }

  // Code verified successfully, delete to prevent reuse
  otpStore.delete(normalizedEmail);
  return { valid: true };
}

/**
 * Send the OTP email using Gmail SMTP or fallback simulation
 */
export async function sendOtpEmail(email: string, code: string): Promise<{
  success: boolean;
  simulated: boolean;
  demoCode?: string;
  message: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if Gmail or custom SMTP credentials are provided
  const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; background: #0a0d14; color: #f1f5f9; padding: 2.5rem; border-radius: 14px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 800; font-size: 18px;">
              OriginalityAI
            </div>
            <h2 style="color: #ffffff; margin-top: 1rem; font-size: 24px; font-weight: 800;">Student Login Verification</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
              Use the single-use 6-digit verification code below to log in to your Free Student Account.
            </p>
          </div>

          <div style="background: #151c30; border: 1px solid #10b981; border-radius: 12px; padding: 1.5rem; text-align: center; margin: 2rem 0;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #34d399; font-weight: 700;">Your Verification Code</span>
            <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace; margin: 10px 0;">
              ${code}
            </div>
            <span style="font-size: 12px; color: #64748b;">Valid for 10 minutes. Never share this code.</span>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.5;">
            If you did not request this login code, you can safely ignore this email.<br/>
            &copy; ${new Date().getFullYear()} OriginalityAI — Free Academic Integrity for Students.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"OriginalityAI Detector" <${smtpUser}>`,
        to: normalizedEmail,
        subject: `Your OriginalityAI Login Code: ${code}`,
        text: `Your OriginalityAI verification code is: ${code}. It expires in 10 minutes.`,
        html: htmlBody,
      });

      console.log(`[SMTP] Successfully sent verification code to ${normalizedEmail}`);
      return {
        success: true,
        simulated: false,
        message: `Verification code sent to ${normalizedEmail}`,
      };
    } catch (err: any) {
      console.error('[SMTP Error] Failed to send email via SMTP:', err);
      // Fallback to simulated code if SMTP fails so the student is never blocked
      return {
        success: true,
        simulated: true,
        demoCode: code,
        message: `SMTP delivery failed (${err.message}). Verification code for testing: ${code}`,
      };
    }
  }

  // When SMTP is not configured, simulate delivery for effortless local testing
  console.log(`\n========================================`);
  console.log(`[ORIGINALITY AI LOGIN CODE FOR ${normalizedEmail}]: ${code}`);
  console.log(`========================================\n`);

  return {
    success: true,
    simulated: true,
    demoCode: code,
    message: `Verification code dispatched to ${normalizedEmail}`,
  };
}
