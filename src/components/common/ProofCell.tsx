import React from 'react';
import { CellIssue } from '../../types/dataset';

interface ProofCellProps {
  original?: string;
  clean?: string;
  issue?: CellIssue | { severity: 'error' | 'warning' | 'info'; message: string; type?: string };
  className?: string;
}

export const ProofCell: React.FC<ProofCellProps> = ({
  original,
  clean,
  issue,
  className = '',
}) => {
  const origStr = original !== undefined && original !== null ? String(original) : '';
  const cleanStr = clean !== undefined && clean !== null ? String(clean) : '';

  // Check if missing / empty value
  if (cleanStr.trim() === '') {
    if (issue?.severity === 'error' || issue?.type === 'missing_required') {
      return (
        <span
          className={`inline-block px-1.5 py-0.5 text-[11px] font-medium rounded-[4px] bg-[#FFE1E7] text-[#E5385B] border border-[#E5385B]/30 ${className}`}
          title={issue?.message || 'Missing required value'}
        >
          missing
        </span>
      );
    }
    return (
      <span
        className={`inline-block px-1.5 py-0.5 text-[11px] font-medium rounded-[4px] bg-[#FFE1E7] text-[#E5385B] border border-[#E5385B]/20 ${className}`}
        title={issue?.message || 'Empty value'}
      >
        empty
      </span>
    );
  }

  // Was value corrected / normalized?
  const isChanged = original !== undefined && origStr !== cleanStr;

  if (isChanged) {
    return (
      <span className={`inline-flex items-center flex-wrap gap-1 tabular-nums ${className}`}>
        <s
          className="text-[#E5385B] [text-decoration-line:line-through] [text-decoration-thickness:2px] whitespace-pre-wrap font-normal"
          title={`Original: "${origStr}"`}
        >
          {origStr}
        </s>
        <mark
          className="bg-[#FFE45C] text-[#17233F] px-1 py-0 rounded-[3px] font-medium no-underline inline-block"
          title={`Cleaned: "${cleanStr}"`}
        >
          {cleanStr}
        </mark>
      </span>
    );
  }

  // Value unchanged
  return (
    <span className={`text-[#17233F] tabular-nums ${className}`}>
      {cleanStr}
    </span>
  );
};
