/**
 * ProgressBar
 * Displays current status label and a gradient progress bar.
 */
const ProgressBar = ({ status, percent }) => {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="progress-wrapper" aria-live="polite">
      <div className="progress-label">
        {status ? `Status: ${status}` : 'Status: idle'}
      </div>
      <div className="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct}>
        <div className="progress-inner" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
