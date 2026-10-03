'use client';

import React from 'react';
import { DetectionResult } from '@/types/detector';
import { Clock, Trash2, ArrowUpRight, ShieldCheck, X } from 'lucide-react';

interface ScanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DetectionResult[];
  onSelectScan: (scan: DetectionResult) => void;
  onClearHistory: () => void;
}

export default function ScanHistoryModal({
  isOpen,
  onClose,
  history,
  onSelectScan,
  onClearHistory,
}: ScanHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Clock size={20} className="modal-icon" />
            <h3>Recent Scan History</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {history.length === 0 ? (
            <div className="modal-empty-state">
              <ShieldCheck size={40} className="empty-icon" />
              <p>No scans performed yet.</p>
              <span>Any texts you analyze will appear here for easy comparison.</span>
            </div>
          ) : (
            <div className="history-list">
              {history.map((scan) => (
                <div 
                  key={scan.id} 
                  className="history-item"
                  onClick={() => {
                    onSelectScan(scan);
                    onClose();
                  }}
                >
                  <div className="history-info">
                    <h4 className="history-title">{scan.documentTitle}</h4>
                    <div className="history-meta">
                      <span>{new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{scan.wordCount} words</span>
                    </div>
                  </div>

                  <div className="history-scores">
                    <span className={`score-badge ${scan.originalityScore >= 80 ? 'badge-good' : scan.originalityScore >= 60 ? 'badge-mid' : 'badge-bad'}`}>
                      {scan.originalityScore}% Original
                    </span>
                    <ArrowUpRight size={16} className="history-arrow" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-clear-history"
              onClick={onClearHistory}
            >
              <Trash2 size={15} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
