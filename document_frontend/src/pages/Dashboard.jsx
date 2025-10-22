/**
 * Dashboard page coordinating the end-to-end workflow:
 * - Create job
 * - Upload files and template
 * - Start processing
 * - Poll status and display progress
 * - Show mapping, validation, and results
 * - Download Excel report
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import UploadPanel from '../components/UploadPanel';
import MappingTable from '../components/MappingTable';
import ValidationPanel from '../components/ValidationPanel';
import FooterActions from '../components/FooterActions';
import {
  createJob, uploadFiles, uploadTemplate, startProcess, getStatus, getResults, downloadReport
} from '../api/client';

// Phases in order for progress bar mapping
const PHASES = ['Uploading', 'Extracting', 'Mapping', 'Validating', 'Reporting', 'Completed', 'Failed'];

function phaseToPercent(phase, basePercent) {
  const idx = PHASES.indexOf(phase);
  if (idx < 0) return basePercent || 0;
  const step = Math.min(idx, 5); // Completed maps to 5th, Failed also 5th
  const portion = Math.round((step / 5) * 100);
  if (phase === 'Completed') return 100;
  return Math.max(portion, basePercent || 0);
}

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Dashboard page implementing the classic layout with Ocean Professional theme. */
  const [currentTab, setCurrentTab] = useState('upload');
  const [jobId, setJobId] = useState(null);

  const [files, setFiles] = useState([]);
  const [template, setTemplate] = useState(null);

  const [phase, setPhase] = useState('Idle');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [mappings, setMappings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [entities, setEntities] = useState([]);

  // Create a job when dashboard mounts
  useEffect(() => {
    (async () => {
      const { jobId } = await createJob();
      setJobId(jobId);
    })();
  }, []);

  const canStart = useMemo(() => {
    return jobId && files.length > 0 && !!template;
  }, [jobId, files, template]);

  const doStart = useCallback(async () => {
    if (!canStart) return;
    try {
      setIsProcessing(true);
      setPhase('Uploading');
      setProgress(5);

      // Upload files
      await uploadFiles(jobId, files);
      // Upload template
      await uploadTemplate(jobId, template);

      setPhase('Extracting');
      setProgress(25);

      // Start server-side process
      await startProcess(jobId);

      // Poll status a few times or until completed/failed
      let attempts = 0;
      const maxAttempts = 30;
      const interval = 1500;

      async function poll() {
        attempts += 1;
        try {
          const st = await getStatus(jobId);
          const nextPhase = st.phase || phase;
          const nextProgress = typeof st.progress === 'number' ? st.progress : progress;
          setPhase(nextPhase);
          setProgress(phaseToPercent(nextPhase, nextProgress));
          if (nextPhase === 'Completed' || nextPhase === 'Failed' || attempts >= maxAttempts) {
            // Fetch results once finished or timeout
            try {
              const res = await getResults(jobId);
              setMappings(res.mappings || []);
              setIssues(res.validation || []);
              setEntities(res.entities || []);
              setCurrentTab('results');
            } catch {
              // ignore
            }
            setIsProcessing(false);
            return;
          }
        } catch {
          // keep trying within attempts
        }
        setTimeout(poll, interval);
      }
      setTimeout(poll, interval);
    } catch (e) {
      console.error(e);
      setPhase('Failed');
      setIsProcessing(false);
    }
  }, [canStart, files, template, jobId, progress, phase]);

  const refreshStatus = useCallback(async () => {
    if (!jobId) return;
    try {
      const st = await getStatus(jobId);
      const nextPhase = st.phase || phase;
      const nextProgress = typeof st.progress === 'number' ? st.progress : progress;
      setPhase(nextPhase);
      setProgress(phaseToPercent(nextPhase, nextProgress));
    } catch {
      // noop
    }
  }, [jobId, phase, progress]);

  const doDownload = useCallback(async () => {
    if (!jobId) return;
    try {
      const blob = await downloadReport(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${jobId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Report not available yet or backend not reachable.');
    }
  }, [jobId]);

  return (
    <div className="layout">
      <Sidebar current={currentTab} onNavigate={setCurrentTab} />
      <header className="header" role="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 800, color: 'var(--primary)' }}>Document Analysis</div>
          <div className="muted">Upload • Extract • Map • Validate • Report</div>
        </div>
      </header>

      <main className="main" role="main">
        <div style={{ display: 'grid', gap: 16 }}>
          <ProgressBar percent={progress} phase={phase} />

          {currentTab === 'upload' && (
            <UploadPanel
              selectedFiles={files}
              selectedTemplate={template}
              onFilesChange={setFiles}
              onTemplateChange={setTemplate}
            />
          )}

          {currentTab === 'mapping' && (
            <MappingTable mappings={mappings} />
          )}

          {currentTab === 'validation' && (
            <ValidationPanel issues={issues} />
          )}

          {currentTab === 'results' && (
            <div className="card" style={{ padding: 16 }}>
              <div className="section-title">Results</div>
              {entities && entities.length > 0 ? (
                <div style={{ marginTop: 8 }}>
                  <div className="muted">Extracted Entities</div>
                  <ul>
                    {entities.map((e, i) => (
                      <li key={i}>
                        {typeof e === 'string' ? e : JSON.stringify(e)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 8 }}>No entities detected yet.</p>
              )}

              <div style={{ marginTop: 16 }}>
                <MappingTable mappings={mappings} />
              </div>
              <div style={{ marginTop: 16 }}>
                <ValidationPanel issues={issues} />
              </div>
            </div>
          )}
        </div>
      </main>

      <FooterActions
        disabled={!jobId}
        onStart={doStart}
        onRefresh={refreshStatus}
        onDownload={doDownload}
        isProcessing={isProcessing}
      />
    </div>
  );
}
