import { ColumnMeta, DataType, HealthScore, RowData, CellIssue } from '../types/dataset';
import { cleanEmail } from '../cleaning/rules/emailRules';
import { cleanPhone } from '../cleaning/rules/phoneRules';
import { cleanDate } from '../cleaning/rules/dateRules';

export function detectColumnType(values: any[]): DataType {
  const nonNullValues = values
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    .map((v) => String(v).trim());

  if (nonNullValues.length === 0) return 'text';

  let emailCount = 0;
  let phoneCount = 0;
  let dateCount = 0;
  let numberCount = 0;
  let idCount = 0;

  for (const val of nonNullValues.slice(0, 50)) {
    // ID check
    if (/^(cust|id|uid|rec|usr|client)[-_]?[0-9a-zA-Z]+/i.test(val)) {
      idCount++;
      continue;
    }
    // Email check
    if (val.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      emailCount++;
      continue;
    }
    // Date check
    if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(val) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(val) || (!isNaN(Date.parse(val)) && val.length > 5 && !/^\d+$/.test(val))) {
      dateCount++;
      continue;
    }
    // Phone check
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15 && (/^[\d+()\s-]+$/.test(val) || val.includes('-') || val.startsWith('+'))) {
      phoneCount++;
      continue;
    }
    // Numeric check
    if (!isNaN(Number(val))) {
      numberCount++;
      continue;
    }
  }

  const sampleSize = Math.min(nonNullValues.length, 50);
  if (emailCount / sampleSize > 0.4) return 'email';
  if (phoneCount / sampleSize > 0.4) return 'phone';
  if (idCount / sampleSize > 0.4) return 'id';
  if (dateCount / sampleSize > 0.4) return 'date';
  if (numberCount / sampleSize > 0.6) return 'number';

  return 'text';
}

export function analyzeDataset(rows: RowData[], columnKeys?: string[]): { columns: ColumnMeta[]; healthScore: HealthScore } {
  if (rows.length === 0) {
    return {
      columns: [],
      healthScore: {
        score: 100,
        grade: 'A+',
        breakdown: {
          totalRows: 0,
          totalCells: 0,
          invalidEmails: 0,
          emailTypos: 0,
          malformedPhones: 0,
          casingIssues: 0,
          invalidDates: 0,
          missingRequired: 0,
          duplicateRows: 0
        },
        summaryText: 'No data loaded'
      }
    };
  }

  const keys = columnKeys || Object.keys(rows[0]).filter((k) => !k.startsWith('_'));

  const columns: ColumnMeta[] = keys.map((key) => {
    const values = rows.map((r) => r[key]);
    const detectedType = detectColumnType(values);
    const nonNull = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');

    return {
      key,
      originalLabel: key,
      detectedType,
      sampleValues: nonNull.slice(0, 3).map(String),
      totalValues: values.length,
      emptyCount: values.length - nonNull.length,
      invalidCount: 0
    };
  });

  // Calculate Health Score & identify cell issues
  let invalidEmails = 0;
  let emailTypos = 0;
  let malformedPhones = 0;
  let casingIssues = 0;
  let invalidDates = 0;
  let missingRequired = 0;
  let duplicateRows = 0;

  const seenEmails = new Set<string>();

  for (const row of rows) {
    const issues: Record<string, CellIssue> = {};

    // Check each column
    for (const col of columns) {
      const val = row[col.key];
      const strVal = String(val ?? '').trim();

      if (!strVal) {
        if (col.key === 'fullName' || col.key === 'full_name' || (col.key.toLowerCase().includes('name') && !col.key.toLowerCase().includes('company'))) {
          missingRequired++;
          issues[col.key] = {
            type: 'missing_required',
            message: `Required field ${col.originalLabel} is missing`,
            severity: 'error'
          };
        } else {
          issues[col.key] = {
            type: 'missing_optional',
            message: `${col.originalLabel} is missing`,
            severity: 'warning'
          };
        }
        continue;
      }

      if (col.detectedType === 'email' || col.key.toLowerCase().includes('email')) {
        const res = cleanEmail(strVal);
        if (!res.isValid) {
          invalidEmails++;
          issues[col.key] = res.issue!;
        } else if (res.issue?.type === 'email_typo') {
          emailTypos++;
          issues[col.key] = res.issue;
        }

        const normEmail = strVal.toLowerCase();
        if (seenEmails.has(normEmail)) {
          duplicateRows++;
          issues[col.key] = {
            type: 'duplicate',
            message: `Duplicate email detected: ${strVal}`,
            severity: 'warning'
          };
        } else {
          seenEmails.add(normEmail);
        }
      }

      if (col.detectedType === 'phone' || col.key.toLowerCase().includes('phone') || col.key.toLowerCase().includes('tel')) {
        const res = cleanPhone(strVal);
        if (!res.isValid) {
          malformedPhones++;
          issues[col.key] = res.issue!;
        }
      }

      if (col.detectedType === 'date' || col.key.toLowerCase().includes('date')) {
        const res = cleanDate(strVal);
        if (!res.isValid) {
          invalidDates++;
          issues[col.key] = res.issue!;
        }
      }

      if (col.key === 'fullName' || (col.detectedType === 'text' && col.key.toLowerCase().includes('name'))) {
        if (strVal === strVal.toUpperCase() || strVal === strVal.toLowerCase() || /\s{2,}/.test(strVal)) {
          casingIssues++;
          issues[col.key] = {
            type: 'inconsistent_casing',
            message: 'Inconsistent casing or excessive whitespace',
            suggestedFix: 'Convert to Title Case',
            severity: 'info'
          };
        }
      }
    }

    if (!row._issues || Object.keys(row._issues).length === 0) {
      row._issues = issues;
    }
  }

  const totalCells = rows.length * columns.length;
  const totalDeductions =
    invalidEmails * 8 +
    malformedPhones * 6 +
    invalidDates * 5 +
    missingRequired * 7 +
    duplicateRows * 6 +
    emailTypos * 3 +
    casingIssues * 1.5;

  const penaltyRatio = totalCells > 0 ? (totalDeductions / totalCells) : 0;
  const rawScore = Math.max(10, Math.min(100, Math.round(100 - penaltyRatio * 100)));

  let grade: HealthScore['grade'] = 'F';
  if (rawScore >= 95) grade = 'A+';
  else if (rawScore >= 85) grade = 'A';
  else if (rawScore >= 75) grade = 'B';
  else if (rawScore >= 65) grade = 'C';
  else if (rawScore >= 50) grade = 'D';

  let summaryText = 'Excellent quality! Ready for export.';
  if (rawScore < 70) summaryText = 'Substantial data issues detected. Recommended to run CleanSync pipeline.';
  else if (rawScore < 90) summaryText = 'Minor formatting and casing fixes recommended.';

  return {
    columns,
    healthScore: {
      score: rawScore,
      grade,
      breakdown: {
        totalRows: rows.length,
        totalCells,
        invalidEmails,
        emailTypos,
        malformedPhones,
        casingIssues,
        invalidDates,
        missingRequired,
        duplicateRows
      },
      summaryText
    }
  };
}
