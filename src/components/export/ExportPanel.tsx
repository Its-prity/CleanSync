import React from 'react';
import { RowData } from '../../types/dataset';
import { AuditChange } from '../../types/cleaning';
import { exportToCsv, exportToXlsx, exportAuditJson } from '../../lib/exporter';
import { Download, FileSpreadsheet, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface ExportPanelProps {
  cleanedRows: RowData[];
  quarantineRows: RowData[];
  duplicateRows: RowData[];
  auditLog: AuditChange[];
  stats: any;
  filename: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  cleanedRows,
  quarantineRows,
  duplicateRows,
  auditLog,
  stats,
  filename
}) => {
  const baseName = filename.replace(/\.[^/.]+$/, '') || 'CleanSync_dataset';

  const handleDownloadCleanCsv = () => {
    exportToCsv(cleanedRows, `${baseName}_CLEANED.csv`);
  };

  const handleDownloadCleanXlsx = () => {
    exportToXlsx(cleanedRows, `${baseName}_CLEANED.xlsx`);
  };

  const handleDownloadQuarantineCsv = () => {
    exportToCsv(quarantineRows, `${baseName}_QUARANTINE.csv`);
  };

  const handleDownloadAuditJson = () => {
    exportAuditJson(auditLog, stats, `${baseName}_AUDIT_REPORT.json`);
  };

  return (
    <div className="export-panel-card">
      <div className="export-header">
        <div>
          <h3 className="section-title">Multi-Stream Export & Delivery</h3>
          <p className="section-sub">
            Your dataset has been sanitized. Choose your preferred export streams below.
          </p>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="stats-summary-bar">
        <div className="stat-item">
          <span className="stat-label">Initial Input</span>
          <span className="stat-value">{stats.initialRows} rows</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">Cleaned & Validated</span>
          <span className="stat-value text-emerald">{cleanedRows.length} rows</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">Quarantined Errors</span>
          <span className="stat-value text-rose">{quarantineRows.length} rows</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">Duplicates Filtered</span>
          <span className="stat-value text-purple">{duplicateRows.length} rows</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">Total Transformations</span>
          <span className="stat-value text-amber">{auditLog.length} changes</span>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="export-grid">
        {/* Clean Data Card */}
        <div className="export-stream-card card-primary-stream">
          <div className="stream-header">
            <div className="stream-icon-circle icon-clean">
              <CheckCircle2 size={24} className="icon-emerald" />
            </div>
            <div>
              <span className="stream-badge-primary">Production Stream</span>
              <h4 className="stream-title">Pristine Clean Dataset</h4>
            </div>
          </div>
          <p className="stream-desc">
            Normalized, casing-corrected, typo-fixed records ready for CRM ingestion or database seeding.
          </p>

          <div className="stream-actions">
            <button
              onClick={handleDownloadCleanCsv}
              className="btn btn-emerald"
              id="btn-download-clean-csv"
            >
              <Download size={16} />
              <span>Download Clean CSV ({cleanedRows.length})</span>
            </button>

            <button
              onClick={handleDownloadCleanXlsx}
              className="btn btn-outline"
              id="btn-download-clean-xlsx"
            >
              <FileSpreadsheet size={16} />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Quarantine Data Card */}
        <div className="export-stream-card">
          <div className="stream-header">
            <div className="stream-icon-circle icon-quarantine-subtle">
              <ShieldAlert size={24} className="text-rose" />
            </div>
            <div>
              <span className="stream-badge-danger">Triage Stream</span>
              <h4 className="stream-title">Quarantine Records</h4>
            </div>
          </div>
          <p className="stream-desc">
            Records containing unfixable structural errors (e.g. invalid syntax) isolated for manual review.
          </p>

          <div className="stream-actions">
            <button
              onClick={handleDownloadQuarantineCsv}
              disabled={quarantineRows.length === 0}
              className="btn btn-danger-outline"
              id="btn-download-quarantine"
            >
              <Download size={16} />
              <span>Download Quarantine CSV ({quarantineRows.length})</span>
            </button>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className="export-stream-card">
          <div className="stream-header">
            <div className="stream-icon-circle icon-audit-subtle">
              <FileText size={24} className="icon-amber" />
            </div>
            <div>
              <span className="stream-badge-info">Compliance Stream</span>
              <h4 className="stream-title">Audit Changelog</h4>
            </div>
          </div>
          <p className="stream-desc">
            Complete JSON audit trail documenting every modification, before/after values, and applied rules.
          </p>

          <div className="stream-actions">
            <button
              onClick={handleDownloadAuditJson}
              className="btn btn-outline"
              id="btn-download-audit"
            >
              <Download size={16} />
              <span>Download Audit JSON ({auditLog.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
