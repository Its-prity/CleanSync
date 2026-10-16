import { CellIssue } from '../../types/dataset';

const DOMAIN_TYPO_MAP: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'icld.com': 'icloud.com'
};

// Strict email regex requiring user, @, domain name, and at least one dot with valid TLD
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface CleanEmailResult {
  value: string;
  original: string;
  changed: boolean;
  ruleApplied?: string;
  issue?: CellIssue;
  isValid: boolean;
}

export function cleanEmail(
  raw: unknown,
  options: { fixTypos?: boolean; normalizeCase?: boolean } = {}
): CleanEmailResult {
  const original = String(raw ?? '');
  let value = original.trim();

  // Missing optional field → Warning only
  if (!value) {
    return {
      value: '',
      original,
      changed: false,
      isValid: true,
      issue: {
        type: 'missing_optional',
        message: 'Email address is missing',
        severity: 'warning',
        code: 'missing_optional'
      }
    };
  }

  let changed = false;
  let ruleApplied: string | undefined;

  // 1. Lowercase normalization
  if (options.normalizeCase !== false && value !== value.toLowerCase()) {
    value = value.toLowerCase();
    changed = true;
    ruleApplied = 'Normalized email casing to lowercase';
  }

  // 2. Fix common domain typos
  if (options.fixTypos !== false && value.includes('@')) {
    const parts = value.split('@');
    if (parts.length === 2) {
      const [user, domain] = parts;
      if (DOMAIN_TYPO_MAP[domain]) {
        const correctedDomain = DOMAIN_TYPO_MAP[domain];
        value = `${user}@${correctedDomain}`;
        changed = true;
        ruleApplied = `Auto-corrected domain typo @${domain} → @${correctedDomain}`;
      }
    }
  }

  // 3. Validation
  const isValid = EMAIL_REGEX.test(value);
  let issue: CellIssue | undefined;

  if (!isValid) {
    issue = {
      type: 'invalid_email',
      message: `Invalid email format "${value}"`,
      severity: 'error',
      code: 'invalid_email'
    };
  } else if (changed && ruleApplied?.includes('Auto-corrected')) {
    issue = {
      type: 'email_typo',
      message: ruleApplied,
      suggestedFix: value,
      severity: 'info',
      code: 'email_typo'
    };
  }

  return {
    value,
    original,
    changed: changed || original !== value,
    ruleApplied,
    issue,
    isValid
  };
}
