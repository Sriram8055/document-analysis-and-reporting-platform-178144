/**
 * ValidationPanel lists validation issues in a table.
 */
import React from 'react';

// PUBLIC_INTERFACE
export default function ValidationPanel({ issues = [] }) {
  /** Displays validation issues with severity and message. */
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="section-title">Validation</div>
      {(!issues || issues.length === 0) ? (
        <p className="muted" style={{ marginTop: 8 }}>No validation issues detected.</p>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="table" role="table" aria-label="Validation issues">
            <thead>
              <tr>
                <th>Field</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.field || '-'}</td>
                  <td>{it.message || '-'}</td>
                  <td>
                    <span className={`badge ${it.severity || 'info'}`} style={{
                      padding: '4px 8px', borderRadius: 999, border: '1px solid var(--border)'
                    }}>
                      {it.severity || 'info'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
