'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  ShieldCheck, 
  GraduationCap, 
  LogOut, 
  Sparkles, 
  BookOpen, 
  Repeat, 
  CheckCheck,
  FileCheck2,
  Mail
} from 'lucide-react';

interface NavbarProps {
  onOpenHistory?: () => void;
  historyCount?: number;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export default function Navbar({ 
  onOpenHistory, 
  historyCount = 0,
  activeTab = 'plagiarism',
  onSelectTab
}: NavbarProps) {
  const { data: session, status } = useSession();

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand" onClick={() => onSelectTab && onSelectTab('plagiarism')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
            <ShieldCheck className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Originality<span className="brand-gradient">AI</span></span>
            <span className="brand-tagline">By Students, For Students</span>
          </div>
        </div>

        {/* Central Tool Switcher (Grammarly / DupliChecker style) */}
        <nav className="navbar-nav-tools">
          <button
            type="button"
            className={`nav-tool-btn ${activeTab === 'plagiarism' ? 'nav-tool-active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('plagiarism')}
          >
            <FileCheck2 size={15} />
            <span>Plagiarism Checker</span>
          </button>

          <button
            type="button"
            className={`nav-tool-btn ${activeTab === 'paraphraser' ? 'nav-tool-active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('paraphraser')}
          >
            <Repeat size={15} />
            <span>Paraphrasing Tool</span>
          </button>

          <button
            type="button"
            className={`nav-tool-btn ${activeTab === 'citations' ? 'nav-tool-active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('citations')}
          >
            <BookOpen size={15} />
            <span>Citation Generator</span>
          </button>

          <button
            type="button"
            className={`nav-tool-btn ${activeTab === 'grammar' ? 'nav-tool-active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('grammar')}
          >
            <CheckCheck size={15} />
            <span>Grammar & Tone</span>
          </button>
        </nav>

        {/* Right side: Free Student Badge & Google Auth */}
        <div className="navbar-actions">
          <div className="student-badge">
            <GraduationCap size={15} className="badge-icon" />
            <span className="badge-text">
              {session?.user ? '100% Free Student Pass' : 'Free for All Students & Gmail'}
            </span>
            <span className="badge-pulse" />
          </div>

          {historyCount > 0 && (
            <button 
              type="button" 
              className="btn-history"
              onClick={onOpenHistory}
              title="Recent Drafts"
            >
              <Sparkles size={15} />
              <span>History ({historyCount})</span>
            </button>
          )}

          {status === 'loading' ? (
            <div className="auth-skeleton" />
          ) : session?.user ? (
            <div className="user-profile">
              <div className="user-avatar-fallback">
                {(session.user as any).userType === 'student' ? '🎓' : (session.user.name?.charAt(0) || 'U')}
              </div>
              <div className="user-details">
                <div className="user-name-line">
                  <span className="user-name">{session.user.name || 'User'}</span>
                  {(session.user as any).userType === 'student' ? (
                    <span className="pill-student-tiny">Student</span>
                  ) : (
                    <span className="pill-standard-tiny">Standard</span>
                  )}
                </div>
                {(session.user as any).institutionName && (
                  <span className="user-school-tag">
                    {(session.user as any).institutionName} (ID: {(session.user as any).studentId || 'Verified'})
                  </span>
                )}
                <span className="user-email">{session.user.email}</span>
              </div>
              <button 
                type="button" 
                onClick={() => signOut()}
                className="btn-signout"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="btn-email-signin"
            >
              <GraduationCap size={16} />
              <span>Student / User Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
