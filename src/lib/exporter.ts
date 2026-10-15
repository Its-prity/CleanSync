import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RowData } from '../types/dataset';
import { AuditChange } from '../types/cleaning';

function sanitizeRowsForExport(rows: RowData[]): Record<string, any>[] {
  return rows.map((row) => {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (!k.startsWith('_')) {
        cleanObj[k] = v;
      }
    }
    return cleanObj;
  });
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
