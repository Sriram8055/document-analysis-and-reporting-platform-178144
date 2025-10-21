import React from 'react';
import './App.css';
import './index.css';
import Sidebar from './components/Sidebar';
import UploadPanel from './components/UploadPanel';
import ProgressBar from './components/ProgressBar';
import ResultsTable from './components/ResultsTable';
import ValidationAlerts from './components/ValidationAlerts';
import useUploadAndProcess from './hooks/useUploadAndProcess';

// PUBLIC_INTERFACE
function App() {
  /**
   * The main application composed of a left sidebar, top progress bar,
   * central content for upload and results, and footer actions.
   * It uses the useUploadAndProcess hook to orchestrate the flow.
   */
  const {
    status,
    percent,
    issues,
    entities,
    columns,
    isUploading,
    isDownloading,
    hasTask,
    onSubmitUpload,
    onCellEdit,
    onDownload,
    resetTask,
    error,
  } = useUploadAndProcess();

  return (
    <div className="app-shell">
      <Sidebar
        status={status}
        hasTask={hasTask}
        onReset={resetTask}
      />

      <main className="main-content">
        <header className="topbar">
          <div className="brand">
            <div className="brand-logo" aria-hidden="true">📄</div>
            <div className="brand-text">
              <h1>Document Analysis & Reporting</h1>
              <p className="subtitle">Upload documents, analyze with AI, map to Excel, and download a report</p>
            </div>
          </div>
          <ProgressBar status={status} percent={percent} />
        </header>

        <section className="content-section">
          <div className="card surface">
            <h2 className="section-title">1. Upload Source Documents & Excel Template</h2>
            <UploadPanel
              disabled={isUploading || hasTask}
              onSubmit={onSubmitUpload}
              isUploading={isUploading}
            />
          </div>

          <div className="grid two-col">
            <div className="card surface">
              <h2 className="section-title">2. Validation & Status</h2>
              <ValidationAlerts issues={issues} error={error} />
            </div>

            <div className="card surface">
              <h2 className="section-title">3. Mapping Results</h2>
              <ResultsTable
                loading={status !== 'entities_ready' && status !== 'completed'}
                entities={entities}
                columns={columns}
                onCellEdit={onCellEdit}
              />
            </div>
          </div>
        </section>

        <footer className="footer-actions surface">
          <div className="left-actions">
            <button className="btn btn-secondary" onClick={resetTask} disabled={!hasTask || isUploading}>
              Reset Session
            </button>
          </div>
          <div className="right-actions">
            <button
              className="btn btn-primary"
              onClick={onDownload}
              disabled={!hasTask || (status !== 'entities_ready' && status !== 'completed') || isDownloading}
              aria-busy={isDownloading}
            >
              {isDownloading ? 'Preparing Report…' : 'Download Excel Report'}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
