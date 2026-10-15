import React from 'react';
import { ColumnMeta } from '../../types/dataset';
import { STANDARD_CRM_SCHEMA, ColumnMapping } from '../../types/schema';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface SchemaMapperProps {
  columns: ColumnMeta[];
  mapping: ColumnMapping;
  onChangeMapping: (sourceKey: string, targetKey: string) => void;
  onAutoMap: () => void;
}

export const SchemaMapper: React.FC<SchemaMapperProps> = ({
  columns,
  mapping,
  onChangeMapping,
  onAutoMap
}) => {
  return (
    <div className="schema-mapper-card">
      <div className="schema-header">
        <div>
          <h3 className="section-title">Column Schema Mapping</h3>
          <p className="section-sub">
            Verify or remap detected columns into CleanSync target CRM schema
          </p>
        </div>
        <button onClick={onAutoMap} className="btn btn-outline btn-sm" id="btn-auto-map">
          <Sparkles size={14} className="icon-emerald" />
          <span>Auto-Match Columns</span>
        </button>
      </div>

      <div className="mapping-table-wrap">
        <table className="mapping-table">
          <thead>
            <tr>
              <th>Uploaded Column</th>
              <th>Detected Type</th>
              <th>Sample Values</th>
              <th style={{ width: '40px' }}></th>
              <th>Target Standard Field</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => {
              const currentMappedTarget = mapping[col.key] || col.key;
              const isMapped = currentMappedTarget && currentMappedTarget !== 'ignore';

              return (
                <tr key={col.key}>
                  <td>
                    <div className="col-name-badge">
                      <span className="font-medium text-white">{col.originalLabel}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`type-tag type-${col.detectedType}`}>
                      {col.detectedType}
                    </span>
                  </td>
                  <td>
                    <span className="sample-text" title={col.sampleValues.join(', ')}>
                      {col.sampleValues.slice(0, 2).join(', ') || '—'}
                    </span>
                  </td>
                  <td className="text-center">
                    <ArrowRight size={14} className="text-muted" />
                  </td>
                  <td>
                    <div className="select-wrap">
                      <select
                        value={currentMappedTarget}
                        onChange={(e) => onChangeMapping(col.key, e.target.value)}
                        className={`mapping-select ${isMapped ? 'mapped' : ''}`}
                      >
                        <option value="ignore">❌ Ignore (Do not export)</option>
                        <optgroup label="Standard CRM Schema">
                          {STANDARD_CRM_SCHEMA.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label} {field.required ? '*' : ''} ({field.type})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      {isMapped && <Check size={14} className="select-check-icon icon-emerald" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
