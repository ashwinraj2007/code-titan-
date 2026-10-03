'use client';

import React, { useState } from 'react';
import { 
  DetectionResult, 
  TextSegment, 
  MatchType 
} from '@/types/detector';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Printer, 
  ArrowLeft, 
  Copy, 
  Sparkles, 
  Info,
  BookOpen,
  Repeat,
  Check,
  FileText,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

interface ResultsViewProps {
  result: DetectionResult;
  onReset: () => void;
}

export default function ResultsView({ result, onReset }: ResultsViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'flagged' | MatchType>('all');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    result.segments.find(s => s.status !== 'original')?.id || result.segments[0]?.id || ''
  );
  const [citationFormat, setCitationFormat] = useState<'apa' | 'mla' | 'chicago'>('apa');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [appliedSegments, setAppliedSegments] = useState<Record<string, string>>({});

  const filteredSegments = result.segments.filter((seg) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'flagged') return seg.status !== 'original';
    return seg.status === activeFilter;
  });

  const selectedSegment = result.segments.find(s => s.id === selectedSegmentId) || result.segments[0];

  const flaggedCount = result.segments.filter(s => s.status !== 'original').length;
  const paraphraseCount = result.segments.filter(s => s.status === 'paraphrased').length;
  const plagiarismCount = result.segments.filter(s => s.status === 'plagiarized').length;
  const aiCount = result.segments.filter(s => s.status === 'ai_generated').length;

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleCopySummary = () => {
    const textToCopy = `OriginalityAI Academic Integrity Report: ${result.documentTitle}
Originality Score: ${result.originalityScore}%
Plagiarism: ${result.plagiarismScore}% | Paraphrased: ${result.paraphraseScore}% | AI Likelihood: ${result.aiLikelihood}%
Grammar Clarity: ${result.grammarScore}%
Verdict: ${result.verdict}
Summary: ${result.summary}
Sources Matched: ${result.sources?.map(s => `${s.title} (${s.similarity}%)`).join(', ')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleApplySuggestion = (segId: string, alternative: string) => {
    setAppliedSegments(prev => ({ ...prev, [segId]: alternative }));
  };

  const getStatusBadge = (status: MatchType) => {
    switch (status) {
      case 'original':
        return <span className="badge-status badge-original"><CheckCircle2 size={13} /> Original</span>;
      case 'paraphrased':
        return <span className="badge-status badge-paraphrased"><Repeat size={13} /> Paraphrased</span>;
      case 'plagiarized':
        return <span className="badge-status badge-plagiarized"><AlertTriangle size={13} /> Direct Plagiarism</span>;
      case 'ai_generated':
        return <span className="badge-status badge-ai"><Sparkles size={13} /> AI Cadence</span>;
    }
  };

  return (
    <div className="results-container">
      {/* Top Header Bar */}
      <div className="results-header no-print">
        <button type="button" className="btn-back" onClick={onReset}>
          <ArrowLeft size={16} />
          <span>New Document Check</span>
        </button>

        <div className="results-meta-pill">
          <span>{result.documentTitle}</span>
          <span className="dot-sep">•</span>
          <span>{result.wordCount} words</span>
          <span className="dot-sep">•</span>
          <span className="text-emerald">{result.verdict}</span>
        </div>

        <div className="results-actions">
          <button 
            type="button" 
            className="btn-action-secondary" 
            onClick={handleCopySummary}
          >
            <Copy size={15} />
            <span>{copiedSummary ? 'Copied Report!' : 'Copy Summary'}</span>
          </button>
          <button 
            type="button" 
            className="btn-action-secondary" 
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* DupliChecker-style Score Dials */}
      <div className="scores-dashboard-card">
        <div className="scores-dashboard-header">
          <div>
            <h2 className="scores-dashboard-title">Academic Integrity & Originality Report</h2>
            <p className="scores-dashboard-sub">
              Scanned against indexed academic databases, research repositories, and web articles.
            </p>
          </div>
          <span className="free-student-stamp">
            <ShieldCheck size={16} /> Free Student Verification
          </span>
        </div>

        <div className="gauges-grid">
          <div className="gauge-item gauge-unique">
            <div className="gauge-circle ring-emerald">
              <span className="gauge-value">{result.originalityScore}%</span>
            </div>
            <span className="gauge-label">Unique / Original</span>
            <span className="gauge-sub">Authentic student writing</span>
          </div>

          <div className="gauge-item gauge-plagiarized">
            <div className="gauge-circle ring-crimson">
              <span className="gauge-value">{result.plagiarismScore}%</span>
            </div>
            <span className="gauge-label">Direct Plagiarism</span>
            <span className="gauge-sub">{plagiarismCount} verbatim match(es)</span>
          </div>

          <div className="gauge-item gauge-paraphrased">
            <div className="gauge-circle ring-amber">
              <span className="gauge-value">{result.paraphraseScore}%</span>
            </div>
            <span className="gauge-label">Paraphrased Content</span>
            <span className="gauge-sub">{paraphraseCount} patchwritten phrase(s)</span>
          </div>

          <div className="gauge-item gauge-ai">
            <div className="gauge-circle ring-violet">
              <span className="gauge-value">{result.aiLikelihood}%</span>
            </div>
            <span className="gauge-label">AI Writing Likelihood</span>
            <span className="gauge-sub">{aiCount} synthetic sentence(s)</span>
          </div>

          <div className="gauge-item gauge-grammar">
            <div className="gauge-circle ring-cyan">
              <span className="gauge-value">{result.grammarScore}%</span>
            </div>
            <span className="gauge-label">Grammar & Clarity</span>
            <span className="gauge-sub">Academic style score</span>
          </div>
        </div>

        {/* Summary notification box */}
        <div className="summary-alert-banner">
          <Info size={18} className="text-emerald" />
          <p>{result.summary}</p>
        </div>
      </div>

      {/* Grammarly-style Split-Pane Workstation */}
      <div className="split-workspace-section">
        {/* Left Pane: Interactive Document Canvas */}
        <div className="document-canvas-card">
          <div className="canvas-header">
            <div className="canvas-title-wrap">
              <FileText size={18} />
              <h3>Document Canvas</h3>
            </div>

            {/* Filter Tabs */}
            <div className="canvas-filters no-print">
              <button
                type="button"
                className={`filter-pill ${activeFilter === 'all' ? 'filter-pill-active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Sentences ({result.segments.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${activeFilter === 'flagged' ? 'filter-pill-active' : ''}`}
                onClick={() => setActiveFilter('flagged')}
              >
                All Issues ({flaggedCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${activeFilter === 'paraphrased' ? 'filter-pill-active' : ''}`}
                onClick={() => setActiveFilter('paraphrased')}
              >
                Paraphrased ({paraphraseCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${activeFilter === 'plagiarized' ? 'filter-pill-active' : ''}`}
                onClick={() => setActiveFilter('plagiarized')}
              >
                Plagiarized ({plagiarismCount})
              </button>
            </div>
          </div>

          <div className="canvas-body">
            <p className="canvas-instruction-sub">
              💡 <em>Click any highlighted sentence below to view matched sources, citations, and instant rephrasing in the Assistant.</em>
            </p>

            <div className="canvas-text-flow">
              {filteredSegments.map((segment) => {
                const isSelected = selectedSegmentId === segment.id;
                const displayText = appliedSegments[segment.id] || segment.text;
                const wasModified = !!appliedSegments[segment.id];

                return (
                  <span
                    key={segment.id}
                    onClick={() => setSelectedSegmentId(segment.id)}
                    className={`sentence-highlight highlight-${segment.status} ${isSelected ? 'highlight-active' : ''} ${wasModified ? 'highlight-resolved' : ''}`}
                    title={`Click to inspect (${segment.status})`}
                  >
                    {displayText}{' '}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pane: Grammarly Writing Assistant & Citation Builder */}
        <div className="assistant-sidebar-card">
          <div className="assistant-header">
            <div className="assistant-brand-badge">
              <Sparkles size={16} />
              <span>OriginalityAI Assistant</span>
            </div>
            <span className="issues-badge">{flaggedCount} issues detected</span>
          </div>

          {selectedSegment ? (
            <div className="assistant-content">
              {/* Status Header */}
              <div className="assistant-issue-badge-row">
                {getStatusBadge(selectedSegment.status)}
                <span className="confidence-pill">{selectedSegment.confidence}% Match Confidence</span>
              </div>

              {/* Inspected sentence preview */}
              <div className="inspected-quote">
                "{appliedSegments[selectedSegment.id] || selectedSegment.text}"
              </div>

              {/* Linguistic Explanation */}
              <div className="assistant-card-box">
                <div className="card-box-header">
                  <Info size={15} className="text-emerald" />
                  <h4>Why This Was Flagged</h4>
                </div>
                <p className="card-box-text">{selectedSegment.explanation}</p>
                {selectedSegment.grammarNote && (
                  <div className="grammar-tip">
                    <CheckCheck size={14} className="text-cyan" />
                    <span><strong>Grammar / Style:</strong> {selectedSegment.grammarNote}</span>
                  </div>
                )}
              </div>

              {/* Matched Source & Compare */}
              {selectedSegment.matchedSource && (
                <div className="assistant-card-box">
                  <div className="card-box-header">
                    <BookOpen size={15} className="text-amber" />
                    <h4>Matched Source Literature</h4>
                  </div>
                  <div className="source-row-top">
                    <span className="source-title-text">{selectedSegment.matchedSource.title}</span>
                    <span className="source-similarity-tag">{selectedSegment.matchedSource.similarity}% similarity</span>
                  </div>
                  {selectedSegment.matchedSource.url && (
                    <a
                      href={selectedSegment.matchedSource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-external-link"
                    >
                      <span>Visit Source URL ({selectedSegment.matchedSource.domain})</span>
                      <ExternalLink size={13} />
                    </a>
                  )}

                  {/* Instant Citation Generator (Grammarly style!) */}
                  {selectedSegment.matchedSource.citations && (
                    <div className="citation-widget">
                      <div className="citation-widget-top">
                        <span className="citation-widget-label">Quick Citation Generator:</span>
                        <div className="citation-tabs">
                          {(['apa', 'mla', 'chicago'] as const).map((fmt) => (
                            <button
                              key={fmt}
                              type="button"
                              className={`cit-btn ${citationFormat === fmt ? 'cit-btn-active' : ''}`}
                              onClick={() => setCitationFormat(fmt)}
                            >
                              {fmt.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="citation-output-box">
                        <code>{selectedSegment.matchedSource.citations[citationFormat]}</code>
                        <button
                          type="button"
                          className="btn-copy-citation"
                          onClick={() => handleCopyCitation(selectedSegment.matchedSource!.citations![citationFormat])}
                          title="Copy Citation"
                        >
                          {copiedCitation ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedCitation ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* "Make it Unique" / Paraphrase Suggestion Tool */}
              {selectedSegment.rephrasedAlternative && (
                <div className="assistant-card-box suggestion-box">
                  <div className="card-box-header">
                    <Repeat size={15} className="text-emerald" />
                    <h4>One-Click Paraphrase Fix (Make It Unique)</h4>
                  </div>
                  <p className="suggestion-text-box">
                    "{selectedSegment.rephrasedAlternative}"
                  </p>
                  <button
                    type="button"
                    className="btn-apply-suggestion"
                    onClick={() => handleApplySuggestion(selectedSegment.id, selectedSegment.rephrasedAlternative!)}
                  >
                    <CheckCheck size={15} />
                    <span>Apply Suggestion into Document</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="assistant-empty">
              <CheckCircle2 size={36} className="text-emerald" />
              <h4>No Issue Selected</h4>
              <p>Click any highlighted sentence on the left to see recommendations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Matched Sources Cross-Reference Table */}
      {result.sources && result.sources.length > 0 && (
        <div className="sources-table-card">
          <div className="sources-table-header">
            <h3>Sources & Cross-References ({result.sources.length})</h3>
            <span className="sources-sub-text">Scanned against academic papers, web archives & publications</span>
          </div>

          <div className="sources-table-wrapper">
            <table className="sources-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Source Title</th>
                  <th>Domain</th>
                  <th>Similarity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {result.sources.map((src, idx) => (
                  <tr key={idx}>
                    <td>#{idx + 1}</td>
                    <td className="source-title-cell">
                      <strong>{src.title}</strong>
                      {src.author && <span className="source-author">by {src.author} ({src.year})</span>}
                    </td>
                    <td><span className="source-domain-pill">{src.domain}</span></td>
                    <td>
                      <span className={`sim-pill ${src.similarity >= 80 ? 'sim-high' : 'sim-mid'}`}>
                        {src.similarity}%
                      </span>
                    </td>
                    <td>
                      {src.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-source-view"
                        >
                          <span>Compare Source</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-dim">Academic Archive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
