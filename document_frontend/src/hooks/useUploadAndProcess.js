import { useCallback, useEffect, useRef, useState } from 'react';
import {
  upload as apiUpload,
  getStatus,
  getEntities,
  postMapping,
  downloadReport,
} from '../api/client';

/**
 * useUploadAndProcess
 * Manages the full flow:
 * - upload files/template -> get taskId
 * - poll status with backoff
 * - when ready, fetch entities/columns
 * - allow inline overrides via postMapping
 * - download report
 */
const POLL_INITIAL_MS = 1200;
const POLL_MAX_MS = 8000;

function useUploadAndProcess() {
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [percent, setPercent] = useState(0);
  const [issues, setIssues] = useState([]);
  const [entities, setEntities] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isUploading, setUploading] = useState(false);
  const [isDownloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const pollRef = useRef(null);
  const backoffRef = useRef(POLL_INITIAL_MS);

  const hasTask = !!taskId;

  const clearPoll = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const schedulePoll = useCallback(() => {
    clearPoll();
    const delay = backoffRef.current;
    pollRef.current = setTimeout(async () => {
      if (!taskId) return;
      try {
        const s = await getStatus(taskId);
        const sStatus = s?.status || 'processing';
        const sPercent = Number(s?.percent ?? 0);
        setStatus(sStatus);
        setPercent(Number.isFinite(sPercent) ? sPercent : 0);
        setIssues(s?.issues || []);

        if (sStatus === 'entities_ready' || sStatus === 'completed') {
          // Load data once entities are ready
          const data = await getEntities(taskId);
          setColumns(normalizeColumns(data?.columns));
          setEntities(Array.isArray(data?.entities) ? data.entities : []);
          setIssues(data?.issues || s?.issues || []);
          clearPoll();
          return;
        }

        // Continue polling with backoff
        backoffRef.current = Math.min(POLL_MAX_MS, Math.ceil(backoffRef.current * 1.5));
        schedulePoll();
      } catch (e) {
        setError(e?.message || 'Failed to fetch status');
        // keep polling but with slower interval
        backoffRef.current = Math.min(POLL_MAX_MS, Math.ceil(backoffRef.current * 1.5));
        schedulePoll();
      }
    }, delay);
  }, [taskId]);

  useEffect(() => {
    return () => clearPoll();
  }, []);

  const onSubmitUpload = useCallback(async (files, excel) => {
    setError(null);
    setIssues([]);
    setColumns([]);
    setEntities([]);
    setPercent(0);
    setStatus('uploading');
    setUploading(true);
    backoffRef.current = POLL_INITIAL_MS;

    try {
      const res = await apiUpload(files, excel);
      const id = res?.task_id;
      if (!id) throw new Error('No task_id returned from server');
      setTaskId(id);
      setStatus(res?.status || 'processing');
      // start polling
      schedulePoll();
    } catch (e) {
      setError(e?.message || 'Upload failed');
      setStatus('error');
    } finally {
      setUploading(false);
    }
  }, [schedulePoll]);

  const onCellEdit = useCallback(async (rowIdx, colKey, value) => {
    if (!hasTask) return;
    try {
      // update local immediately for responsiveness
      setEntities((prev) => {
        const next = [...prev];
        if (next[rowIdx]) next[rowIdx] = { ...next[rowIdx], [colKey]: value };
        return next;
      });
      // propagate change to backend
      await postMapping(taskId, [{ row: rowIdx, column: colKey, value }]);
    } catch (e) {
      setError(e?.message || 'Failed to update mapping');
    }
  }, [hasTask, taskId]);

  const onDownload = useCallback(async () => {
    if (!hasTask) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await downloadReport(taskId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `document-report-${ts}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  }, [hasTask, taskId]);

  const resetTask = useCallback(() => {
    clearPoll();
    setTaskId(null);
    setStatus('idle');
    setPercent(0);
    setIssues([]);
    setEntities([]);
    setColumns([]);
    setError(null);
    setUploading(false);
    setDownloading(false);
    backoffRef.current = POLL_INITIAL_MS;
  }, []);

  return {
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
  };
}

function normalizeColumns(cols) {
  if (!Array.isArray(cols)) return [];
  // support string or object columns
  return cols.map((c) => {
    if (typeof c === 'string') return { key: c, header: titleCase(c), editable: true };
    const key = c.key || c.accessor || c.field || c.name;
    const header = c.header || c.label || titleCase(key || '');
    const editable = c.editable !== false;
    return { key, header, editable };
  }).filter((c) => !!c.key);
}

function titleCase(s) {
  return (s || '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default useUploadAndProcess;
