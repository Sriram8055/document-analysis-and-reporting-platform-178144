/**
 * Sidebar with brand and simple section buttons.
 */
import React from 'react';

function NavButton({ label, active, onClick }) {
  return (
    <button
      className={active ? 'active' : ''}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// PUBLIC_INTERFACE
export default function Sidebar({ current, onNavigate }) {
  /** Sidebar navigation with Ocean Professional styling. */
  return (
    <aside className="sidebar">
      <div className="brand" aria-label="Application">
        <span style={{
          width: 10, height: 10, borderRadius: 2,
          background: 'linear-gradient(135deg, #1E3A8A, #F59E0B)'
        }} />
        <span>Doc Insights</span>
      </div>
      <nav className="nav" aria-label="Primary">
        <NavButton label="Upload" active={current === 'upload'} onClick={() => onNavigate('upload')} />
        <NavButton label="Mapping" active={current === 'mapping'} onClick={() => onNavigate('mapping')} />
        <NavButton label="Validation" active={current === 'validation'} onClick={() => onNavigate('validation')} />
        <NavButton label="Results" active={current === 'results'} onClick={() => onNavigate('results')} />
      </nav>
    </aside>
  );
}
