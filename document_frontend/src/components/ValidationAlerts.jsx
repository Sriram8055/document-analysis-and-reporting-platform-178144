import React from 'react';

/**
 * ValidationAlerts
 * Displays a list of issues (errors/warnings) and any top-level error.
 */
const ValidationAlerts = ({ issues = [], error }) => {
  const list = Array.isArray(issues) ? issues : [];
  const hasAny = list.length > 0 || !!error;

  if (!hasAny) {
    return <div className="helper">No validation issues at the moment.</div>;
  }

  return (
    <div>
      {error && (
        <div className="alert error" role="alert">
          <strong>Error:</strong> {String(error)}
        </div>
      )}
      {list.map((i, idx) => {
        const severity = (i.severity || i.level || 'warning').toLowerCase();
        const cls = severity === 'error' ? 'alert error' : severity === 'success' ? 'alert success' : 'alert warning';
        return (
          <div key={idx} className={cls} role="status">
            {i.message || i.detail || JSON.stringify(i)}
          </div>
        );
      })}
    </div>
  );
};

export default ValidationAlerts;
