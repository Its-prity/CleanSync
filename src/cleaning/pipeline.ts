import { RowData } from '../types/dataset';
import { CleaningOptions, AuditChange, PipelineResult } from '../types/cleaning';
import { cleanEmail } from './rules/emailRules';
import { cleanPhone } from './rules/phoneRules';
import { cleanName } from './rules/nameRules';
import { cleanDate } from './rules/dateRules';
import { deduplicateRows } from './rules/dedupeRules';
import { analyzeDataset } from '../lib/detector';

export function runCleaningPipeline(
  rows: RowData[],
  options: CleaningOptions,
  columnMapping?: Record<string, string>
): PipelineResult {
  const auditLog: AuditChange[] = [];
  const processedRows: RowData[] = [];
  const timestamp = new Date().toISOString();

  // Deep clone rows to ensure original records are never mutated
  const inputRows: RowData[] = JSON.parse(JSON.stringify(rows));

  // Pass 1: Row-by-row mapping, cell cleaning, and validation
  inputRows.forEach((rawRow, idx) => {
    const originalRecord: Record<string, string> = { ...rawRow._original };
    const newRow: RowData = {
      _id: rawRow._id || `row-${idx + 1}`,
      _sourceRow: rawRow._sourceRow || idx + 2,
      _status: 'valid',
      _issues: {}
    };

    // Initialize _original if not present
    if (!rawRow._original || Object.keys(rawRow._original).length === 0) {
      for (const k of Object.keys(rawRow)) {
        if (!k.startsWith('_')) {
          originalRecord[k] = String(rawRow[k] ?? '');
        }
      }
    }
    // Apply column mapping or retain source columns
    if (columnMapping && Object.keys(columnMapping).length > 0) {
      for (const [srcKey, targetKey] of Object.entries(columnMapping)) {
        if (targetKey && targetKey !== 'ignore') {
          newRow[targetKey] = rawRow[srcKey] !== undefined ? rawRow[srcKey] : '';
          originalRecord[targetKey] = String(rawRow[srcKey] ?? '');
        }
      }
    } else {
      for (const k of Object.keys(rawRow)) {
        if (!k.startsWith('_')) {
          newRow[k] = rawRow[k];
          originalRecord[k] = String(rawRow[k] ?? '');
        }
      }
    }
    newRow._original = originalRecord;

    // 1. Name validation and title casing
    const nameKey = Object.keys(newRow).find(
      (k) => (k === 'full_name' || k === 'fullName' || k.toLowerCase().includes('name')) && !k.startsWith('_')
    );
    if (nameKey) {
      const before = String(newRow[nameKey] ?? '');
      const res = cleanName(before, { titleCase: options.titleCaseNames });
      newRow[nameKey] = res.value;
      if (res.changed) {
        auditLog.push({
          rowId: newRow._id,
          column: nameKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Title Case & Whitespace Cleanup',
          timestamp
        });
      }
      if (res.issue) {
        newRow._issues![nameKey] = res.issue;
      }
    }

    // 2. Email normalization and syntax validation
    const emailKey = Object.keys(newRow).find(
      (k) => (k === 'email' || k.toLowerCase().includes('email')) && !k.startsWith('_')
    );
    if (emailKey) {
      const before = String(newRow[emailKey] ?? '');
      const res = cleanEmail(before, {
        fixTypos: options.fixEmailTypos,
        normalizeCase: options.normalizeEmailCasing
      });
      newRow[emailKey] = res.value;
      if (res.changed) {
        auditLog.push({
          rowId: newRow._id,
          column: emailKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Email normalization',
          timestamp
        });
      }
      if (res.issue) {
        newRow._issues![emailKey] = res.issue;
      }
    }

    // 3. Phone number validation
    const phoneKey = Object.keys(newRow).find(
      (k) => (k === 'phone' || k.toLowerCase().includes('phone') || k.toLowerCase().includes('tel')) && !k.startsWith('_')
    );
    if (phoneKey) {
      const before = String(newRow[phoneKey] ?? '');
      const res = cleanPhone(before, { standardize: options.standardizePhones });
      newRow[phoneKey] = res.value;
      if (res.changed) {
        auditLog.push({
          rowId: newRow._id,
          column: phoneKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Phone standardization',
          timestamp
        });
      }
      if (res.issue) {
        newRow._issues![phoneKey] = res.issue;
      }
    }

    // 4. City whitespace trimming
    const cityKey = Object.keys(newRow).find(
      (k) => (k === 'city' || k.toLowerCase().includes('city') || k.toLowerCase().includes('town')) && !k.startsWith('_')
    );
    if (cityKey) {
      const before = String(newRow[cityKey] ?? '');
      const trimmed = before.trim();
      newRow[cityKey] = trimmed;
      if (trimmed !== before) {
        auditLog.push({
          rowId: newRow._id,
          column: cityKey,
          before,
          after: trimmed,
          ruleApplied: 'Trimmed whitespace from city',
          timestamp
        });
      }
      if (!trimmed) {
        newRow._issues![cityKey] = {
          type: 'missing_optional',
          message: 'City is missing',
          severity: 'warning',
          code: 'missing_optional'
        };
      }
    }

    // 5. Date standardization
    const dateKey = Object.keys(newRow).find(
      (k) => (k === 'signup_date' || k === 'signupDate' || k.toLowerCase().includes('date')) && !k.startsWith('_')
    );
    if (dateKey && options.standardizeDates) {
      const before = String(newRow[dateKey] ?? '');
      const res = cleanDate(before, { standardize: true });
      newRow[dateKey] = res.value;
      if (res.changed) {
        auditLog.push({
          rowId: newRow._id,
          column: dateKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Date standardization to ISO YYYY-MM-DD',
          timestamp
        });
      }
      if (res.issue) {
        newRow._issues![dateKey] = res.issue;
      }
    }

    processedRows.push(newRow);
  });

  // Pass 2: Duplicate Email Detection (after email lowercasing/normalization)
  const emailCol = Object.keys(processedRows[0] || {}).find(
    (k) => (k === 'email' || k.toLowerCase().includes('email')) && !k.startsWith('_')
  ) || 'email';

  const dedupeResult = deduplicateRows(processedRows, emailCol, options.dedupeStrategy);
  const activeRows = dedupeResult.uniqueRows;
  const duplicateRows = dedupeResult.duplicateRows;

  // Pass 3: Status Calculation and Segregation
  const cleanedRows: RowData[] = [];
  const quarantineRows: RowData[] = [];

  for (const row of activeRows) {
    const issues = Object.values(row._issues || {});
    const hasError = issues.some((iss) => iss.severity === 'error');
    const hasWarning = issues.some((iss) => iss.severity === 'warning');

    if (hasError) {
      row._status = 'invalid';
      quarantineRows.push(row);
    } else if (hasWarning) {
      row._status = 'warning';
      cleanedRows.push(row); // Warnings are non-invalid and kept in clean file
    } else {
      row._status = 'valid';
      cleanedRows.push(row);
    }
  }

  const initialAnalysis = analyzeDataset(inputRows);
  const finalAnalysis = analyzeDataset(cleanedRows);

  return {
    cleanedRows,
    quarantineRows,
    duplicateRows,
    auditLog,
    stats: {
      initialRows: rows.length,
      cleanCount: cleanedRows.length,
      validCount: cleanedRows.filter((r) => r._status === 'valid').length,
      warningCount: cleanedRows.filter((r) => r._status === 'warning').length,
      invalidCount: quarantineRows.length,
      duplicateCount: duplicateRows.length,
      totalModifications: auditLog.length,
      initialScore: initialAnalysis.healthScore.score,
      finalScore: finalAnalysis.healthScore.score
    } as any
  };
}
