import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RowData } from '../types/dataset';

export interface ParseResult {
  filename: string;
  rows: RowData[];
  columns: string[];
  fileType: 'csv' | 'xlsx' | 'tsv' | 'json';
}

export async function parseFile(file: File): Promise<ParseResult> {
  if (file.size === 0) {
    throw new Error('The selected file is empty (0 bytes). Please upload a file containing customer data.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  const supportedExtensions = ['csv', 'tsv', 'xlsx', 'xls', 'json'];
  if (!supportedExtensions.includes(extension)) {
    throw new Error(`Unsupported file type ".${extension}". Please upload a .csv, .tsv, .xlsx, or .json file.`);
  }

  // Sniff magic bytes for PDF
  const previewText = await file.slice(0, 16).text();
  if (previewText.startsWith('%PDF-')) {
    throw new Error('The selected file is a PDF document, even though it has a spreadsheet extension. Please upload a valid CSV or spreadsheet file.');
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else if (extension === 'json') {
    return parseJsonFile(file);
  } else {
    return parseCsvFile(file);
  }
}

function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const seenHeaders = new Map<string, number>();

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header: string) => {
        // Strip UTF-8 BOM and leading/trailing whitespace
        const clean = header.replace(/^\uFEFF/, '').trim();
        const base = clean || 'Unnamed Column';
        const count = seenHeaders.get(base) || 0;
        seenHeaders.set(base, count + 1);
        if (count > 0) {
          return `${base}_${count + 1}`;
        }
        return base;
      },
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          if (results.meta.fields && results.meta.fields.length > 0) {
            return reject(new Error('File contains only headers with no data rows. Add customer records to process.'));
          }
          return reject(new Error('CSV file contains no readable data or could not be parsed.'));
        }

        const columns = results.meta.fields || Object.keys(results.data[0]);
        const rows: RowData[] = results.data.map((rawRow, idx) => {
          const rowObj: RowData = {
            _id: `row-${idx + 1}`,
            _sourceRow: idx + 2, // header row is line 1, first data row is line 2
            _original: {}
          };
          for (const col of columns) {
            const val = rawRow[col] !== undefined && rawRow[col] !== null ? String(rawRow[col]) : '';
            rowObj[col] = val;
            rowObj._original![col] = val;
          }
          return rowObj;
        });

        resolve({
          filename: file.name,
          rows,
          columns,
          fileType: file.name.endsWith('.tsv') ? 'tsv' : 'csv'
        });
      },
      error: (error) => reject(new Error(`Failed to parse CSV: ${error.message}`))
    });
  });
}

async function parseExcelFile(file: File): Promise<ParseResult> {
  let workbook: XLSX.WorkBook;
  try {
    const arrayBuffer = await file.arrayBuffer();
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  } catch {
    throw new Error('Could not read Excel file. Verify that the file is not corrupted or password-protected.');
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel workbook contains no sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  if (jsonData.length === 0) {
    throw new Error('Excel sheet contains no data rows.');
  }

  const columns = Object.keys(jsonData[0]);
  const rows: RowData[] = jsonData.map((rawRow, idx) => {
    const rowObj: RowData = {
      _id: `row-${idx + 1}`,
      _sourceRow: idx + 2,
      _original: {}
    };
    for (const col of columns) {
      const val = String(rawRow[col] ?? '');
      rowObj[col] = val;
      rowObj._original![col] = val;
    }
    return rowObj;
  });

  return {
    filename: file.name,
    rows,
    columns,
    fileType: 'xlsx'
  };
}

async function parseJsonFile(file: File): Promise<ParseResult> {
  let parsed: unknown;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON syntax. Ensure the file contains valid JSON.');
  }

  const arrayData = Array.isArray(parsed) ? parsed : [parsed];

  if (arrayData.length === 0 || !arrayData[0] || typeof arrayData[0] !== 'object') {
    throw new Error('JSON file must contain an array of records.');
  }

  const columns = Object.keys(arrayData[0]);
  const rows: RowData[] = arrayData.map((rawRow: any, idx) => {
    const rowObj: RowData = {
      _id: `row-${idx + 1}`,
      _sourceRow: idx + 1,
      _original: {}
    };
    for (const col of columns) {
      const val = String(rawRow[col] ?? '');
      rowObj[col] = val;
      rowObj._original![col] = val;
    }
    return rowObj;
  });

  return {
    filename: file.name,
    rows,
    columns,
    fileType: 'json'
  };
}
