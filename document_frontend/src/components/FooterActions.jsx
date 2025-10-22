/**
 * FooterActions renders the bottom action bar with primary workflow buttons.
 */
import React from 'react';

// PUBLIC_INTERFACE
export default function FooterActions({
  disabled,
  onStart,
  onRefresh,
  onDownload,
  isProcessing
}) {
  /** Footer actions bar. */
  return (
    <div className="footer">
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn ghost" onClick={onRefresh} disabled={disabled}>
          Refresh Status
        </button>
        <button className="btn" onClick={onStart} disabled={disabled || isProcessing}>
          {isProcessing ? 'Processing…' : 'Start Process'}
        </button>
        <button className="btn secondary" onClick={onDownload} disabled={disabled}>
          Download Report
        </button>
      </div>
    </div>
  );
}
