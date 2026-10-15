import { RowData } from './dataset';

export interface CleaningOptions {
  fixEmailTypos: boolean;
  normalizeEmailCasing: boolean;
  standardizePhones: boolean;
  titleCaseNames: boolean;
  standardizeDates: boolean;
  deduplicate: boolean;
  dedupeKey: 'email' | 'phone';
  dedupeStrategy: 'keep_first' | 'keep_last' | 'quarantine';
  quarantineInvalidRows: boolean;
  trimWhitespace: boolean;
}

export const DEFAULT_CLEANING_OPTIONS: CleaningOptions = {
  fixEmailTypos: true,
  normalizeEmailCasing: true,
  standardizePhones: true,
  titleCaseNames: true,
  standardizeDates: true,
  deduplicate: true,
  dedupeKey: 'email',
  dedupeStrategy: 'keep_first',
  quarantineInvalidRows: true,
  trimWhitespace: true,
};

export interface AuditChange {
  rowId: string;
  column: string;
  before: string;
  after: string;
  ruleApplied: string;
  timestamp: string;
}

export interface PipelineResult {
  cleanedRows: RowData[];
  quarantineRows: RowData[];
  duplicateRows: RowData[];
  auditLog: AuditChange[];
  stats: {
    initialRows: number;
    cleanCount: number;
    quarantineCount: number;
    duplicateCount: number;
    totalModifications: number;
    initialScore: number;
    finalScore: number;
  };
}
