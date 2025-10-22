/**
 * API client for backend integration.
 * Reads REACT_APP_BACKEND_URL from environment and exposes job-related methods.
 * Includes graceful fallbacks if backend is unavailable (mock-safe guards).
 */

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns the API base URL from environment. */
  const base = process.env.REACT_APP_BACKEND_URL || '';
  return base.replace(/\/+$/, '');
}

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    console.warn('API call failed (mock-safe):', url, err.message);
    throw err;
  }
}

// PUBLIC_INTERFACE
export async function createJob() {
  /** Creates a processing job. Returns { jobId }. */
  const base = getApiBase();
  if (!base) {
    return { jobId: `mock-${Date.now()}` };
  }
  const res = await safeFetch(`${base}/jobs`, { method: 'POST' });
  const data = await res.json();
  return { jobId: data.id || data.jobId };
}

// PUBLIC_INTERFACE
export async function uploadFiles(jobId, files) {
  /** Uploads multiple input files for the job. */
  const base = getApiBase();
  if (!base) return { ok: true, uploaded: files.length };
  const form = new FormData();
  files.forEach((f) => form.append('files', f, f.name));
  const res = await safeFetch(`${base}/jobs/${encodeURIComponent(jobId)}/files`, {
    method: 'POST',
    body: form
  });
  return res.json().catch(() => ({ ok: true }));
}

// PUBLIC_INTERFACE
export async function uploadTemplate(jobId, file) {
  /** Uploads a single Excel template file for mapping. */
  const base = getApiBase();
  if (!base) return { ok: true };
  const form = new FormData();
  form.append('template', file, file.name);
  const res = await safeFetch(`${base}/jobs/${encodeURIComponent(jobId)}/template`, {
    method: 'POST',
    body: form
  });
  return res.json().catch(() => ({ ok: true }));
}

// PUBLIC_INTERFACE
export async function startProcess(jobId) {
  /** Starts the processing workflow for the job. */
  const base = getApiBase();
  if (!base) return { started: true };
  const res = await safeFetch(`${base}/jobs/${encodeURIComponent(jobId)}/start`, {
    method: 'POST'
  });
  return res.json().catch(() => ({ started: true }));
}

// PUBLIC_INTERFACE
export async function getStatus(jobId) {
  /** Retrieves processing status including phase and progress percent. */
  const base = getApiBase();
  if (!base) {
    // Mock a progressing status
    return {
      status: 'processing',
      phase: 'Uploading',
      progress: 10,
      issues: [],
    };
  }
  const res = await safeFetch(`${base}/jobs/${encodeURIComponent(jobId)}/status`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function getResults(jobId) {
  /** Fetches entities, mappings, and validation issues. */
  const base = getApiBase();
  if (!base) {
    return {
      entities: [],
      mappings: [],
      validation: [],
    };
  }
  const res = await safeFetch(`${base}/jobs/${encodeURIComponent(jobId)}/results`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function downloadReport(jobId) {
  /** Downloads the final Excel report as a blob. */
  const base = getApiBase();
  if (!base) throw new Error('Backend URL not configured');
  const res = await safeFetch(`${base}/jobs/${encodeURIComponent(jobId)}/report`, {
    method: 'GET'
  });
  const blob = await res.blob();
  return blob;
}
