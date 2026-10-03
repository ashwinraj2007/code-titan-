'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  RotateCcw, 
  AlertTriangle, 
  Globe, 
  ShieldCheck,
  CheckCircle2,
  X,
  FileUp,
  Loader2
} from 'lucide-react';

interface TextUploaderProps {
  onAnalyze: (payload: {
    text: string;
    title: string;
    checkParaphrase: boolean;
    checkWebPlagiarism: boolean;
    checkAiWriting: boolean;
    checkGrammar: boolean;
    excludeUrl?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const SAMPLE_TEXTS = {
  paraphrased: `Recent advancements in artificial intelligence have brought about revolutionary transformations across multiple sectors of human activity. Specifically, machine learning architectures are utilized to automate intricate cognitive procedures. Furthermore, empirical investigations demonstrate that these automated tools streamline administrative burdens substantially. Notwithstanding these advantages, researchers emphasize that ethical dilemmas concerning algorithmic bias and data confidentiality must be thoroughly mitigated before widespread institutional deployment can be deemed responsible.`,
  plagiarized: `Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI textbooks define the field as the study of intelligent agents: any system that perceives its environment and takes actions that maximize its chance of achieving its goals. Alan Turing was the first person to conduct substantial research in the field of machine learning, proposing the famous imitation game to test machine intelligence.`,
  original: `During our laboratory experiments this semester, we tested three distinct pathfinding algorithms across twenty simulated maze environments. While Dijkstra's algorithm consistently yielded mathematically shortest routes, its computational overhead was 40% higher than the A* implementation using Manhattan distance heuristics. Our team documented that embedded microcontroller limitations often require compromising theoretical perfection in favor of execution speed.`,
};

export default function TextUploader({ onAnalyze, isLoading }: TextUploaderProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [excludeUrl, setExcludeUrl] = useState('');
  const [showExcludeUrl, setShowExcludeUrl] = useState(false);
  const [checkParaphrase, setCheckParaphrase] = useState(true);
  const [checkWebPlagiarism, setCheckWebPlagiarism] = useState(true);
  const [checkAiWriting, setCheckAiWriting] = useState(true);
  const [checkGrammar, setCheckGrammar] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = text.length;

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessNotice(null);
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds 15MB. Please upload a smaller document.');
      return;
    }

    const name = file.name;
    const lowerName = name.toLowerCase();
    setIsExtracting(true);
    setFileName(name);

    if (!title) {
      setTitle(name.replace(/\.[^/.]+$/, ''));
    }

    try {
      // 1. Fast local read for plain text & markdown
      if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
        const textContent = await file.text();
        if (textContent.trim()) {
          setText(textContent.trim());
          setSuccessNotice(`Successfully loaded ${name} (${textContent.trim().split(/\s+/).length} words)`);
          setIsExtracting(false);
          return;
        }
      }

      // 2. Server-side text extractor for .docx, .pdf, and other formats
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract text from document.');
      }

      setText(data.text);
      setSuccessNotice(`Successfully extracted ${data.wordCount} words from ${name}`);
    } catch (err: any) {
      console.error('File extraction error:', err);
      setErrorMsg(err.message || 'Could not parse document. You can also copy and paste the text directly into the box.');
    } finally {
      setIsExtracting(false);
      // Reset input value so the same file can be chosen again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (type: 'paraphrased' | 'plagiarized' | 'original') => {
    setText(SAMPLE_TEXTS[type]);
    const titles = {
      paraphrased: 'AI Ethics Literature Review (Paraphrased & Patchwritten)',
      plagiarized: 'Artificial Intelligence History (Direct Verbatim Plagiarism)',
      original: 'Robotics Lab Report (Authentic Student Original)',
    };
    setTitle(titles[type]);
    setFileName(null);
    setErrorMsg(null);
    setSuccessNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!text.trim()) {
      setErrorMsg('Please paste or upload text to check.');
      return;
    }

    if (text.trim().length < 20) {
      setErrorMsg('Please enter at least 20 characters for deep academic analysis.');
      return;
    }

    await onAnalyze({
      text,
      title: title.trim() || 'Student Academic Document',
      checkParaphrase,
      checkWebPlagiarism,
      checkAiWriting,
      checkGrammar,
      excludeUrl: excludeUrl.trim() || undefined,
    });
  };

  const handleReset = () => {
    setText('');
    setTitle('');
    setExcludeUrl('');
    setFileName(null);
    setErrorMsg(null);
    setSuccessNotice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="uploader-card">
      {/* Top Banner (Grammarly style) */}
      <div className="uploader-top-banner">
        <div className="banner-left">
          <ShieldCheck size={18} className="text-emerald" />
          <span><strong>Free Student Scanner:</strong> Cross-checks 10+ billion web pages, JSTOR, ProQuest & Wikipedia entries.</span>
        </div>
        <div className="banner-right">
          <span className="free-limit-pill">Free Tier: 2,500 words/scan (Unlimited Daily Scans)</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="uploader-form">
        {/* Document Header Controls */}
        <div className="uploader-header">
          <div className="input-group-title">
            <input
              type="text"
              className="text-input-field"
              placeholder="Paper or Assignment Title (e.g. Psychology Research Draft)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading || isExtracting}
            />
          </div>

          <div className="sample-buttons">
            <span className="sample-label">Try sample:</span>
            <button
              type="button"
              className="btn-sample btn-sample-paraphrase"
              onClick={() => loadSample('paraphrased')}
              disabled={isLoading || isExtracting}
            >
              Paraphrased
            </button>
            <button
              type="button"
              className="btn-sample btn-sample-plagiarized"
              onClick={() => loadSample('plagiarized')}
              disabled={isLoading || isExtracting}
            >
              Direct Plagiarism
            </button>
            <button
              type="button"
              className="btn-sample btn-sample-original"
              onClick={() => loadSample('original')}
              disabled={isLoading || isExtracting}
            >
              100% Original
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.rtf,.doc,.docx,.pdf"
          className="hidden-file-input"
          onChange={handleFileChange}
          disabled={isLoading || isExtracting}
          onClick={(e) => {
            // Prevent event bubbling if triggered by container
            e.stopPropagation();
          }}
        />

        {/* Dropzone & Upload Button Bar */}
        <div
          className={`dropzone ${dragActive ? 'dropzone-active' : ''} ${isExtracting ? 'dropzone-loading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!isExtracting && !isLoading) {
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="dropzone-content">
            {isExtracting ? (
              <div className="dropzone-loading-inner">
                <Loader2 className="spinner-icon text-emerald" size={24} />
                <span>Reading & extracting text from <strong>{fileName}</strong>...</span>
              </div>
            ) : fileName ? (
              <div className="file-loaded-row">
                <span className="file-loaded">
                  <FileText size={18} />
                  <span>Loaded file: <strong>{fileName}</strong></span>
                </span>
                <button
                  type="button"
                  className="btn-remove-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileName(null);
                    setSuccessNotice(null);
                  }}
                  title="Clear file tag"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="dropzone-default-row">
                <UploadCloud className="dropzone-icon" size={24} />
                <div className="dropzone-text">
                  <span className="dropzone-lead">
                    Drag and drop your file here, or{' '}
                    <button
                      type="button"
                      className="btn-inline-browse"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      browse your computer
                    </button>
                  </span>
                  <span className="dropzone-sub">
                    Supports <strong>PDF (.pdf)</strong>, <strong>Word (.docx, .doc)</strong>, <strong>Text (.txt)</strong>, & <strong>Markdown (.md)</strong> up to 15MB
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Notice if file parsed */}
        {successNotice && (
          <div className="file-success-banner">
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Main Textarea */}
        <div className="textarea-wrapper">
          <textarea
            className="main-textarea"
            placeholder="Paste your essay, thesis paragraph, or assignment here to check for plagiarism, paraphrasing, and AI patterns..."
            rows={11}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading || isExtracting}
          />

          <div className="textarea-footer">
            <div className="counter-stats">
              <span className="stat-item">
                <strong>{wordCount}</strong> / 2,500 words
              </span>
              <span className="stat-separator">•</span>
              <span className="stat-item"><strong>{charCount}</strong> characters</span>
              <span className="stat-separator">•</span>
              <span className="stat-item">~<strong>{Math.max(1, Math.ceil(wordCount / 200))}</strong> min read</span>
            </div>

            <div className="textarea-right-actions">
              <button
                type="button"
                className="btn-link-action"
                onClick={() => setShowExcludeUrl(!showExcludeUrl)}
              >
                <Globe size={13} />
                <span>{showExcludeUrl ? 'Hide Exclude URL' : 'Exclude URL'}</span>
              </button>

              {text && (
                <button
                  type="button"
                  className="btn-clear"
                  onClick={handleReset}
                  disabled={isLoading || isExtracting}
                  title="Clear text"
                >
                  <RotateCcw size={13} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* DupliChecker-style Exclude URL field */}
        {showExcludeUrl && (
          <div className="exclude-url-box">
            <label htmlFor="exclude-url-input" className="exclude-url-label">
              <Globe size={14} /> Exclude URL from matching (e.g., your own published blog, preprint, or university site):
            </label>
            <input
              id="exclude-url-input"
              type="url"
              className="text-input-field"
              placeholder="https://myuniversity.edu/student-paper-draft"
              value={excludeUrl}
              onChange={(e) => setExcludeUrl(e.target.value)}
              disabled={isLoading || isExtracting}
            />
          </div>
        )}

        {/* Capabilities Checkboxes */}
        <div className="options-panel">
          <div className="options-grid">
            <label className="checkbox-card">
              <input
                type="checkbox"
                checked={checkParaphrase}
                onChange={(e) => setCheckParaphrase(e.target.checked)}
                disabled={isLoading || isExtracting}
              />
              <div className="checkbox-info">
                <span className="checkbox-title">Paraphrase & Patchwriting</span>
                <span className="checkbox-desc">Identifies synonym swaps & clause restructuring</span>
              </div>
            </label>

            <label className="checkbox-card">
              <input
                type="checkbox"
                checked={checkWebPlagiarism}
                onChange={(e) => setCheckWebPlagiarism(e.target.checked)}
                disabled={isLoading || isExtracting}
              />
              <div className="checkbox-info">
                <span className="checkbox-title">Web & Academic Database Search</span>
                <span className="checkbox-desc">Scans billions of open educational pages & articles</span>
              </div>
            </label>

            <label className="checkbox-card">
              <input
                type="checkbox"
                checked={checkAiWriting}
                onChange={(e) => setCheckAiWriting(e.target.checked)}
                disabled={isLoading || isExtracting}
              />
              <div className="checkbox-info">
                <span className="checkbox-title">AI Writing Cadence (ChatGPT/Claude)</span>
                <span className="checkbox-desc">Measures burstiness & perplexity markers</span>
              </div>
            </label>

            <label className="checkbox-card">
              <input
                type="checkbox"
                checked={checkGrammar}
                onChange={(e) => setCheckGrammar(e.target.checked)}
                disabled={isLoading || isExtracting}
              />
              <div className="checkbox-info">
                <span className="checkbox-title">Grammar & Tone Clarity</span>
                <span className="checkbox-desc">Flags passive voice & stylistic improvements</span>
              </div>
            </label>
          </div>
        </div>

        {errorMsg && (
          <div className="error-banner">
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Actions (Grammarly Green + DupliChecker layout) */}
        <div className="uploader-action-bar">
          <button
            type="submit"
            className="btn-check-plagiarism-main"
            disabled={isLoading || isExtracting || wordCount === 0}
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                <span>Scanning Billions of Sources & Paraphrase Patterns...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Check for Plagiarism & Paraphrasing — 100% Free</span>
              </>
            )}
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="uploader-trust-bar">
          <span><CheckCircle2 size={14} className="text-emerald" /> No papers saved to public repositories</span>
          <span><CheckCircle2 size={14} className="text-emerald" /> Instant sentence-by-sentence analysis</span>
          <span><CheckCircle2 size={14} className="text-emerald" /> One-click APA/MLA citations</span>
        </div>
      </form>
    </div>
  );
}
