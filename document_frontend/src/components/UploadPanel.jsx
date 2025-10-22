/**
 * UploadPanel supports selecting multiple input files and a single Excel template.
 * Performs basic client-side validation and exposes selected files up to parent.
 */
import React, { useRef } from 'react';

const ACCEPTED_INPUTS = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'
];
const ACCEPTED_TEMPLATE = ['.xls', '.xlsx'];

function validateFiles(files, allowedExts) {
  const invalid = [];
  const valid = [];
  for (const f of files) {
    const ext = ('.' + f.name.split('.').pop()).toLowerCase();
    if (!allowedExts.includes(ext)) invalid.push(f);
    else valid.push(f);
  }
  return { valid, invalid };
}

// PUBLIC_INTERFACE
export default function UploadPanel({ onFilesChange, onTemplateChange, selectedFiles = [], selectedTemplate = null }) {
  /** Upload panel component with list view and remove operations. */
  const inputRef = useRef(null);
  const templateRef = useRef(null);

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const { valid, invalid } = validateFiles(files, ACCEPTED_INPUTS);
    if (invalid.length) {
      alert(`Some files are not allowed: ${invalid.map(f => f.name).join(', ')}`);
    }
    if (valid.length) onFilesChange([...(selectedFiles || []), ...valid]);
    // reset value to allow re-choose same file
    e.target.value = '';
  };

  const onPickTemplate = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const { valid, invalid } = validateFiles(files, ACCEPTED_TEMPLATE);
    if (invalid.length) {
      alert(`Template must be an Excel file (.xls/.xlsx)`);
      e.target.value = '';
      return;
    }
    onTemplateChange(valid[0]);
    e.target.value = '';
  };

  const removeFileAt = (idx) => {
    const next = [...selectedFiles];
    next.splice(idx, 1);
    onFilesChange(next);
  };

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="section-title">Upload</div>
      <p className="muted" id="upload-help">Select your source documents and a mapping Excel template.</p>

      <div className="upload-grid" style={{ marginTop: 10 }}>
        <div>
          <div className="dropzone" role="group" aria-labelledby="input-files-label" aria-describedby="upload-help">
            <div id="input-files-label" className="section-title" style={{ fontSize: 16 }}>Source Documents</div>
            <p className="muted">PDF, Word, PowerPoint, Excel, Images</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_INPUTS.join(',')}
              onChange={onPickFiles}
              aria-label="Choose source documents"
              style={{ marginTop: 8 }}
            />
            <div className="file-list" aria-live="polite">
              {(selectedFiles || []).length === 0 ? (
                <div className="muted">No files selected.</div>
              ) : (selectedFiles || []).map((f, idx) => (
                <div className="file-item" key={`${f.name}-${idx}`}>
                  <span title={f.name}>{f.name}</span>
                  <button className="btn ghost" onClick={() => removeFileAt(idx)} aria-label={`Remove ${f.name}`}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="dropzone" role="group" aria-labelledby="template-label">
            <div id="template-label" className="section-title" style={{ fontSize: 16 }}>Excel Template</div>
            <p className="muted">Upload the target mapping schema (.xlsx)</p>
            <input
              ref={templateRef}
              type="file"
              accept={ACCEPTED_TEMPLATE.join(',')}
              onChange={onPickTemplate}
              aria-label="Choose Excel template"
              style={{ marginTop: 8 }}
            />
            <div className="file-list" aria-live="polite">
              {!selectedTemplate ? (
                <div className="muted">No template selected.</div>
              ) : (
                <div className="file-item">
                  <span title={selectedTemplate.name}>{selectedTemplate.name}</span>
                  <button className="btn ghost" onClick={() => onTemplateChange(null)} aria-label="Remove template">Remove</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
