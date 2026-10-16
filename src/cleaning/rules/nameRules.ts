import { CellIssue } from '../../types/dataset';

export interface CleanNameResult {
  value: string;
  original: string;
  changed: boolean;
  ruleApplied?: string;
  issue?: CellIssue;
  isValid: boolean;
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-|')\S/g, (char) => char.toUpperCase());
}

export function cleanName(raw: unknown, options: { titleCase?: boolean } = {}): CleanNameResult {
  const original = String(raw ?? '');
  // Collapse multiple internal whitespaces and trim leading/trailing
  let value = original.replace(/\s+/g, ' ').trim();

  // Empty or whitespace-only name → Error
  if (!value) {
    return {
      value: '',
      original,
      changed: false,
      isValid: false,
      issue: {
        type: 'missing_required',
        message: 'Customer name is required',
        severity: 'error',
        code: 'missing_required'
      }
    };
  }

  let changed = false;
  let ruleApplied: string | undefined;

  if (options.titleCase !== false) {
    const titleCased = toTitleCase(value);
    if (titleCased !== value || original !== value) {
      changed = true;
      ruleApplied = 'Converted to Title Case & collapsed whitespace';
      value = titleCased;
    }
  }

  return {
    value,
    original,
    changed: changed || original !== value,
    ruleApplied,
    issue: undefined,
    isValid: true
  };
}
