import React, { useState } from 'react';
import { RowData, ColumnMeta } from '../../types/dataset';
import { CheckCircle2, AlertOctagon, HelpCircle, SplitSquareVertical, Search } from 'lucide-react';

interface DataTableProps {
  rows: RowData[];
  columns: ColumnMeta[];
  onOpenDiffModal?: (row: RowData) => void;
  isCleaned: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  onOpenDiffModal,
  isCleaned
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'errors' | 'cleaned' | 'duplicates'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering
  const filteredRows = rows.filter((row) => {
    // Tab filter
    if (filterTab === 'errors') {
      const hasErrors = Object.values(row._issues || {}).some((iss) => iss.severity === 'error') || row._status === 'quarantined';
      if (!hasErrors) return false;
    } else if (filterTab === 'cleaned') {
      if (row._status !== 'cleaned') return false;
    } else if (filterTab === 'duplicates') {
      if (row._status !== 'duplicate') return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matches = columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(term));
      if (!matches) return false;
    }

    return true;
  });

  const errorCount = rows.filter((r) => Object.values(r._issues || {}).some((i) => i.severity === 'error') || r._status === 'quarantined').length;
  const cleanedCount = rows.filter((r) => r._status === 'cleaned').length;
  const duplicateCount = rows.filter((r) => r._status === 'duplicate').length;

  return (
    <div className="datatable-card">
      <div className="datatable-toolbar">
        {/* Filter Tabs */}
        <div className="datatable-tabs">
          <button
            onClick={() => setFilterTab('all')}
            className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            id="tab-all"
          >
            All Records <span className="tab-pill">{rows.length}</span>
          </button>
          <button
            onClick={() => setFilterTab('errors')}
            className={`tab-btn ${filterTab === 'errors' ? 'active' : ''}`}
            id="tab-errors"
          >
            <AlertOctagon size={14} className="text-rose" />
            Needs Attention <span className="tab-pill pill-danger">{errorCount}</span>
          </button>
          {isCleaned && (
            <button
              onClick={() => setFilterTab('cleaned')}
              className={`tab-btn ${filterTab === 'cleaned' ? 'active' : ''}`}
              id="tab-cleaned"
            >
              <CheckCircle2 size={14} className="text-emerald" />
              Cleaned <span className="tab-pill pill-emerald">{cleanedCount}</span>
            </button>
          )}
          {duplicateCount > 0 && (
            <button
              onClick={() => setFilterTab('duplicates')}
              className={`tab-btn ${filterTab === 'duplicates' ? 'active' : ''}`}
              id="tab-duplicates"
            >
              Duplicates <span className="tab-pill pill-purple">{duplicateCount}</span>
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="table-search-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="table-scroll-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th style={{ width: '80px' }}>Status</th>
              {columns.map((col) => (
                <th key={col.key}>{col.originalLabel}</th>
              ))}
              <th style={{ width: '80px', textAlign: 'center' }}>Diff</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className="empty-table-state">
                  No records match current filter.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => {
                const issues = row._issues || {};
                const isQuarantined = row._status === 'quarantined';
                const isClean = row._status === 'cleaned';

                return (
                  <tr
                    key={row._id || index}
                    className={`table-row ${isQuarantined ? 'row-quarantine' : ''} ${row._status === 'duplicate' ? 'row-duplicate' : ''}`}
                  >
                    <td className="row-num text-muted">{index + 1}</td>
                    <td>
                      {isClean && <span className="status-badge badge-clean">Clean</span>}
                      {isQuarantined && <span className="status-badge badge-quarantine">Quarantine</span>}
                      {row._status === 'duplicate' && <span className="status-badge badge-duplicate">Dup</span>}
                      {!row._status && <span className="status-badge badge-raw">Raw</span>}
                    </td>

                    {columns.map((col) => {
                      const val = String(row[col.key] ?? '');
                      const issue = issues[col.key];
                      const origVal = row._original?.[col.key];
                      const wasModified = origVal !== undefined && origVal !== val;

                      let cellClass = 'cell-standard';
                      if (issue?.severity === 'error') cellClass = 'cell-error';
                      else if (issue?.severity === 'warning') cellClass = 'cell-warning';
                      else if (wasModified) cellClass = 'cell-modified';

                      return (
                        <td key={col.key} className={cellClass}>
                          <div className="cell-content-wrap">
                            <span className="cell-value" title={val}>
                              {val || <span className="text-muted-italic">empty</span>}
                            </span>
                            {issue && (
                              <div className="cell-issue-tooltip" title={issue.message}>
                                <HelpCircle size={13} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    <td className="text-center">
                      <button
                        type="button"
                        id={`btn-diff-${index}`}
                        onClick={() => onOpenDiffModal && onOpenDiffModal(row)}
                        className="btn-icon btn-diff-trigger"
                        title="View Before & After Diff"
                      >
                        <SplitSquareVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
