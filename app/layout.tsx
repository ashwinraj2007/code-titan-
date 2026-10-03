import type { Metadata, Viewport } from 'next';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'OriginalityAI — AI Plagiarism & Paraphrase Detector for Students',
  description: 'Free AI-driven academic integrity, paraphrase, and plagiarism detector for students. Inspect essays, thesis drafts, and research with sentence-level transparency.',
  keywords: [
    'plagiarism detector',
    'paraphrase detector',
    'AI detector',
    'student free plagiarism checker',
    'academic integrity',
    'turnitin alternative',
  ],
  authors: [{ name: 'OriginalityAI Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
