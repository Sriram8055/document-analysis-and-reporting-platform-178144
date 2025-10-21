/**
 * Lightweight API client for the backend.
 * Defaults baseURL to process.env.REACT_APP_API_BASE or 'http://localhost:3001'.
 * Handles JSON and file downloads.
 */

const BASE_URL = (process && process.env && process.env.REACT_APP_API_BASE) || 'http://localhost:3001';

async function handleResponse(res) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let message = `Request failed with status ${res.status}`;
    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        message = data?.message || data?.detail || message;
      } catch (_e) { /* ignore */ }
    } else {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch (_e) { /* ignore */ }
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res;
}

// PUBLIC_INTERFACE
export async function upload(files, excelTemplate) {
  /** Upload multiple document files and an Excel template */
  const form = new FormData();
  (files || []).forEach((f) => form.append('files', f));
  if (excelTemplate) form.append('excel_template', excelTemplate);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: form,
  }).then(handleResponse);

  return res.json(); // expected { task_id, status }
}

// PUBLIC_INTERFACE
export async function getStatus(taskId) {
  /** Get processing status for a task */
  const res = await fetch(`${BASE_URL}/status/${encodeURIComponent(taskId)}`, {
    method: 'GET',
  }).then(handleResponse);
  return res.json(); // expected { status, percent, issues? }
}

// PUBLIC_INTERFACE
export async function getEntities(taskId) {
  /** Fetch extracted/mapped entities for a task */
  const res = await fetch(`${BASE_URL}/entities/${encodeURIComponent(taskId)}`, {
    method: 'GET',
  }).then(handleResponse);
  return res.json(); // expected { columns: [...], entities: [...], issues? }
}

// PUBLIC_INTERFACE
export async function postMapping(taskId, mapping) {
  /** Post mapping overrides/edits for specific rows/columns */
  const res = await fetch(`${BASE_URL}/map/${encodeURIComponent(taskId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mapping }),
  }).then(handleResponse);
  return res.json(); // expected confirmation and possibly updated data
}

// PUBLIC_INTERFACE
export async function downloadReport(taskId) {
  /** Download the generated Excel report as a Blob */
  const res = await fetch(`${BASE_URL}/report/${encodeURIComponent(taskId)}`, {
    method: 'GET',
  }).then(handleResponse);
  const blob = await res.blob();
  return blob;
}

export default {
  upload,
  getStatus,
  getEntities,
  postMapping,
  downloadReport,
  BASE_URL,
};
