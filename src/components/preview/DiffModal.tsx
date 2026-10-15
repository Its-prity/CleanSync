import React from 'react';
import { RowData, ColumnMeta } from '../../types/dataset';
import { X, ArrowRight, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DiffModalProps {
  row: RowData | null;
  columns: ColumnMeta[];
  onClose: () => void;
}

export const DiffModal: React.FC<DiffModalProps> = ({ row, columns, onClose }) => {
  if (!row) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-gap">
            <ShieldCheck size={20} className="icon-emerald" />
            <h3 className="modal-title">Record Audit Diff (Row ID: {row._id})</h3>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Side-by-side cell comparison showing original input vs sanitized CleanSync output.
          </p>

          <table className="diff-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Field</th>
                <th>Raw Original Value</th>
                <th style={{ width: '30px' }}></th>
                <th>Cleaned Output</th>
                <th>Status / Rule</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => {
                const orig = row._original?.[col.key] ?? '';
                const current = String(row[col.key] ?? '');
                const changed = orig !== current;
                const issue = row._issues?.[col.key];

                return (
                  <tr key={col.key} className={changed ? 'diff-row-changed' : ''}>
                    <td className="font-medium text-white">{col.originalLabel}</td>
                    <td className={`diff-cell-orig ${changed ? 'text-strikethrough text-rose' : ''}`}>
                      {orig ? orig : <span className="text-muted-italic">empty</span>}
                    </td>
                    <td className="text-center text-muted">
                      {changed && <ArrowRight size={14} className="icon-emerald" />}
                    </td>
                    <td className={`diff-cell-new ${changed ? 'text-emerald font-semibold' : ''}`}>
                      {current ? current : <span className="text-muted-italic">empty</span>}
                    </td>
                    <td>
                      {changed ? (
                        <span className="diff-rule-tag">
                          <Check size={12} className="icon-emerald" />
                          <span>Sanitized</span>
                        </span>
                      ) : issue ? (
                        <span className="diff-issue-tag">
                          <AlertTriangle size={12} className="text-amber" />
                          <span>{issue.message}</span>
                        </span>
                      ) : (
                        <span className="text-muted">Unchanged</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close Diff Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
