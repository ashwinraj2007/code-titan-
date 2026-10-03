'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, FileText } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="login-page-wrapper">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ margin: '0 auto 1.5rem auto', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert size={36} className="text-crimson" />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f87171', marginBottom: '0.5rem' }}>
          404
        </h1>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff' }}>
          Page Not Found
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page or document URL you are trying to reach does not exist or has been relocated.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/"
            className="btn-login-submit"
            style={{ textDecoration: 'none' }}
          >
            <Home size={18} />
            <span>Return to Plagiarism Checker</span>
          </Link>

          <Link
            href="/login"
            className="btn-action-secondary"
            style={{ justifyContent: 'center', padding: '0.75rem', textDecoration: 'none' }}
          >
            <FileText size={16} />
            <span>Go to Student Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
