import React from 'react';

/**
 * Sidebar
 * Left navigation/status panel with branding and current status
 */
const Sidebar = ({ status, hasTask, onReset }) => {
  return (
    <aside className="sidebar">
      <div className="status-pill" aria-live="polite">
        <span>●</span>
        <span>{status ? `Status: ${status}` : 'Idle'}</span>
      </div>

      <div className="title">Ocean Professional</div>
      <div className="subtitle">Document Intelligence Suite</div>

      <div className="nav-section">
        <h4>Steps</h4>
        <ul className="nav-list">
          <li className="nav-item">1. Upload</li>
          <li className="nav-item">2. Analyze</li>
          <li className="nav-item">3. Map</li>
          <li className="nav-item">4. Download</li>
        </ul>
      </div>

      <div className="nav-section">
        <h4>Session</h4>
        <button className="btn btn-secondary" onClick={onReset} disabled={!hasTask}>
          Reset
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
