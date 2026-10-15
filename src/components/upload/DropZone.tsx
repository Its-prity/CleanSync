import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, AlertTriangle, Shield, Zap, ArrowRight } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, onLoadSample, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="upload-section">
      <div className="hero-banner">
        <h1 className="hero-title">Customer Data Onboarding, Sanitized in Seconds</h1>
        <p className="hero-desc">
          Automate customer data cleaning directly in your browser. Normalize phones, fix email typos,
          standardize name casing, deduplicate contacts, and quarantine fatal errors with zero privacy risks.
        </p>
      </div>

      <div className="upload-grid">
        {/* Drop Zone Box */}
        <div
          className={`dropzone-box ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="dropzone-area"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv,.xlsx,.xls,.tsv,.json"
            style={{ display: 'none' }}
          />

          <div className="dropzone-content">
            <div className="dropzone-icon-circle">
              <UploadCloud size={38} className="icon-emerald" />
            </div>

            <h3 className="dropzone-heading">
              {isLoading ? 'Parsing and analyzing file...' : 'Drop your customer spreadsheet here'}
            </h3>
            <p className="dropzone-sub">
              Drag & drop or <span className="text-emerald font-semibold">browse local files</span>
            </p>

            <div className="supported-formats">
              <span className="format-tag"><FileSpreadsheet size={13} /> .CSV</span>
              <span className="format-tag"><FileSpreadsheet size={13} /> .XLSX</span>
              <span className="format-tag"><FileSpreadsheet size={13} /> .TSV</span>
              <span className="format-tag"><FileSpreadsheet size={13} /> .JSON</span>
            </div>
          </div>
        </div>

        {/* 1-Click Messy Sample Card */}
        <div className="sample-cta-card">
          <div className="sample-card-header">
            <div className="sample-icon-wrap">
              <Sparkles size={20} className="icon-amber" />
            </div>
            <div>
              <h3 className="sample-card-title">Want to see CleanSync in action?</h3>
              <p className="sample-card-desc">No spreadsheet on hand? Load our battle-tested dirty dataset.</p>
            </div>
          </div>

          <div className="sample-issue-preview">
            <div className="issue-preview-item">
              <AlertTriangle size={15} className="text-rose" />
              <span>Casing chaos: <code className="code-bad">jOHN dOE</code>, <code className="code-bad">SARAH CONNOR</code></span>
            </div>
            <div className="issue-preview-item">
              <AlertTriangle size={15} className="text-amber" />
              <span>Domain typos: <code className="code-bad">sarah@gmai.com</code>, <code className="code-bad">@hotmial.com</code></span>
            </div>
            <div className="issue-preview-item">
              <AlertTriangle size={15} className="text-rose" />
              <span>Inconsistent phones: <code className="code-bad">123-456-7890</code>, <code className="code-bad">800-IRON-MAN</code></span>
            </div>
            <div className="issue-preview-item">
              <AlertTriangle size={15} className="text-amber" />
              <span>Duplicates & broken dates: <code className="code-bad">invalid-date</code></span>
            </div>
          </div>

          <button
            onClick={onLoadSample}
            className="btn btn-emerald-lg"
            id="btn-load-demo-cta"
          >
            <span>Load 25 Messy Records Demo</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Feature Value Props */}
      <div className="value-props-row">
        <div className="value-prop-card">
          <Shield size={20} className="icon-emerald" />
          <div>
            <h4>100% Client-Side Privacy</h4>
            <p>Data is parsed and cleaned in browser memory. Nothing ever leaves your machine.</p>
          </div>
        </div>
        <div className="value-prop-card">
          <Zap size={20} className="icon-emerald" />
          <div>
            <h4>Sub-150ms Processing</h4>
            <p>High-speed parsing handles thousands of rows instantaneously without backend latency.</p>
          </div>
        </div>
        <div className="value-prop-card">
          <Sparkles size={20} className="icon-emerald" />
          <div>
            <h4>Automated Auto-Fixes</h4>
            <p>Smart heuristics fix common typos, standardize phone structures, and Title Case names.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
