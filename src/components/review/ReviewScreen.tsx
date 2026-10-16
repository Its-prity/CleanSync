import React, { useState } from 'react';
import { RowData, ColumnMeta } from '../../types/dataset';
import { SummaryBar } from '../common/SummaryBar';
import { StatusPill } from '../common/StatusPill';
import { ProofCell } from '../common/ProofCell';

interface ReviewScreenProps {
  rows: RowData[];
  columns: ColumnMeta[];
  onProceedToExport?: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  rows,
  columns,
  onProceedToExport,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'warning' | 'invalid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // Determine row status
  const getRowStatus = (row: RowData): 'valid' | 'warning' | 'invalid' => {
    const issues = Object.values(row._issues || {});
    const hasBlockingError = issues.some((iss) => iss.severity === 'error') || row._status === 'quarantined';
    if (hasBlockingError) return 'invalid';

    const hasWarning = issues.some((iss) => iss.severity === 'warning') || row._status === 'duplicate';
    if (hasWarning) return 'warning';

    return 'valid';
  };

  // Pre-calculate counts
  const validRows = rows.filter((r) => getRowStatus(r) === 'valid');
  const warningRows = rows.filter((r) => getRowStatus(r) === 'warning');
  const invalidRows = rows.filter((r) => getRowStatus(r) === 'invalid');

  // Share an email count (records sharing an email address)
  const emailOccurrence: Record<string, number> = {};
  for (const r of rows) {
    const email = String(r.email || '').toLowerCase().trim();
    if (email) {
      emailOccurrence[email] = (emailOccurrence[email] || 0) + 1;
    }
  }
  const shareEmailCount = rows.filter((r) => {
    const email = String(r.email || '').toLowerCase().trim();
    return (email && emailOccurrence[email] > 1) || r._status === 'duplicate';
  }).length;

  const validCount = validRows.length;
  const warningCount = warningRows.length;
  const invalidCount = invalidRows.length;
  const totalCount = rows.length;

  // Quality figure: "X% of rows have no blocking errors."
  const noBlockingCount = totalCount - invalidCount;
  const qualityPercentage = totalCount > 0 ? Math.round((noBlockingCount / totalCount) * 100) : 100;

  // Toggle row expansion
  const toggleRow = (rowId: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  // Filter rows
  const filteredRows = rows.filter((row) => {
    const status = getRowStatus(row);
    if (filterTab === 'valid' && status !== 'valid') return false;
    if (filterTab === 'warning' && status !== 'warning') return false;
    if (filterTab === 'invalid' && status !== 'invalid') return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matches = columns.some((col) =>
        String(row[col.key] ?? '').toLowerCase().includes(term)
      );
      if (!matches) return false;
    }

    return true;
  });

  // Describe fix for issues
  const getFixInstruction = (key: string, issue: any): string => {
    if (issue.suggestedFix) return issue.suggestedFix;
    if (issue.type === 'missing_required') {
      return `Enter a required value for ${key} in your source file to import this record.`;
    }
    if (issue.type === 'invalid_email') {
      return 'Check the email format. It must include a user name, @ symbol, and valid domain.';
    }
    if (issue.type === 'malformed_phone') {
      return 'Provide a phone number with at least 10 valid digits.';
    }
    if (issue.type === 'duplicate') {
      return 'Check if this is a repeat contact or merge duplicate entries.';
    }
    if (issue.type === 'invalid_date') {
      return 'Use a standard date format such as YYYY-MM-DD or MM/DD/YYYY.';
    }
    return 'Update the value in the source document.';
  };

  return (
    <div className="w-full py-6 sm:py-8 space-y-6">
      {/* Top Header & Quality Definition Sentence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#17233F]">
            Review
          </h1>
          <p className="text-[#5B6788] text-sm mt-1">
            {qualityPercentage}% of rows have no blocking errors.
          </p>
        </div>

        {onProceedToExport && (
          <button
            type="button"
            id="btn-go-to-export"
            onClick={onProceedToExport}
            className="px-6 py-2.5 rounded-[8px] bg-[#3A5BFF] hover:bg-[#2540D6] text-white font-medium text-sm border-[1.5px] border-[#17233F] shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            Export records
          </button>
        )}
      </div>

      {/* Proportional horizontal summary bar */}
      <SummaryBar
        validCount={validCount}
        warningCount={warningCount}
        invalidCount={invalidCount}
      />

      {/* Four large count numbers with small labels: valid, need a look, blocked, share an email. No stat cards. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-1 pb-2">
        <div className="flex flex-col">
          <span className="font-display text-[34px] font-bold text-[#17233F] tabular-nums leading-none">
            {validCount}
          </span>
          <span className="text-xs text-[#5B6788] mt-1.5 font-medium">valid</span>
        </div>

        <div className="flex flex-col">
          <span className="font-display text-[34px] font-bold text-[#17233F] tabular-nums leading-none">
            {warningCount}
          </span>
          <span className="text-xs text-[#5B6788] mt-1.5 font-medium">need a look</span>
        </div>

        <div className="flex flex-col">
          <span className="font-display text-[34px] font-bold text-[#17233F] tabular-nums leading-none">
            {invalidCount}
          </span>
          <span className="text-xs text-[#5B6788] mt-1.5 font-medium">blocked</span>
        </div>

        <div className="flex flex-col">
          <span className="font-display text-[34px] font-bold text-[#17233F] tabular-nums leading-none">
            {shareEmailCount}
          </span>
          <span className="text-xs text-[#5B6788] mt-1.5 font-medium">share an email</span>
        </div>
      </div>

      {/* Filter Tabs as pill buttons & Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Filter records by status">
          <button
            type="button"
            id="tab-filter-all"
            role="tab"
            aria-selected={filterTab === 'all'}
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border-[1.5px] border-[#17233F] transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              filterTab === 'all'
                ? 'bg-[#17233F] text-white'
                : 'bg-[#FFFFFF] text-[#17233F] hover:bg-[#FAFBFF]'
            }`}
          >
            <span>All</span>
            <span className={`tabular-nums text-[11px] ${filterTab === 'all' ? 'text-white/80' : 'text-[#5B6788]'}`}>
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-filter-valid"
            role="tab"
            aria-selected={filterTab === 'valid'}
            onClick={() => setFilterTab('valid')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border-[1.5px] border-[#17233F] transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              filterTab === 'valid'
                ? 'bg-[#17233F] text-white'
                : 'bg-[#FFFFFF] text-[#17233F] hover:bg-[#FAFBFF]'
            }`}
          >
            <span>Valid</span>
            <span className={`tabular-nums text-[11px] ${filterTab === 'valid' ? 'text-white/80' : 'text-[#5B6788]'}`}>
              {validCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-filter-warning"
            role="tab"
            aria-selected={filterTab === 'warning'}
            onClick={() => setFilterTab('warning')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border-[1.5px] border-[#17233F] transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              filterTab === 'warning'
                ? 'bg-[#17233F] text-white'
                : 'bg-[#FFFFFF] text-[#17233F] hover:bg-[#FAFBFF]'
            }`}
          >
            <span>Warnings</span>
            <span className={`tabular-nums text-[11px] ${filterTab === 'warning' ? 'text-white/80' : 'text-[#5B6788]'}`}>
              {warningCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-filter-invalid"
            role="tab"
            aria-selected={filterTab === 'invalid'}
            onClick={() => setFilterTab('invalid')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border-[1.5px] border-[#17233F] transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              filterTab === 'invalid'
                ? 'bg-[#17233F] text-white'
                : 'bg-[#FFFFFF] text-[#17233F] hover:bg-[#FAFBFF]'
            }`}
          >
            <span>Invalid</span>
            <span className={`tabular-nums text-[11px] ${filterTab === 'invalid' ? 'text-white/80' : 'text-[#5B6788]'}`}>
              {invalidCount}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            id="search-records-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-full border-[1.5px] border-[#17233F] text-xs bg-white text-[#17233F] placeholder-[#5B6788] focus:outline-none focus:ring-2 focus:ring-[#3A5BFF]"
          />
        </div>
      </div>

      {/* Table with 6px colored left edge per row by status */}
      <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-tl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-[1.5px] border-[#17233F] bg-[#FAFBFF] text-xs font-semibold text-[#5B6788]">
                <th scope="col" className="py-3 px-4 w-12 text-center">
                  #
                </th>
                <th scope="col" className="py-3 px-4 w-32">
                  Status
                </th>
                {columns.map((col) => (
                  <th key={col.key} scope="col" className="py-3 px-4 font-semibold text-[#17233F]">
                    {col.originalLabel || col.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3F3]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-12 text-center text-sm text-[#5B6788]">
                    No records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const status = getRowStatus(row);
                  const isExpanded = expandedRowIds.has(row._id);

                  // 6px colored left edge
                  let leftBorderColor = 'border-l-[#12A874]';
                  let statusPillType: 'valid' | 'need_look' | 'blocked' = 'valid';
                  let statusLabel = 'Valid';

                  if (status === 'invalid') {
                    leftBorderColor = 'border-l-[#E5385B]';
                    statusPillType = 'blocked';
                    statusLabel = 'Blocked';
                  } else if (status === 'warning') {
                    leftBorderColor = 'border-l-[#B77A00]';
                    statusPillType = 'need_look';
                    statusLabel = 'Need a look';
                  }

                  // Find changes for detail row
                  const changes: { col: string; before: string; after: string; rule: string }[] = [];
                  for (const col of columns) {
                    const origVal = row._original?.[col.key];
                    const cleanVal = row[col.key];
                    if (origVal !== undefined && String(origVal) !== String(cleanVal ?? '')) {
                      changes.push({
                        col: col.originalLabel || col.key,
                        before: String(origVal),
                        after: String(cleanVal ?? ''),
                        rule: `Updated ${col.originalLabel || col.key}`,
                      });
                    }
                  }

                  const issues = Object.entries(row._issues || {});

                  return (
                    <React.Fragment key={row._id || idx}>
                      <tr
                        tabIndex={0}
                        id={`row-${row._id || idx}`}
                        onClick={() => toggleRow(row._id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleRow(row._id);
                          }
                        }}
                        aria-expanded={isExpanded}
                        className={`border-l-[6px] ${leftBorderColor} cursor-pointer hover:bg-[#FAFBFF] transition-colors focus:bg-[#FAFBFF] outline-none ${
                          isExpanded ? 'bg-[#FAFBFF]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-xs text-[#5B6788] tabular-nums text-center">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4">
                          <StatusPill status={statusPillType} label={statusLabel} />
                        </td>

                        {columns.map((col) => {
                          const origVal = row._original?.[col.key];
                          const cleanVal = row[col.key];
                          const issue = row._issues?.[col.key];

                          return (
                            <td key={col.key} className="py-3 px-4">
                              <ProofCell
                                original={origVal}
                                clean={cleanVal !== undefined && cleanVal !== null ? String(cleanVal) : ''}
                                issue={issue}
                              />
                            </td>
                          );
                        })}
                      </tr>

                      {/* Detail row listing each tidy-up ("Tidied") and each issue (Error or Warning) */}
                      {isExpanded && (
                        <tr className={`border-l-[6px] ${leftBorderColor} bg-[#FAFBFF] border-b border-[#DDE3F3]`}>
                          <td colSpan={columns.length + 2} className="px-6 py-4">
                            <div className="space-y-2 text-xs">
                              <p className="font-semibold text-[#17233F]">
                                Record details
                              </p>

                              {/* Tidy-ups */}
                              {changes.length > 0 && (
                                <div className="space-y-1">
                                  {changes.map((ch, cIdx) => (
                                    <div key={cIdx} className="flex items-start gap-2 text-[#17233F]">
                                      <span className="font-semibold text-[#12A874]">Tidied:</span>
                                      <span>
                                        Normalized {ch.col} from <s className="text-[#E5385B] line-through">{ch.before}</s> to{' '}
                                        <mark className="bg-[#FFE45C] text-[#17233F] px-1 rounded-[2px]">{ch.after}</mark>.
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Issues */}
                              {issues.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  {issues.map(([key, iss]) => {
                                    const isError = iss.severity === 'error';
                                    const fix = getFixInstruction(key, iss);

                                    return (
                                      <div key={key} className="flex items-start gap-2 text-[#17233F]">
                                        <span className={`font-semibold ${isError ? 'text-[#E5385B]' : 'text-[#B77A00]'}`}>
                                          {isError ? 'Blocked:' : 'Need a look:'}
                                        </span>
                                        <span>
                                          {iss.message}. {fix}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {changes.length === 0 && issues.length === 0 && (
                                <p className="text-[#5B6788]">
                                  This record is valid with no modifications needed.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
