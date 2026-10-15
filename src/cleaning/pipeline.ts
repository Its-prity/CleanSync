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

  // Pass 1: Row-by-row cell cleaning and field mapping
  for (const rawRow of rows) {
    const originalRecord: Record<string, string> = { ...rawRow._original };
    const newRow: RowData = {
      ...rawRow,
      _id: rawRow._id || `row-${Math.random().toString(36).substring(2, 9)}`,
      _status: 'valid',
      _issues: {}
    };

    // Store original if not already stored
    if (!rawRow._original) {
      for (const k of Object.keys(rawRow)) {
        if (!k.startsWith('_')) {
          originalRecord[k] = String(rawRow[k] ?? '');
        }
      }
    }
    newRow._original = originalRecord;

    // Field mapping application if target key is specified
    if (columnMapping) {
      for (const [srcKey, targetKey] of Object.entries(columnMapping)) {
        if (targetKey && targetKey !== 'ignore' && targetKey !== srcKey && newRow[srcKey] !== undefined) {
          newRow[targetKey] = newRow[srcKey];
        }
      }
    }

    // Cleaning rules per field
    // 1. Full Name / Name
    const nameKey = Object.keys(newRow).find((k) => k === 'fullName' || k.toLowerCase().includes('name') && !k.startsWith('_'));
    if (nameKey && options.titleCaseNames) {
      const before = String(newRow[nameKey] ?? '');
      const res = cleanName(before, { titleCase: true });
      if (res.changed) {
        newRow[nameKey] = res.value;
        auditLog.push({
          rowId: newRow._id,
          column: nameKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Title Case Conversion',
          timestamp
        });
      }
      if (!res.isValid && res.issue) {
        newRow._issues = { ...newRow._issues, [nameKey]: res.issue };
      }
    }

    // 2. Email Address
    const emailKey = Object.keys(newRow).find((k) => k === 'email' || k.toLowerCase().includes('email') && !k.startsWith('_'));
    if (emailKey) {
      const before = String(newRow[emailKey] ?? '');
      const res = cleanEmail(before, {
        fixTypos: options.fixEmailTypos,
        normalizeCase: options.normalizeEmailCasing
      });
      if (res.changed) {
        newRow[emailKey] = res.value;
        auditLog.push({
          rowId: newRow._id,
          column: emailKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Email normalization',
          timestamp
        });
      }
      if (!res.isValid && res.issue) {
        newRow._issues = { ...newRow._issues, [emailKey]: res.issue };
      }
    }

    // 3. Phone Number
    const phoneKey = Object.keys(newRow).find((k) => k === 'phone' || k.toLowerCase().includes('phone') || k.toLowerCase().includes('tel') && !k.startsWith('_'));
    if (phoneKey && options.standardizePhones) {
      const before = String(newRow[phoneKey] ?? '');
      const res = cleanPhone(before, { standardize: true });
      if (res.changed) {
        newRow[phoneKey] = res.value;
        auditLog.push({
          rowId: newRow._id,
          column: phoneKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Phone standardization',
          timestamp
        });
      }
      if (!res.isValid && res.issue) {
        newRow._issues = { ...newRow._issues, [phoneKey]: res.issue };
      }
    }

    // 4. Date
    const dateKey = Object.keys(newRow).find((k) => k === 'signupDate' || k.toLowerCase().includes('date') && !k.startsWith('_'));
    if (dateKey && options.standardizeDates) {
      const before = String(newRow[dateKey] ?? '');
      const res = cleanDate(before, { standardize: true });
      if (res.changed) {
        newRow[dateKey] = res.value;
        auditLog.push({
          rowId: newRow._id,
          column: dateKey,
          before,
          after: res.value,
          ruleApplied: res.ruleApplied || 'Date standardization to ISO YYYY-MM-DD',
          timestamp
        });
      }
      if (!res.isValid && res.issue) {
        newRow._issues = { ...newRow._issues, [dateKey]: res.issue };
      }
    }

    processedRows.push(newRow);
  }

  // Pass 2: Deduplication
  let uniqueRows = processedRows;
  let duplicateRows: RowData[] = [];

  if (options.deduplicate) {
    const dedupeRes = deduplicateRows(processedRows, options.dedupeKey, options.dedupeStrategy);
    uniqueRows = dedupeRes.uniqueRows;
    duplicateRows = dedupeRes.duplicateRows;

    for (const dup of duplicateRows) {
      auditLog.push({
        rowId: dup._id,
        column: options.dedupeKey,
        before: String(dup[options.dedupeKey] ?? ''),
        after: '[DUPLICATE REMOVED]',
        ruleApplied: `Deduplication (${options.dedupeStrategy})`,
        timestamp
      });
    }
  }

  // Pass 3: Segregation into Clean vs Quarantine
  const cleanedRows: RowData[] = [];
  const quarantineRows: RowData[] = [];

  for (const row of uniqueRows) {
    const issues = Object.values(row._issues || {});
    const hasFatalError = issues.some((iss) => iss.severity === 'error');

    if (hasFatalError && options.quarantineInvalidRows) {
      row._status = 'quarantined';
      quarantineRows.push(row);
    } else {
      row._status = 'cleaned';
      cleanedRows.push(row);
    }
  }

  // If deduplication strategy was quarantine, add duplicates to quarantine
  if (options.deduplicate && options.dedupeStrategy === 'quarantine') {
    quarantineRows.push(...duplicateRows);
  }

  // Quality score analysis
  const initialAnalysis = analyzeDataset(rows);
  const finalAnalysis = analyzeDataset(cleanedRows);

  return {
    cleanedRows,
    quarantineRows,
    duplicateRows,
    auditLog,
    stats: {
      initialRows: rows.length,
      cleanCount: cleanedRows.length,
      quarantineCount: quarantineRows.length,
      duplicateCount: duplicateRows.length,
      totalModifications: auditLog.length,
      initialScore: initialAnalysis.healthScore.score,
      finalScore: finalAnalysis.healthScore.score
    }
  };
}
