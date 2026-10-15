import { CellIssue } from '../../types/dataset';

export interface CleanPhoneResult {
  value: string;
  original: string;
  changed: boolean;
  ruleApplied?: string;
  issue?: CellIssue;
  isValid: boolean;
}

export function cleanPhone(raw: any, options: { standardize?: boolean } = {}): CleanPhoneResult {
  const original = String(raw ?? '');
  const trimmed = original.trim();

  if (!trimmed) {
    return {
      value: '',
      original,
      changed: false,
      isValid: true, // Phone might be optional, empty is handled by missing_required check if configured
      issue: undefined
    };
  }

  // Check for words/letters (e.g. 800-IRON-MAN, invalid_phone)
  const hasLetters = /[a-zA-Z]/.test(trimmed);
  if (hasLetters) {
    return {
      value: trimmed,
      original,
      changed: false,
      isValid: false,
      issue: {
        type: 'malformed_phone',
        message: `Contains alphabetical characters: "${trimmed}"`,
        severity: 'error'
      }
    };
  }

  // Extract digits
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length < 10) {
    return {
      value: trimmed,
      original,
      changed: false,
      isValid: false,
      issue: {
        type: 'malformed_phone',
        message: `Phone number has only ${digits.length} digits (minimum 10 required)`,
        severity: 'error'
      }
    };
  }

  let formatted = trimmed;
  let changed = false;
  let ruleApplied: string | undefined;

  if (options.standardize !== false) {
    if (digits.length === 10) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      if (formatted !== trimmed) {
        changed = true;
        ruleApplied = 'Formatted to standard national (XXX) XXX-XXXX';
      }
    } else if (digits.length === 11 && digits.startsWith('1')) {
      formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      if (formatted !== trimmed) {
        changed = true;
        ruleApplied = 'Formatted to E.164 +1 (XXX) XXX-XXXX';
      }
    } else if (digits.length > 10) {
      // International or extended digits
      formatted = `+${digits}`;
      if (formatted !== trimmed) {
        changed = true;
        ruleApplied = 'Formatted with international prefix';
      }
    }
  }

  return {
    value: formatted,
    original,
    changed: changed || original !== formatted,
    ruleApplied,
    isValid: true,
    issue: undefined
  };
}
