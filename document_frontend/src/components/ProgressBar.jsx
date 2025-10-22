/**
 * ProgressBar that visualizes linear progress and shows current phase.
 */
import React from 'react';

// PUBLIC_INTERFACE
export default function ProgressBar({ percent = 0, phase = 'Idle' }) {
  /** Accessible progress bar with phase label. */
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8
      }}>
        <div className="section-title">Progress</div>
        <div className="muted" aria-live="polite">{phase} • {clamped}%</div>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped} aria-label={`Phase ${phase}`}>
        <div className="bar" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
