import React from 'react';

/**
 * ResultsTable
 * Renders entities in tabular form with columns defined by backend.
 * Supports inline edit. onCellEdit(rowIndex, columnKey, value) is called.
 */
const ResultsTable = ({ loading, entities = [], columns = [], onCellEdit }) => {
  if (loading) {
    return <div className="helper">Results are not ready yet. Processing…</div>;
  }

  if (!entities.length || !columns.length) {
    return <div className="helper">No data to display yet.</div>;
  }

  const handleChange = (rowIdx, key, e) => {
    const value = e.target.value;
    if (onCellEdit) onCellEdit(rowIdx, key, value);
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.accessor || c}>{c.header || c.label || c.key || c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entities.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => {
                const key = c.key || c.accessor || c;
                const editable = c.editable !== false; // default editable true
                const value = row[key] ?? '';
                return (
                  <td key={key}>
                    {editable ? (
                      <input
                        className="cell-input"
                        value={value}
                        onChange={(e) => handleChange(i, key, e)}
                      />
                    ) : (
                      <span>{String(value)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
