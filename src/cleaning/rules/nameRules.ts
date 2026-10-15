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

export function cleanName(raw: any, options: { titleCase?: boolean } = {}): CleanNameResult {
  const original = String(raw ?? '');
  let value = original.replace(/\s+/g, ' ').trim();

  if (!value) {
    return {
      value: '',
      original,
      changed: false,
      isValid: false,
      issue: {
        type: 'missing_required',
        message: 'Name is empty',
        severity: 'error'
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
    isValid: true,
    issue: undefined
  };
}
