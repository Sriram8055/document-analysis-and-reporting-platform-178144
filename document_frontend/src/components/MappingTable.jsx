/**
 * MappingTable displays extracted entities mapped to template fields.
 */
import React from 'react';

// PUBLIC_INTERFACE
export default function MappingTable({ mappings = [] }) {
  /** Shows a table with fields and mapped values. */
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="section-title">Mapping</div>
      {(!mappings || mappings.length === 0) ? (
        <p className="muted" style={{ marginTop: 8 }}>No mappings available yet. Start the process to generate mappings.</p>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="table" role="table" aria-label="Mapping table">
            <thead>
              <tr>
                <th>Template Field</th>
                <th>Detected Value</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m, i) => (
                <tr key={i}>
                  <td>{m.field || '-'}</td>
                  <td>{m.value || '-'}</td>
                  <td>{typeof m.confidence === 'number' ? `${Math.round(m.confidence * 100)}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
