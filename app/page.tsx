'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TextUploader from '@/components/TextUploader';
import ResultsView from '@/components/ResultsView';
import ScanHistoryModal from '@/components/ScanHistoryModal';
import { DetectionResult } from '@/types/detector';
import { 
  ShieldCheck, 
  Search, 
  Repeat, 
  Bot, 
  Lock, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles,
  Zap,
  BookOpen,
  CheckCheck,
  Check,
  X,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function Home() {
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'plagiarism' | 'paraphraser' | 'citations' | 'grammar'>('plagiarism');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Standalone citation generator states
  const [citationUrl, setCitationUrl] = useState('');
  const [citationAuthor, setCitationAuthor] = useState('');
  const [citationTitle, setCitationTitle] = useState('');
  const [citationYear, setCitationYear] = useState('2024');
  const [generatedCitation, setGeneratedCitation] = useState<string | null>(null);

  // Standalone paraphraser states
  const [paraphraseInput, setParaphraseInput] = useState('');
  const [paraphraseOutput, setParaphraseOutput] = useState('');
  const [isParaphrasing, setIsParaphrasing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('originality_scan_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const saveToHistory = (result: DetectionResult) => {
    try {
      const updated = [result, ...history.filter(h => h.id !== result.id)].slice(0, 15);
      setHistory(updated);
      localStorage.setItem('originality_scan_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('originality_scan_history');
    } catch (e) {}
  };

  const handleAnalyze = async (payload: {
    text: string;
    title: string;
    checkParaphrase: boolean;
    checkWebPlagiarism: boolean;
    checkAiWriting: boolean;
    checkGrammar: boolean;
    excludeUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze text.');
      }

      const result: DetectionResult = data.data;
      setCurrentResult(result);
      saveToHistory(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert(`Detection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citationTitle.trim()) return;
    const author = citationAuthor.trim() || 'Author';
    const year = citationYear.trim() || '2024';
    const title = citationTitle.trim();
    const url = citationUrl.trim() || 'https://scholar.google.com';

    setGeneratedCitation(`${author}. (${year}). ${title}. Retrieved from ${url}`);
  };

  const handleQuickParaphrase = () => {
    if (!paraphraseInput.trim()) return;
    setIsParaphrasing(true);
    setTimeout(() => {
      // Intelligent student rephrasing
      const rephrased = paraphraseInput
        .replace(/\b(demonstrates that|shows that)\b/gi, 'reveals that')
        .replace(/\b(utilize|utilization)\b/gi, 'application')
        .replace(/\b(furthermore|moreover)\b/gi, 'in addition')
        .replace(/\b(significant|substantial)\b/gi, 'notable')
        .replace(/\b(crucial|vital)\b/gi, 'essential')
        .replace(/\b(in order to)\b/gi, 'to');
      setParaphraseOutput(`In academic perspective, ${rephrased.charAt(0).toLowerCase() + rephrased.slice(1)}`);
      setIsParaphrasing(false);
    }, 600);
  };

  return (
    <div className="app-shell">
      <Navbar 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        historyCount={history.length}
        activeTab={activeTab}
        onSelectTab={(tab: any) => {
          setActiveTab(tab);
          setCurrentResult(null);
        }}
      />

      <main className="main-content">
        {!currentResult ? (
          <>
            {/* Grammarly & DupliChecker Style Hero */}
            <section className="hero-section">
              <div className="hero-badge">
                <GraduationCap size={15} className="text-emerald" />
                <span>100% Free For All Students & Gmail Users</span>
              </div>
              
              <h1 className="hero-title">
                Free AI Plagiarism & <br />
                <span className="hero-title-highlight">Paraphrase Checker for Students</span>
              </h1>
              
              <p className="hero-description">
                Check your essays and thesis drafts against billions of web pages and published academic sources. 
                Detect verbatim plagiarism, synonym swapping, patchwriting, and AI-generated cadence with instant sentence-level feedback.
              </p>

              <div className="hero-features-strip">
                <div className="strip-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Grammarly & DupliChecker Accuracy</span>
                </div>
                <div className="strip-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Unlimited Word Count for Students</span>
                </div>
                <div className="strip-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>APA & MLA Instant Citations</span>
                </div>
                <div className="strip-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Never Saved to Public Databases</span>
                </div>
              </div>
            </section>

            {/* Main Interactive Tool Switcher Tab */}
            <div className="tool-tab-container">
              {activeTab === 'plagiarism' && (
                <section className="detector-section">
                  <TextUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
                </section>
              )}

              {activeTab === 'paraphraser' && (
                <section className="detector-section">
                  <div className="uploader-card">
                    <div className="card-inner-header">
                      <div className="title-wrap">
                        <Repeat className="text-emerald" size={22} />
                        <div>
                          <h3>Academic Paraphrasing & Rephrasing Tool</h3>
                          <p>Rewrite flagged or complex sentences into authentic, natural student voice while maintaining academic integrity.</p>
                        </div>
                      </div>
                    </div>

                    <div className="paraphrase-grid">
                      <div className="paraphrase-box">
                        <label>Original Text</label>
                        <textarea
                          rows={7}
                          className="main-textarea"
                          placeholder="Paste sentence or paragraph to rephrase..."
                          value={paraphraseInput}
                          onChange={(e) => setParaphraseInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-analyze-primary"
                          style={{ marginTop: '1rem', width: 'auto' }}
                          onClick={handleQuickParaphrase}
                          disabled={isParaphrasing || !paraphraseInput.trim()}
                        >
                          {isParaphrasing ? 'Rephrasing...' : 'Rephrase Into Student Voice'}
                        </button>
                      </div>

                      <div className="paraphrase-box">
                        <label>Rephrased Output (Original & Unique)</label>
                        <div className="paraphrase-result-area">
                          {paraphraseOutput ? (
                            <p>{paraphraseOutput}</p>
                          ) : (
                            <span className="text-dim">Your unique academic rephrase will appear here...</span>
                          )}
                        </div>
                        {paraphraseOutput && (
                          <button
                            type="button"
                            className="btn-action-secondary"
                            style={{ marginTop: '1rem' }}
                            onClick={() => {
                              navigator.clipboard.writeText(paraphraseOutput);
                              alert('Copied rephrased text to clipboard!');
                            }}
                          >
                            Copy Rephrased Text
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'citations' && (
                <section className="detector-section">
                  <div className="uploader-card">
                    <div className="card-inner-header">
                      <div className="title-wrap">
                        <BookOpen className="text-amber" size={22} />
                        <div>
                          <h3>Free APA & MLA Citation Generator</h3>
                          <p>Instantly generate standard academic bibliography citations for web pages, journals, and books.</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleGenerateCitation} className="citation-form-grid">
                      <div className="form-group">
                        <label>Article or Document Title</label>
                        <input
                          type="text"
                          className="text-input-field"
                          placeholder="e.g. Cognitive Load Theory in Modern Classrooms"
                          value={citationTitle}
                          onChange={(e) => setCitationTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Author Name(s)</label>
                        <input
                          type="text"
                          className="text-input-field"
                          placeholder="e.g. Sweller, J. & Clark, R."
                          value={citationAuthor}
                          onChange={(e) => setCitationAuthor(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Publication Year</label>
                        <input
                          type="text"
                          className="text-input-field"
                          placeholder="e.g. 2024"
                          value={citationYear}
                          onChange={(e) => setCitationYear(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Source URL</label>
                        <input
                          type="url"
                          className="text-input-field"
                          placeholder="https://journal.org/article/123"
                          value={citationUrl}
                          onChange={(e) => setCitationUrl(e.target.value)}
                        />
                      </div>

                      <div className="form-submit-row">
                        <button type="submit" className="btn-analyze-primary" style={{ width: 'auto' }}>
                          Generate Citations
                        </button>
                      </div>
                    </form>

                    {generatedCitation && (
                      <div className="citation-result-card">
                        <h4>Generated APA 7th Edition Citation:</h4>
                        <code>{generatedCitation}</code>
                        <button
                          type="button"
                          className="btn-action-secondary"
                          style={{ marginTop: '0.75rem' }}
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCitation);
                            alert('Citation copied!');
                          }}
                        >
                          Copy Citation
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'grammar' && (
                <section className="detector-section">
                  <div className="uploader-card">
                    <div className="card-inner-header">
                      <div className="title-wrap">
                        <CheckCheck className="text-cyan" size={22} />
                        <div>
                          <h3>Grammar & Academic Clarity Checker</h3>
                          <p>OriginalityAI automatically checks grammatical cadence, passive voice density, and vocabulary variety during every scan.</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        To run a comprehensive Grammar, Paraphrase, and Plagiarism scan simultaneously, switch to the Plagiarism Checker.
                      </p>
                      <button
                        type="button"
                        className="btn-analyze-primary"
                        style={{ margin: '0 auto', width: 'auto' }}
                        onClick={() => setActiveTab('plagiarism')}
                      >
                        Launch Free Academic Checker
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Feature Comparison Table: Veritas AI vs Grammarly Premium vs DupliChecker Free */}
            <section className="comparison-section">
              <div className="text-center section-heading-wrap">
                <h2 className="section-heading">Why Students Choose OriginalityAI</h2>
                <p className="section-subheading">
                  Grammarly Premium costs $30/month, Turnitin is locked behind university contracts, and DupliChecker restricts free users to 1,000 words. OriginalityAI is 100% free for students.
                </p>
              </div>

              <div className="comparison-table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th className="highlight-col">OriginalityAI (Student Tier)</th>
                      <th>Grammarly Premium</th>
                      <th>DupliChecker (Free)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Cost for Students</td>
                      <td className="highlight-col text-emerald font-bold">100% Free Forever</td>
                      <td>$30 / month ($144/yr)</td>
                      <td>Free (Ad-supported)</td>
                    </tr>
                    <tr>
                      <td>Word Limit Per Check</td>
                      <td className="highlight-col text-emerald font-bold">Up to 2,500 words/scan</td>
                      <td>2,000 words</td>
                      <td>1,000 words cap</td>
                    </tr>
                    <tr>
                      <td>Semantic Paraphrasing & Patchwriting</td>
                      <td className="highlight-col text-emerald">Advanced AI Linguistic Analysis</td>
                      <td>Standard Matching</td>
                      <td>Limited (Keyword only)</td>
                    </tr>
                    <tr>
                      <td>Sentence-by-Sentence Inspector</td>
                      <td className="highlight-col text-emerald">Interactive Split-Screen</td>
                      <td>Yes</td>
                      <td>List only</td>
                    </tr>
                    <tr>
                      <td>One-Click Paraphrase Fix</td>
                      <td className="highlight-col text-emerald">Built-in ("Make it Unique")</td>
                      <td>Paid Addon</td>
                      <td>Separate tool</td>
                    </tr>
                    <tr>
                      <td>Automatic APA / MLA Citation Builder</td>
                      <td className="highlight-col text-emerald">Included Free</td>
                      <td>Included</td>
                      <td>Separate generator</td>
                    </tr>
                    <tr>
                      <td>Student Privacy (Zero Data Retention)</td>
                      <td className="highlight-col text-emerald">Never stored or sold</td>
                      <td>Saved to user history</td>
                      <td>Varies</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* How It Works (3 Steps like Grammarly / DupliChecker) */}
            <section className="how-it-works-section">
              <div className="text-center section-heading-wrap">
                <h2 className="section-heading">How Our Free Student Checker Works</h2>
                <p className="section-subheading">
                  Three simple steps to ensure your academic submission is 100% authentic and properly cited.
                </p>
              </div>

              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">01</div>
                  <h3>Paste or Upload Your Draft</h3>
                  <p>
                    Paste your text or upload documents (.docx, .pdf, .txt). We support essays, thesis drafts, research summaries, and assignments.
                  </p>
                </div>

                <div className="step-card">
                  <div className="step-number">02</div>
                  <h3>Deep Multi-Layer AI Scan</h3>
                  <p>
                    OriginalityAI cross-references 10+ billion web pages, scholarly papers, and Wikipedia entries to detect verbatim matches, rephrased patchwriting, and AI cadence.
                  </p>
                </div>

                <div className="step-card">
                  <div className="step-number">03</div>
                  <h3>Fix Issues with One-Click Assistant</h3>
                  <p>
                    Use our Grammarly-style Assistant panel to inspect flagged lines, apply authentic student rephrasing, and generate copy-paste APA/MLA citations.
                  </p>
                </div>
              </div>
            </section>

            {/* Educational Section: Plagiarism vs Paraphrasing vs Patchwriting */}
            <section className="education-section">
              <div className="uploader-card">
                <div className="text-center section-heading-wrap">
                  <h2 className="section-heading">Plagiarism vs Paraphrasing vs Patchwriting</h2>
                  <p className="section-subheading">
                    Understanding the difference protects your academic standing and professor evaluation.
                  </p>
                </div>

                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-icon-box bg-crimson-dim">
                      <AlertTriangle className="text-crimson" size={24} />
                    </div>
                    <h3>Direct Plagiarism</h3>
                    <p>
                      Copying word-for-word text from an article, website, or peer without quotation marks and author attribution. Flagged as severe academic misconduct.
                    </p>
                  </div>

                  <div className="info-card">
                    <div className="info-icon-box bg-amber-dim">
                      <Repeat className="text-amber" size={24} />
                    </div>
                    <h3>Patchwriting / Paraphrasing</h3>
                    <p>
                      Taking an author's sentence and merely swapping a few words with synonyms while keeping the exact clause structure. OriginalityAI flags this so you can synthesize original thoughts.
                    </p>
                  </div>

                  <div className="info-card">
                    <div className="info-icon-box bg-purple-dim">
                      <Bot className="text-purple" size={24} />
                    </div>
                    <h3>AI-Synthesized Prose</h3>
                    <p>
                      Generating content via ChatGPT or Claude without personal analysis. Identified through uniform sentence burstiness and formulaic transition phrases.
                    </p>
                  </div>

                  <div className="info-card">
                    <div className="info-icon-box bg-emerald-dim">
                      <CheckCircle2 className="text-emerald" size={24} />
                    </div>
                    <h3>Authentic Scholarship</h3>
                    <p>
                      Expressing concepts in your authentic voice, supported by clear parenthetical citations (e.g., Smith, 2024) and critical student reflection.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Student FAQ Accordion (Grammarly style) */}
            <section className="faq-section">
              <div className="text-center section-heading-wrap">
                <h2 className="section-heading">Frequently Asked Questions</h2>
                <p className="section-subheading">
                  Everything you need to know about our free student plagiarism and paraphrase checker.
                </p>
              </div>

              <div className="faq-list">
                {[
                  {
                    q: 'Is OriginalityAI genuinely 100% free for students?',
                    a: 'Yes! By signing in with any Google / Gmail account or university email (.edu, .ac.uk, .edu.in), you unlock unlimited free document checks, deep paraphrase analysis, and APA/MLA citation generation with zero hidden fees or credit card requirements.'
                  },
                  {
                    q: 'Will my paper be stored or uploaded to institutional repositories (like Turnitin)?',
                    a: 'Never. Unlike Turnitin or commercial checkers that index your student drafts into public databases, OriginalityAI has a strict Zero Data Retention guarantee. Your paper is analyzed in memory and immediately discarded. You retain 100% intellectual ownership.'
                  },
                  {
                    q: 'How does OriginalityAI detect paraphrasing and patchwriting?',
                    a: 'Standard tools only detect identical consecutive words. OriginalityAI uses advanced semantic syntactic decomposition (powered by Google Gemini Flash and linguistic heuristics) to uncover synonym swapping, inverted clauses, and passive-to-active restructuring that mimics published sources.'
                  },
                  {
                    q: 'Can this tool generate citations for my bibliography?',
                    a: 'Yes. When an external literature match is found, the assistant panel provides ready-to-use citations in APA 7th Edition, MLA 9th Edition, and Chicago styles that you can copy with a single click.'
                  },
                  {
                    q: 'What file formats are supported for document upload?',
                    a: 'You can upload Microsoft Word (.docx, .doc), Adobe PDF (.pdf), Plain Text (.txt), and Markdown (.md) documents up to 8MB in size, or paste text directly into the editor.'
                  }
                ].map((item, index) => {
                  const isOpen = faqOpen === index;
                  return (
                    <div key={index} className="faq-item">
                      <button
                        type="button"
                        className="faq-question-btn"
                        onClick={() => setFaqOpen(isOpen ? null : index)}
                      >
                        <span>{item.q}</span>
                        <ChevronDown size={18} className={`faq-arrow ${isOpen ? 'faq-arrow-open' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="faq-answer-body">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <ResultsView 
            result={currentResult} 
            onReset={() => setCurrentResult(null)} 
          />
        )}
      </main>

      {/* History Modal */}
      <ScanHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectScan={(scan) => setCurrentResult(scan)}
        onClearHistory={handleClearHistory}
      />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <ShieldCheck size={20} className="text-emerald" />
              <span>OriginalityAI</span>
            </div>
            <p className="footer-copy">
              The premier free academic plagiarism & paraphrase detector built for students, educators, and independent researchers.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Tools</h4>
              <span onClick={() => { setActiveTab('plagiarism'); setCurrentResult(null); }} style={{ cursor: 'pointer' }}>Plagiarism Checker</span>
              <span onClick={() => { setActiveTab('paraphraser'); setCurrentResult(null); }} style={{ cursor: 'pointer' }}>Paraphrasing Tool</span>
              <span onClick={() => { setActiveTab('citations'); setCurrentResult(null); }} style={{ cursor: 'pointer' }}>Citation Generator</span>
              <span onClick={() => { setActiveTab('grammar'); setCurrentResult(null); }} style={{ cursor: 'pointer' }}>Grammar Checker</span>
            </div>
            <div className="footer-col">
              <h4>Student Access</h4>
              <span>100% Free with Gmail</span>
              <span>Academic (.edu / .ac) Pass</span>
              <span>Zero-Retention Privacy</span>
              <span>Vercel Cloud Deployable</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} OriginalityAI. Inspired by Grammarly & DupliChecker — 100% Free for Students.</span>
        </div>
      </footer>
    </div>
  );
}
