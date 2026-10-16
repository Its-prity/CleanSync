import React from 'react';
import { ColumnMeta, RowData } from '../../types/dataset';
import { STANDARD_CRM_SCHEMA, ColumnMapping } from '../../types/schema';

interface MatchColumnsScreenProps {
  filename: string;
  recordCount: number;
  columns: ColumnMeta[];
  rows?: RowData[];
  mapping: ColumnMapping;
  onChangeMapping: (sourceKey: string, targetKey: string) => void;
  onCleanRecords: () => void;
  isProcessing: boolean;
}

export const MatchColumnsScreen: React.FC<MatchColumnsScreenProps> = ({
  filename,
  recordCount,
  columns,
  rows,
  mapping,
  onChangeMapping,
  onCleanRecords,
  isProcessing,
}) => {
  // Check for duplicate mappings to the same target field (ignoring 'ignore' and unmapped)
  const targetCounts: Record<string, string[]> = {};
  for (const col of columns) {
    const tgt = mapping[col.key];
    if (tgt && tgt !== 'ignore') {
      if (!targetCounts[tgt]) {
        targetCounts[tgt] = [];
      }
      targetCounts[tgt].push(col.originalLabel || col.key);
    }
  }

  // Find duplicates
  const duplicateCollisions: { targetLabel: string; cols: string[] }[] = [];
  for (const [targetKey, sourceCols] of Object.entries(targetCounts)) {
    if (sourceCols.length > 1) {
      const fieldDef = STANDARD_CRM_SCHEMA.find((f) => f.key === targetKey);
      const targetLabel = fieldDef ? fieldDef.label : targetKey;
      duplicateCollisions.push({
        targetLabel,
        cols: sourceCols,
      });
    }
  }

  const hasDuplicateCollision = duplicateCollisions.length > 0;

  return (
    <div className="w-full py-6 sm:py-8 space-y-6">
      {/* Top Header Row with Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#17233F]">
            Match columns
          </h1>
          <p className="text-[#5B6788] text-sm mt-1">
            File <span className="font-medium text-[#17233F]">{filename}</span> has {recordCount} records and {columns.length} columns.
          </p>
        </div>

        <button
          type="button"
          id="btn-clean-records"
          onClick={onCleanRecords}
          disabled={hasDuplicateCollision || isProcessing}
          className={`px-6 py-2.5 rounded-[8px] font-medium text-sm border-[1.5px] border-[#17233F] transition-colors cursor-pointer flex-shrink-0 ${
            hasDuplicateCollision || isProcessing
              ? 'bg-[#DDE3F3] text-[#5B6788] cursor-not-allowed opacity-60'
              : 'bg-[#3A5BFF] hover:bg-[#2540D6] text-white shadow-sm'
          }`}
        >
          {isProcessing ? 'Cleaning records...' : `Clean ${recordCount} records`}
        </button>
      </div>

      {/* Duplicate Collision Red Inline Message */}
      {hasDuplicateCollision && (
        <div
          role="alert"
          className="p-4 rounded-[12px] bg-[#FFE1E7] border-[1.5px] border-[#E5385B] text-[#B81D3E] text-sm flex items-start gap-2.5"
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#E5385B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="space-y-1">
            {duplicateCollisions.map((collision) => (
              <p key={collision.targetLabel}>
                Columns <span className="font-semibold">"{collision.cols.join('" and "')}"</span> both map to{' '}
                <span className="font-semibold">{collision.targetLabel}</span>. Reassign one column or set it to ignore.
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Mapping Table */}
      <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-tr overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[1.5px] border-[#17233F] bg-[#FAFBFF] text-xs font-semibold text-[#5B6788]">
                <th scope="col" className="py-3 px-4 sm:px-6 w-[28%]">
                  Your column
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 w-[44%]">
                  First values
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 w-[28%]">
                  Becomes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3F3] text-sm text-[#17233F]">
              {columns.map((col) => {
                const currentMapped = mapping[col.key] || col.key;
                const sampleValues = (col.sampleValues || [])
                  .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
                  .slice(0, 3);
                const sampleText = sampleValues.length > 0 ? sampleValues.join(' · ') : 'No sample values';

                const isIgnored = currentMapped === 'ignore';

                return (
                  <tr key={col.key} className="hover:bg-[#FAFBFF]/80 transition-colors">
                    {/* Your Column */}
                    <td className="py-3.5 px-4 sm:px-6 font-medium">
                      <div className="flex flex-col">
                        <span>{col.originalLabel || col.key}</span>
                        {col.detectedType && (
                          <span className="text-[11px] text-[#5B6788] font-normal">
                            detected: {col.detectedType}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* First Values */}
                    <td className="py-3.5 px-4 sm:px-6 text-[#5B6788] tabular-nums text-xs">
                      <span className="truncate block max-w-[420px]" title={sampleText}>
                        {sampleText}
                      </span>
                    </td>

                    {/* Becomes Dropdown */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <select
                        aria-label={`Target field for column ${col.originalLabel || col.key}`}
                        value={currentMapped}
                        onChange={(e) => onChangeMapping(col.key, e.target.value)}
                        className={`w-full py-1.5 px-3 rounded-[6px] border border-[#17233F] text-xs font-medium bg-[#FFFFFF] text-[#17233F] focus:outline-none focus:ring-2 focus:ring-[#3A5BFF] ${
                          isIgnored ? 'text-[#5B6788] bg-[#FAFBFF]' : ''
                        }`}
                      >
                        <option value="ignore">Ignore this column</option>
                        <optgroup label="Standard CRM fields">
                          {STANDARD_CRM_SCHEMA.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* First-10 Records Preview Table */}
      {rows && rows.length > 0 && (
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-br overflow-hidden">
          <div className="p-4 sm:px-6 bg-[#FAFBFF] border-b-[1.5px] border-[#17233F]">
            <h2 className="font-display text-base font-bold text-[#17233F]">
              Data preview (showing first {Math.min(rows.length, 10)} of {recordCount} records)
            </h2>
            <p className="text-xs text-[#5B6788] mt-0.5">
              Source records detected from your uploaded file before applying cleaning rules.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-[1.5px] border-[#17233F] bg-[#FAFBFF] text-[#5B6788] font-semibold">
                  <th scope="col" className="py-2.5 px-4 w-12 text-center">#</th>
                  {columns.map((col) => (
                    <th key={col.key} scope="col" className="py-2.5 px-4 text-[#17233F]">
                      {col.originalLabel || col.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3F3] text-[#17233F]">
                {rows.slice(0, 10).map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-[#FAFBFF]/80">
                    <td className="py-2.5 px-4 text-center tabular-nums text-[#5B6788]">
                      {idx + 1}
                    </td>
                    {columns.map((col) => {
                      const val = String(row[col.key] ?? '');
                      return (
                        <td key={col.key} className="py-2.5 px-4 tabular-nums">
                          {val !== '' ? val : <span className="text-[#5B6788] italic">empty</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
