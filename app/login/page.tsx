'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  User,
  School,
  IdCard,
  Building
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Mode: student vs standard
  const [userType, setUserType] = useState<'student' | 'standard'>('student');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [studentId, setStudentId] = useState('');

  // Flow states
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // If already logged in, redirect to home
  useEffect(() => {
    if (session?.user) {
      router.push('/');
    }
  }, [session, router]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address to receive the verification code.');
      return;
    }

    if (userType === 'student') {
      if (!institutionName.trim()) {
        setErrorMsg('Please enter your School, College, or University name.');
        return;
      }
      if (!studentId.trim()) {
        setErrorMsg('Please enter your Student ID or Roll Number.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setStep('code');
      setCountdown(45);
      setSuccessMsg(`Verification code sent to ${data.email}. Check your inbox!`);
      if (data.simulated && data.demoCode) {
        setDemoCode(data.demoCode);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('email-code', {
        email: email.trim(),
        code: code.trim(),
        name: name.trim(),
        userType,
        institutionName: userType === 'student' ? institutionName.trim() : '',
        studentId: userType === 'student' ? studentId.trim() : '',
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card login-card-wide">
        {/* Brand Header */}
        <div className="login-header">
          <Link href="/" className="login-brand-link">
            <div className="brand-logo">
              <ShieldCheck className="brand-icon" size={24} />
            </div>
            <span className="brand-title">Originality<span className="brand-gradient">AI</span></span>
          </Link>
          <h1 className="login-title">Account Sign In</h1>
          <p className="login-subtitle">
            Choose your account type below. Students receive 100% Free Unlimited Access.
          </p>
        </div>

        {/* Tab Switcher: Student vs Normal User */}
        {step === 'details' && (
          <div className="user-type-selector">
            <button
              type="button"
              className={`user-type-tab ${userType === 'student' ? 'user-type-tab-active' : ''}`}
              onClick={() => {
                setUserType('student');
                setErrorMsg(null);
              }}
            >
              <GraduationCap size={18} />
              <div className="tab-text-group">
                <span className="tab-title">Student Sign In</span>
                <span className="tab-tagline">100% Free Unlimited Access</span>
              </div>
            </button>

            <button
              type="button"
              className={`user-type-tab ${userType === 'standard' ? 'user-type-tab-active' : ''}`}
              onClick={() => {
                setUserType('standard');
                setErrorMsg(null);
              }}
            >
              <User size={18} />
              <div className="tab-text-group">
                <span className="tab-title">Normal / General User</span>
                <span className="tab-tagline">Standard Account Access</span>
              </div>
            </button>
          </div>
        )}

        {/* Step 1: Input details */}
        {step === 'details' ? (
          <form onSubmit={handleSendCode} className="login-form">
            {/* Banner explaining entitlement */}
            {userType === 'student' ? (
              <div className="tier-info-banner banner-student">
                <Sparkles size={16} className="text-emerald" />
                <span>
                  <strong>Student Free Pass:</strong> Enter your School or College Name and Student ID. You will receive <strong>unlimited scans, deep paraphrase detection, and APA/MLA citations</strong> for free.
                </span>
              </div>
            ) : (
              <div className="tier-info-banner banner-standard">
                <User size={16} className="text-blue" />
                <span>
                  <strong>Standard User:</strong> Sign in with your email code to check documents with standard access.
                </span>
              </div>
            )}

            {/* Full Name */}
            <div className="form-group-login">
              <label htmlFor="user-name" className="login-label">
                Full Name
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="user-name"
                  type="text"
                  className="login-input"
                  placeholder="e.g. Ashwin Raj"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Student Specific Fields */}
            {userType === 'student' && (
              <div className="student-fields-grid">
                <div className="form-group-login">
                  <label htmlFor="institution-name" className="login-label">
                    School or College / University Name
                  </label>
                  <div className="input-with-icon">
                    <School size={18} className="input-icon" />
                    <input
                      id="institution-name"
                      type="text"
                      className="login-input"
                      placeholder="e.g. Stanford University or St. Xavier's College"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-login">
                  <label htmlFor="student-id" className="login-label">
                    Student ID / Roll Number
                  </label>
                  <div className="input-with-icon">
                    <IdCard size={18} className="input-icon" />
                    <input
                      id="student-id"
                      type="text"
                      className="login-input"
                      placeholder="e.g. STU-2024-8842"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="form-group-login">
              <label htmlFor="user-email" className="login-label">
                Email Address (Receives 6-Digit Code)
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="user-email"
                  type="email"
                  className="login-input"
                  placeholder="yourname@gmail.com or student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <span className="input-help-text">
                {userType === 'student'
                  ? 'Use your Gmail or student email. A passwordless 6-digit login code will be sent.'
                  : 'Enter any valid email address to receive your login code.'}
              </span>
            </div>

            {errorMsg && (
              <div className="login-alert alert-error">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-login-submit"
              disabled={isLoading || !email.trim() || !name.trim()}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Dispatching Login Code...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit Verification Code</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Verification Code Input */
          <form onSubmit={handleVerifyCode} className="login-form">
            {/* Identity Summary Card */}
            <div className="student-summary-pill">
              <div className="summary-left">
                {userType === 'student' ? (
                  <GraduationCap size={20} className="text-emerald" />
                ) : (
                  <User size={20} className="text-blue" />
                )}
                <div className="summary-text-block">
                  <div className="summary-name-row">
                    <strong>{name}</strong>
                    <span className={`pill-badge ${userType === 'student' ? 'badge-student' : 'badge-standard'}`}>
                      {userType === 'student' ? 'Student Free Tier' : 'Standard User'}
                    </span>
                  </div>
                  {userType === 'student' && (
                    <span className="summary-school-text">
                      {institutionName} • ID: {studentId}
                    </span>
                  )}
                  <span className="summary-email-text">{email}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-change-email"
                onClick={() => {
                  setStep('details');
                  setCode('');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
              >
                Edit
              </button>
            </div>

            <div className="form-group-login">
              <label htmlFor="verification-code" className="login-label">
                Enter 6-Digit Verification Code
              </label>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  id="verification-code"
                  type="text"
                  maxLength={6}
                  className="login-input code-input"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>

            {demoCode && (
              <div className="demo-code-helper">
                <span>Testing / Demo Code:</span>
                <button
                  type="button"
                  className="btn-paste-code"
                  onClick={() => setCode(demoCode)}
                  title="Click to autofill test code"
                >
                  <code>{demoCode}</code>
                  <span className="click-to-fill">(Click to fill)</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="login-alert alert-error">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="login-alert alert-success">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-login-submit"
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Verify Code & Enter Dashboard</span>
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="resend-row">
              {countdown > 0 ? (
                <span className="resend-countdown">
                  Resend code in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-resend"
                  onClick={handleSendCode}
                  disabled={isLoading}
                >
                  <RotateCcw size={14} />
                  <span>Didn't receive code? Resend now</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="login-footer">
          <div className="trust-bullets">
            <span><CheckCircle2 size={13} className="text-emerald" /> No password to remember</span>
            <span><CheckCircle2 size={13} className="text-emerald" /> Instant verification</span>
            <span><CheckCircle2 size={13} className="text-emerald" /> 100% Free for Students</span>
          </div>

          <Link href="/" className="back-home-link">
            <ArrowLeft size={14} />
            <span>Back to Plagiarism Checker</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
