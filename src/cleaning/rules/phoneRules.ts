import { CellIssue } from '../../types/dataset';

export interface CleanPhoneResult {
  value: string;
  original: string;
  changed: boolean;
  ruleApplied?: string;
  issue?: CellIssue;
  isValid: boolean;
}

export function cleanPhone(raw: unknown, options: { standardize?: boolean } = {}): CleanPhoneResult {
  const original = String(raw ?? '');
  const trimmed = original.trim();

  // Missing phone is a warning, not a fatal error
  if (!trimmed) {
    return {
      value: '',
      original,
      changed: false,
      isValid: true,
      issue: {
        type: 'missing_optional',
        message: 'Phone number is missing',
        severity: 'warning',
        code: 'missing_optional'
      }
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
        severity: 'error',
        code: 'malformed_phone'
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
        severity: 'error',
        code: 'malformed_phone'
      }
    };
  }

  let formatted = trimmed;
  let changed = false;
  let ruleApplied: string | undefined;

  if (options.standardize !== false) {
    if (digits.length === 10) {
      formatted = digits; // Keep standard digits or format (9876543210)
      if (formatted !== trimmed) {
        changed = true;
        ruleApplied = 'Standardized 10-digit phone number';
      }
    } else if (digits.length === 11 && digits.startsWith('1')) {
      formatted = `+1${digits.slice(1)}`;
      if (formatted !== trimmed) {
        changed = true;
        ruleApplied = 'Standardized to E.164 +1';
      }
    } else if (digits.length > 10) {
      formatted = `+${digits}`;
      if (formatted !== trimmed) {
        changed = true;
        ruleApplied = 'Standardized international phone number';
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
