import { RowData } from '../../types/dataset';
import { CleaningOptions } from '../../types/cleaning';

export interface DedupeResult {
  uniqueRows: RowData[];
  duplicateRows: RowData[];
  duplicateCount: number;
}

export function deduplicateRows(
  rows: RowData[],
  key: string = 'email',
  strategy: CleaningOptions['dedupeStrategy'] = 'keep_first'
): DedupeResult {
  const emailCounts = new Map<string, number>();

  const getDedupeVal = (row: RowData): string => {
    const val = String(row[key] ?? '').trim();
    if (!val) return ''; // Empty emails/values never count as duplicates of each other
    if (key.toLowerCase().includes('email')) return val.toLowerCase();
    if (key.toLowerCase().includes('phone')) return val.replace(/\D/g, '');
    return val;
  };

  // Pass 1: Count non-empty normalized occurrences
  for (const row of rows) {
    const dVal = getDedupeVal(row);
    if (dVal) {
      emailCounts.set(dVal, (emailCounts.get(dVal) || 0) + 1);
    }
  }

  const duplicates: RowData[] = [];
  const uniqueList: RowData[] = [];

  // Pass 2: Flag duplicates. When strategy is keep_first or flag_only, flag both rows as Warning
  for (const row of rows) {
    const dVal = getDedupeVal(row);
    const count = dVal ? emailCounts.get(dVal) || 0 : 0;

    if (count > 1) {
      // Flag as duplicate warning
      const markedRow: RowData = {
        ...row,
        _issues: {
          ...row._issues,
          [key]: {
            type: 'duplicate',
            code: 'duplicate_email',
            message: `Duplicate email detected: "${row[key]}"`,
            severity: 'warning'
          }
        }
      };
      if (markedRow._status !== 'invalid' && markedRow._status !== 'quarantined') {
        markedRow._status = 'warning';
      }
      duplicates.push(markedRow);

      if (strategy === 'quarantine') {
        // Quarantine duplicate rows
      } else {
        // By default, neither merged nor removed: preserved in output
        uniqueList.push(markedRow);
      }
    } else {
      uniqueList.push(row);
    }
  }

  return {
    uniqueRows: uniqueList,
    duplicateRows: duplicates,
    duplicateCount: duplicates.length
  };
}
