import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RowData } from '../types/dataset';
import { AuditChange } from '../types/cleaning';

export function neutralizeFormula(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.length > 0) {
    const firstChar = str.charAt(0);
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
      return `'${str}`;
    }
  }
  return str;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function sanitizeRowsForExport(rows: RowData[]): Record<string, string>[] {
  return rows.map((row) => {
    const cleanObj: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      if (!k.startsWith('_')) {
        cleanObj[k] = neutralizeFormula(v);
      }
    }
    return cleanObj;
  });
}

export function exportCleanedCsv(rows: RowData[], filename: string) {
  // Contains non-invalid rows, normalized values, and source row numbers
  const exportData = rows.map((row) => {
    const obj: Record<string, string> = {
      source_row: String(row._sourceRow ?? ''),
    };
    for (const [k, v] of Object.entries(row)) {
      if (!k.startsWith('_')) {
        obj[k] = neutralizeFormula(v);
      }
    }
    return obj;
  });

  const csvContent = Papa.unparse(exportData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportIssuesCsv(rows: RowData[], filename: string) {
  // Lists every issue with row number, field, severity, code, and message
  const issuesData: {
    row_number: number | string;
    field: string;
    severity: string;
    code: string;
    message: string;
  }[] = [];

  for (const row of rows) {
    if (row._issues) {
      for (const [field, issue] of Object.entries(row._issues)) {
        issuesData.push({
          row_number: row._sourceRow ?? '',
          field: neutralizeFormula(field),
          severity: neutralizeFormula(issue.severity),
          code: neutralizeFormula(issue.code || issue.type),
          message: neutralizeFormula(issue.message),
        });
      }
    }
  }

  const csvContent = Papa.unparse(issuesData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportFullReviewCsv(rows: RowData[], filename: string) {
  // Contains all rows with status, issue summaries, and data
  const exportData = rows.map((row) => {
    const issueSummaries = Object.entries(row._issues || {})
      .map(([f, iss]) => `${f}: ${iss.message}`)
      .join('; ');

    const obj: Record<string, string> = {
      row_number: String(row._sourceRow ?? ''),
      status: neutralizeFormula(row._status ?? 'valid'),
      issues: neutralizeFormula(issueSummaries),
    };

    for (const [k, v] of Object.entries(row)) {
      if (!k.startsWith('_')) {
        obj[k] = neutralizeFormula(v);
      }
    }
    return obj;
  });

  const csvContent = Papa.unparse(exportData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportToCsv(rows: RowData[], filename: string) {
  const cleanData = sanitizeRowsForExport(rows);
  const csvContent = Papa.unparse(cleanData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportToXlsx(rows: RowData[], filename: string) {
  const cleanData = sanitizeRowsForExport(rows);
  const worksheet = XLSX.utils.json_to_sheet(cleanData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CleanData');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function exportAuditJson(auditLog: AuditChange[], stats: any, filename: string) {
  const report = {
    generatedAt: new Date().toISOString(),
    stats,
    auditTrail: auditLog
  };
  const jsonContent = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

