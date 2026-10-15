import { CellIssue } from '../../types/dataset';

export interface CleanDateResult {
  value: string;
  original: string;
  changed: boolean;
  ruleApplied?: string;
  issue?: CellIssue;
  isValid: boolean;
}

export function cleanDate(raw: any, options: { standardize?: boolean } = {}): CleanDateResult {
  const original = String(raw ?? '');
  const trimmed = original.trim();

  if (!trimmed) {
    return {
      value: '',
      original,
      changed: false,
      isValid: true,
      issue: undefined
    };
  }

  // Check if it's an unparseable word like "invalid-date"
  if (trimmed.toLowerCase().includes('invalid')) {
    return {
      value: trimmed,
      original,
      changed: false,
      isValid: false,
      issue: {
        type: 'invalid_date',
        message: `Unparseable date "${trimmed}"`,
        severity: 'error'
      }
    };
  }

  // Try parsing date
  let parsedDate: Date | null = null;

  // Handle slash formats MM/DD/YYYY or DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [p1, p2, year] = trimmed.split('/').map(Number);
    // Assume MM/DD/YYYY if p1 <= 12 and p2 <= 31
    parsedDate = new Date(year, p1 - 1, p2);
  } else if (/^\d{4}[/.]\d{1,2}[/.]\d{1,2}$/.test(trimmed)) {
    // YYYY/MM/DD or YYYY.MM.DD
    const [year, month, day] = trimmed.split(/[/.]/).map(Number);
    parsedDate = new Date(year, month - 1, day);
  } else {
    const timestamp = Date.parse(trimmed);
    if (!isNaN(timestamp)) {
      parsedDate = new Date(timestamp);
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return {
      value: trimmed,
      original,
      changed: false,
      isValid: false,
      issue: {
        type: 'invalid_date',
        message: `Malformed date "${trimmed}"`,
        severity: 'error'
      }
    };
  }

  // Format as ISO YYYY-MM-DD
  const yyyy = parsedDate.getFullYear();
  const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(parsedDate.getDate()).padStart(2, '0');
  const isoDate = `${yyyy}-${mm}-${dd}`;

  const changed = options.standardize !== false && isoDate !== trimmed;
  const ruleApplied = changed ? 'Normalized date format to ISO YYYY-MM-DD' : undefined;

  return {
    value: options.standardize !== false ? isoDate : trimmed,
    original,
    changed,
    ruleApplied,
    isValid: true,
    issue: undefined
  };
}
