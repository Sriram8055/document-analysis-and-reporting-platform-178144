import React, { useState } from 'react';

/**
 * UploadPanel
 * Allows users to select multiple document files and a single Excel template, then submit.
 */
const UploadPanel = ({ onSubmit, disabled, isUploading }) => {
  const [docs, setDocs] = useState([]);
  const [excel, setExcel] = useState(null);

  const onDocsChange = (e) => {
    setDocs(Array.from(e.target.files || []));
  };

  const onExcelChange = (e) => {
    setExcel((e.target.files || [])[0] || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(docs, excel);
  };

  return (
    <form onSubmit={handleSubmit} className="upload-group">
      <div className="upload-row">
        <label className="helper">Source Documents</label>
        <input
          className="input-file"
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
          multiple
          onChange={onDocsChange}
          disabled={disabled}
        />
        <span className="helper">
          {docs.length ? `${docs.length} selected` : 'PDF, Word, PPTX, Excel, Images'}
        </span>
      </div>

      <div className="upload-row">
        <label className="helper">Excel Template</label>
        <input
          className="input-file"
          type="file"
          accept=".xls,.xlsx"
          onChange={onExcelChange}
          disabled={disabled}
        />
        <span className="helper">
          {excel ? excel.name : 'Select the mapping template (.xlsx)'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={disabled || !excel || docs.length === 0 || isUploading}
          aria-busy={isUploading}
        >
          {isUploading ? 'Uploading…' : 'Start Analysis'}
        </button>
      </div>
    </form>
  );
};

export default UploadPanel;
