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
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else if (extension === 'json') {
    return parseJsonFile(file);
  } else {
    // Default to CSV / TSV
    return parseCsvFile(file);
  }
}

function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          return reject(new Error('CSV file contains no data or could not be parsed.'));
        }

        const columns = results.meta.fields || Object.keys(results.data[0]);
        const rows: RowData[] = results.data.map((rawRow, idx) => {
          const rowObj: RowData = {
            _id: `row-${idx + 1}`,
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
      error: (error) => reject(error)
    });
  });
}

async function parseExcelFile(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel workbook contains no sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (jsonData.length === 0) {
    throw new Error('Excel sheet is empty.');
  }

  const columns = Object.keys(jsonData[0]);
  const rows: RowData[] = jsonData.map((rawRow, idx) => {
    const rowObj: RowData = {
      _id: `row-${idx + 1}`,
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
  const text = await file.text();
  const parsed = JSON.parse(text);
  const arrayData = Array.isArray(parsed) ? parsed : [parsed];

  if (arrayData.length === 0) {
    throw new Error('JSON array is empty.');
  }

  const columns = Object.keys(arrayData[0]);
  const rows: RowData[] = arrayData.map((rawRow, idx) => {
    const rowObj: RowData = {
      _id: `row-${idx + 1}`,
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
