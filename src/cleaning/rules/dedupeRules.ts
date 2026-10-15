import { RowData } from '../../types/dataset';
import { CleaningOptions } from '../../types/cleaning';

export interface DedupeResult {
  uniqueRows: RowData[];
  duplicateRows: RowData[];
  duplicateCount: number;
}

export function deduplicateRows(
  rows: RowData[],
  key: 'email' | 'phone',
  strategy: CleaningOptions['dedupeStrategy']
): DedupeResult {
  const seenMap = new Map<string, RowData>();
  const duplicates: RowData[] = [];
  const uniqueList: RowData[] = [];

  const getDedupeKey = (row: RowData): string => {
    const val = String(row[key] ?? '').trim();
    if (!val) return ''; // Empty values are not treated as duplicate collisions
    if (key === 'email') return val.toLowerCase();
    if (key === 'phone') return val.replace(/\D/g, '');
    return val;
  };

  if (strategy === 'keep_last') {
    // Reverse pass
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      const dedupKey = getDedupeKey(row);
      if (dedupKey && seenMap.has(dedupKey)) {
        const markedRow = {
          ...row,
          _status: 'duplicate' as const,
          _issues: {
            ...row._issues,
            [key]: {
              type: 'duplicate' as const,
              message: `Duplicate ${key} detected (${row[key]})`,
              severity: 'warning' as const
            }
          }
        };
        duplicates.push(markedRow);
      } else {
        if (dedupKey) seenMap.set(dedupKey, row);
        uniqueList.unshift(row);
      }
    }
  } else {
    // Default: 'keep_first' or 'quarantine'
    for (const row of rows) {
      const dedupKey = getDedupeKey(row);
      if (dedupKey && seenMap.has(dedupKey)) {
        const markedRow = {
          ...row,
          _status: 'duplicate' as const,
          _issues: {
            ...row._issues,
            [key]: {
              type: 'duplicate' as const,
              message: `Duplicate ${key} detected: "${row[key]}"`,
              severity: 'warning' as const
            }
          }
        };
        duplicates.push(markedRow);
        if (strategy === 'quarantine') {
          // Both or second is quarantined
        }
      } else {
        if (dedupKey) seenMap.set(dedupKey, row);
        uniqueList.push(row);
      }
    }
  }

  return {
    uniqueRows: uniqueList,
    duplicateRows: duplicates,
    duplicateCount: duplicates.length
  };
}
