export type DataType = 'email' | 'phone' | 'name' | 'date' | 'id' | 'number' | 'text' | 'unknown';

export interface CellIssue {
  type: 'invalid_email' | 'email_typo' | 'malformed_phone' | 'inconsistent_casing' | 'invalid_date' | 'missing_required' | 'duplicate';
  message: string;
  suggestedFix?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface RowData {
  _id: string;
  _status?: 'valid' | 'cleaned' | 'quarantined' | 'duplicate';
  _issues?: Record<string, CellIssue>;
  _original?: Record<string, string>;
  [key: string]: any;
}

export interface ColumnMeta {
  key: string;
  originalLabel: string;
  detectedType: DataType;
  sampleValues: string[];
  totalValues: number;
  emptyCount: number;
  invalidCount: number;
}

export interface HealthBreakdown {
  totalRows: number;
  totalCells: number;
  invalidEmails: number;
  emailTypos: number;
  malformedPhones: number;
  casingIssues: number;
  invalidDates: number;
  missingRequired: number;
  duplicateRows: number;
}

export interface HealthScore {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: HealthBreakdown;
  summaryText: string;
}

export interface Dataset {
  filename: string;
  columns: ColumnMeta[];
  rows: RowData[];
  healthScore: HealthScore;
  rawRowCount: number;
}
