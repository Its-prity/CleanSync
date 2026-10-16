import React, { useState } from 'react';
import { RowData, HealthScore } from '../../types/dataset';
import { AuditChange } from '../../types/cleaning';
import {
  exportCleanedCsv,
  exportIssuesCsv,
  exportFullReviewCsv,
  exportToXlsx,
  exportAuditJson,
} from '../../lib/exporter';

interface ExportScreenProps {
  allRows?: RowData[];
  cleanedRows: RowData[];
  quarantineRows: RowData[];
  duplicateRows: RowData[];
  auditLog: AuditChange[];
  stats: any;
  filename: string;
  healthScore?: HealthScore;
  onStartOver: () => void;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({
  allRows,
  cleanedRows,
  quarantineRows,
  auditLog,
  stats,
  filename,
  healthScore,
  onStartOver,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const baseName = filename.replace(/\.[^/.]+$/, '') || 'CleanSync_dataset';
  const combinedRows = allRows && allRows.length > 0 ? allRows : [...cleanedRows, ...quarantineRows];

  const handleDownloadCleanCsv = () => {
    exportCleanedCsv(cleanedRows, `${baseName}_cleaned.csv`);
  };

  const handleDownloadCleanXlsx = () => {
    exportToXlsx(cleanedRows, `${baseName}_cleaned.xlsx`);
  };

  const handleDownloadIssuesCsv = () => {
    exportIssuesCsv(combinedRows, `${baseName}_issues.csv`);
  };

  const handleDownloadFullReviewCsv = () => {
    exportFullReviewCsv(combinedRows, `${baseName}_full_review.csv`);
  };

  const handleDownloadAuditReport = () => {
    exportAuditJson(auditLog, stats, `${baseName}_audit_report.json`);
  };

  // Compile issues by type
  const issueCounts: { label: string; count: number }[] = [];
  if (healthScore?.breakdown) {
    const b = healthScore.breakdown;
    if (b.emailTypos > 0) issueCounts.push({ label: 'Email domain typos', count: b.emailTypos });
    if (b.invalidEmails > 0) issueCounts.push({ label: 'Invalid email syntax', count: b.invalidEmails });
    if (b.malformedPhones > 0) issueCounts.push({ label: 'Inconsistent phone numbers', count: b.malformedPhones });
    if (b.casingIssues > 0) issueCounts.push({ label: 'Casing corrections', count: b.casingIssues });
    if (b.invalidDates > 0) issueCounts.push({ label: 'Invalid date formats', count: b.invalidDates });
    if (b.missingRequired > 0) issueCounts.push({ label: 'Missing required fields', count: b.missingRequired });
    if (b.duplicateRows > 0) issueCounts.push({ label: 'Duplicate rows', count: b.duplicateRows });
  } else {
    // Fallback: derive from auditLog rules
    const ruleCounts: Record<string, number> = {};
    for (const item of auditLog) {
      ruleCounts[item.ruleApplied] = (ruleCounts[item.ruleApplied] || 0) + 1;
    }
    for (const [rule, count] of Object.entries(ruleCounts)) {
      issueCounts.push({ label: rule, count });
    }
  }

  return (
    <div className="w-full py-6 sm:py-8 space-y-8">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#17233F]">
            Export
          </h1>
          <p className="text-[#5B6788] text-sm mt-1">
            Choose your export stream or download the full proofreading audit trail.
          </p>
        </div>

        <button
          type="button"
          id="btn-start-over-trigger"
          onClick={() => setShowConfirmReset(true)}
          className="px-4 py-2 rounded-[8px] bg-[#FFFFFF] hover:bg-[#FAFBFF] text-[#17233F] text-xs font-medium border-[1.5px] border-[#17233F] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Start over
        </button>
      </div>

      {/* Held Back Notice */}
      <div className="p-4 rounded-[12px] bg-[#FAFBFF] border-[1.5px] border-[#17233F] text-sm text-[#17233F] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#12A874]" aria-hidden="true" />
          <span>
            {quarantineRows.length} invalid {quarantineRows.length === 1 ? 'row was' : 'rows were'} held back from the cleaned file.
          </span>
        </div>
        <span className="text-xs text-[#5B6788]">
          Clean records are isolated to safeguard your CRM.
        </span>
      </div>

      {/* Three Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Cleaned records */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-br p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <span className="font-display text-[44px] font-bold text-[#17233F] tabular-nums leading-none block">
              {cleanedRows.length}
            </span>
            <h2 className="font-display text-xl font-bold text-[#17233F] mt-3">
              Cleaned records
            </h2>
            <p className="text-xs text-[#5B6788] mt-1.5 leading-relaxed">
              Normalized and validated records ready for CRM ingestion.
            </p>
          </div>

          <div className="pt-6 space-y-2">
            <button
              type="button"
              id="btn-download-clean-csv"
              onClick={handleDownloadCleanCsv}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#3A5BFF] hover:bg-[#2540D6] text-white font-medium text-xs border-[1.5px] border-[#17233F] shadow-sm transition-colors cursor-pointer text-center block"
            >
              Download cleaned CSV
            </button>
            <button
              type="button"
              id="btn-download-clean-xlsx"
              onClick={handleDownloadCleanXlsx}
              className="w-full py-2 px-4 rounded-[8px] bg-[#FFFFFF] hover:bg-[#FAFBFF] text-[#17233F] font-medium text-xs border border-[#DDE3F3] transition-colors cursor-pointer text-center block"
            >
              Download Excel file
            </button>
          </div>
        </div>

        {/* Card 2: Issues report */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-bl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <span className="font-display text-[44px] font-bold text-[#17233F] tabular-nums leading-none block">
              {quarantineRows.length}
            </span>
            <h2 className="font-display text-xl font-bold text-[#17233F] mt-3">
              Issues report
            </h2>
            <p className="text-xs text-[#5B6788] mt-1.5 leading-relaxed">
              Records with blocking errors held back for manual review.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              id="btn-download-issues-csv"
              onClick={handleDownloadIssuesCsv}
              disabled={quarantineRows.length === 0}
              className={`w-full py-2.5 px-4 rounded-[8px] font-medium text-xs border-[1.5px] border-[#17233F] transition-colors text-center block ${
                quarantineRows.length === 0
                  ? 'bg-[#DDE3F3] text-[#5B6788] cursor-not-allowed opacity-60'
                  : 'bg-[#FFFFFF] hover:bg-[#FFE1E7] text-[#17233F] cursor-pointer'
              }`}
            >
              Download issues CSV
            </button>
          </div>
        </div>

        {/* Card 3: Full review */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-tr p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <span className="font-display text-[44px] font-bold text-[#17233F] tabular-nums leading-none block">
              {auditLog.length}
            </span>
            <h2 className="font-display text-xl font-bold text-[#17233F] mt-3">
              Full review
            </h2>
            <p className="text-xs text-[#5B6788] mt-1.5 leading-relaxed">
              Complete audit log of every modification and applied rule.
            </p>
          </div>

          <div className="pt-6 space-y-2">
            <button
              type="button"
              id="btn-download-full-review-csv"
              onClick={handleDownloadFullReviewCsv}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#3A5BFF] hover:bg-[#2540D6] text-white font-medium text-xs border-[1.5px] border-[#17233F] shadow-sm transition-colors cursor-pointer text-center block"
            >
              Download full review CSV
            </button>
            <button
              type="button"
              id="btn-download-audit-report"
              onClick={handleDownloadAuditReport}
              className="w-full py-2 px-4 rounded-[8px] bg-[#FFFFFF] hover:bg-[#FAFBFF] text-[#17233F] font-medium text-xs border border-[#DDE3F3] transition-colors cursor-pointer text-center block"
            >
              Download audit report
            </button>
          </div>
        </div>
      </div>

      {/* Issues by type list */}
      {issueCounts.length > 0 && (
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-tl p-6">
          <h3 className="font-display text-lg font-bold text-[#17233F] mb-4">
            Issues by type
          </h3>
          <ul className="divide-y divide-[#DDE3F3] text-xs">
            {issueCounts.map((item, idx) => (
              <li key={idx} className="py-2.5 flex items-center justify-between text-[#17233F]">
                <span>{item.label}</span>
                <span className="font-display text-sm font-bold tabular-nums text-[#17233F]">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm Start Over Dialog */}
      {showConfirmReset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] rounded-[22px_22px_22px_6px] p-6 max-w-md w-full shadow-lg space-y-4">
            <h3 id="confirm-dialog-title" className="font-display text-xl font-bold text-[#17233F]">
              Start over?
            </h3>
            <p className="text-xs text-[#5B6788] leading-relaxed">
              This will clear your current dataset and all cleaning modifications. You will return to the upload screen.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="btn-confirm-cancel"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-[8px] bg-[#FFFFFF] hover:bg-[#FAFBFF] text-[#17233F] text-xs font-medium border border-[#DDE3F3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-reset"
                onClick={() => {
                  setShowConfirmReset(false);
                  onStartOver();
                }}
                className="px-4 py-2 rounded-[8px] bg-[#E5385B] hover:bg-[#B81D3E] text-white text-xs font-medium border-[1.5px] border-[#17233F] cursor-pointer"
              >
                Confirm reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
