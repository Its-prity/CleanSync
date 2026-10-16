import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import { runCleaningPipeline } from '../pipeline';
import { cleanName } from '../rules/nameRules';
import { cleanEmail } from '../rules/emailRules';
import { cleanPhone } from '../rules/phoneRules';
import { deduplicateRows } from '../rules/dedupeRules';
import { findMatchingField, normalizeAlias } from '../../types/schema';
import { DEFAULT_CLEANING_OPTIONS } from '../../types/cleaning';
import { RowData } from '../../types/dataset';
import { neutralizeFormula } from '../../lib/exporter';

describe('CleanSync Processing Engine & Rules', () => {
  // 1. Alias matching
  describe('Alias matching (case, spaces, punctuation)', () => {
    it('matches "E-mail", " email address ", and "MOBILE" to correct schema fields', () => {
      const matchEmail1 = findMatchingField('E-mail');
      expect(matchEmail1).toBeDefined();
      expect(matchEmail1?.key).toBe('email');

      const matchEmail2 = findMatchingField(' email address ');
      expect(matchEmail2).toBeDefined();
      expect(matchEmail2?.key).toBe('email');

      const matchPhone = findMatchingField('MOBILE');
      expect(matchPhone).toBeDefined();
      expect(matchPhone?.key).toBe('phone');

      const matchName = findMatchingField('Customer Name');
      expect(matchName).toBeDefined();
      expect(matchName?.key).toBe('full_name');

      const matchPhoneNo = findMatchingField('Phone No.');
      expect(matchPhoneNo).toBeDefined();
      expect(matchPhoneNo?.key).toBe('phone');
    });

    it('normalizes alias strings by removing spaces, hyphens, punctuation, and lowercasing', () => {
      expect(normalizeAlias(' E-mail Address. ')).toBe('emailaddress');
      expect(normalizeAlias('phone_no.')).toBe('phoneno');
    });
  });

  // 2. Mapping collisions
  describe('Mapping collisions', () => {
    it('detects when two source columns map to the same target field', () => {
      const mapping = {
        'Work Email': 'email',
        'Personal Email': 'email',
        'Mobile': 'phone',
      };

      const targetCounts: Record<string, string[]> = {};
      for (const [src, tgt] of Object.entries(mapping)) {
        if (!targetCounts[tgt]) targetCounts[tgt] = [];
        targetCounts[tgt].push(src);
      }

      const collisions = Object.entries(targetCounts).filter(([, cols]) => cols.length > 1);
      expect(collisions).toHaveLength(1);
      expect(collisions[0][0]).toBe('email');
      expect(collisions[0][1]).toEqual(['Work Email', 'Personal Email']);
    });
  });

  // 3. Unknown columns
  describe('Unknown columns', () => {
    it('preserves unknown columns without breaking output or pipeline execution', () => {
      const rows: RowData[] = [
        {
          _id: 'row-1',
          full_name: 'Jane Doe',
          email: 'jane@example.com',
          custom_metadata_tag: 'VIP-Tier-1',
          legacy_system_code: '44901'
        }
      ];

      const result = runCleaningPipeline(rows, DEFAULT_CLEANING_OPTIONS);
      expect(result.cleanedRows).toHaveLength(1);
      expect(result.cleanedRows[0]['custom_metadata_tag']).toBe('VIP-Tier-1');
      expect(result.cleanedRows[0]['legacy_system_code']).toBe('44901');
      expect(result.cleanedRows[0]._status).toBe('valid');
    });
  });

  // 4. Whitespace trimming and internal whitespace collapsing; email lowercasing
  describe('Whitespace trimming and internal whitespace collapsing; email lowercasing', () => {
    it('collapses internal spaces and trims external spaces on names', () => {
      const res = cleanName('  Prity   Shaw  ', { titleCase: true });
      expect(res.value).toBe('Prity Shaw');
      expect(res.changed).toBe(true);
    });

    it('lowercases emails and trims surrounding whitespace', () => {
      const res = cleanEmail('  PRITY@EXAMPLE.COM  ', { normalizeCase: true });
      expect(res.value).toBe('prity@example.com');
      expect(res.changed).toBe(true);
    });
  });

  // 5. Empty / whitespace-only name → error. Valid and invalid emails
  describe('Name and email validation', () => {
    it('marks empty or whitespace-only name as an error', () => {
      const resEmpty = cleanName('', { titleCase: true });
      expect(resEmpty.issue).toBeDefined();
      expect(resEmpty.issue?.severity).toBe('error');
      expect(resEmpty.issue?.type).toBe('missing_required');

      const resSpaces = cleanName('     ', { titleCase: true });
      expect(resSpaces.issue).toBeDefined();
      expect(resSpaces.issue?.severity).toBe('error');
      expect(resSpaces.issue?.type).toBe('missing_required');
    });

    it('validates correct email syntax', () => {
      const res = cleanEmail('a@b.co', { normalizeCase: true });
      expect(res.issue).toBeUndefined();
      expect(res.value).toBe('a@b.co');
    });

    it('flags invalid emails as errors: prity@, @x.com, a b@x.com, a@b', () => {
      const invalidEmails = ['prity@', '@x.com', 'a b@x.com', 'a@b'];
      for (const email of invalidEmails) {
        const res = cleanEmail(email, { normalizeCase: true });
        expect(res.issue, `Expected issue for email: ${email}`).toBeDefined();
        expect(res.issue?.severity).toBe('error');
        expect(res.issue?.type).toBe('invalid_email');
      }
    });
  });

  // 6. Missing optional fields (email, phone, city) → warnings only
  describe('Missing optional fields', () => {
    it('flags missing optional fields (email, phone, city) with warning severity only', () => {
      const emailRes = cleanEmail('', { normalizeCase: true });
      expect(emailRes.issue).toBeDefined();
      expect(emailRes.issue?.severity).toBe('warning');
      expect(emailRes.issue?.type).toBe('missing_optional');

      const phoneRes = cleanPhone('', { standardize: true });
      expect(phoneRes.issue).toBeDefined();
      expect(phoneRes.issue?.severity).toBe('warning');
      expect(phoneRes.issue?.type).toBe('missing_optional');

      const row: RowData[] = [
        {
          _id: 'row-1',
          full_name: 'Aarav Shah',
          email: '',
          phone: '',
          city: ''
        }
      ];
      const result = runCleaningPipeline(row, DEFAULT_CLEANING_OPTIONS);
      expect(result.cleanedRows).toHaveLength(1);
      expect(result.quarantineRows).toHaveLength(0);
      expect(result.cleanedRows[0]._status).toBe('warning');
      expect(result.cleanedRows[0]._issues?.['email']?.severity).toBe('warning');
      expect(result.cleanedRows[0]._issues?.['phone']?.severity).toBe('warning');
      expect(result.cleanedRows[0]._issues?.['city']?.severity).toBe('warning');
    });
  });

  // 7. Duplicate emails detected AFTER normalization
  describe('Duplicate emails detection', () => {
    it('detects duplicate emails after normalization (e.g. A@x.com and a@x.com )', () => {
      const rows: RowData[] = [
        { _id: 'r1', email: 'A@x.com', full_name: 'Person One' },
        { _id: 'r2', email: 'a@x.com ', full_name: 'Person Two' }
      ];
      const result = deduplicateRows(rows, 'email', 'keep_first');
      expect(result.duplicateCount).toBe(2);
      expect(result.uniqueRows).toHaveLength(2); // Neither merged nor removed
      expect(result.duplicateRows).toHaveLength(2);
      expect(result.uniqueRows[0]._issues?.['email']?.code).toBe('duplicate_email');
      expect(result.uniqueRows[1]._issues?.['email']?.code).toBe('duplicate_email');
    });

    it('duplicate names alone do NOT match', () => {
      const rows: RowData[] = [
        { _id: 'r1', email: 'john1@example.com', full_name: 'John Smith' },
        { _id: 'r2', email: 'john2@example.com', full_name: 'John Smith' }
      ];
      const result = deduplicateRows(rows, 'email', 'keep_first');
      expect(result.duplicateCount).toBe(0);
      expect(result.duplicateRows).toHaveLength(0);
    });

    it('empty emails never count as duplicates of each other', () => {
      const rows: RowData[] = [
        { _id: 'r1', email: '', full_name: 'Person A' },
        { _id: 'r2', email: '   ', full_name: 'Person B' },
        { _id: 'r3', email: '', full_name: 'Person C' }
      ];
      const result = deduplicateRows(rows, 'email', 'keep_first');
      expect(result.duplicateCount).toBe(0);
      expect(result.duplicateRows).toHaveLength(0);
    });
  });

  // 8. Status calculation
  describe('Status calculation', () => {
    it('assigns invalid for errors, warning for warnings only, and valid for clean records', () => {
      const rows: RowData[] = [
        // Clean row -> valid
        { _id: 'r1', full_name: 'Prity Shaw', email: 'prity@example.com', phone: '9876543210', city: 'Surat' },
        // Warning only (missing phone) -> warning
        { _id: 'r2', full_name: 'Aarav Shah', email: 'aarav@example.com', phone: '', city: 'Mumbai' },
        // Error (missing name) -> invalid
        { _id: 'r3', full_name: '', email: 'missing@example.com', phone: '9876543210', city: 'Surat' }
      ];

      const result = runCleaningPipeline(rows, DEFAULT_CLEANING_OPTIONS);
      const r1 = result.cleanedRows.find((r) => r._id === 'r1');
      const r2 = result.cleanedRows.find((r) => r._id === 'r2');
      const r3 = result.quarantineRows.find((r) => r._id === 'r3');

      expect(r1?._status).toBe('valid');
      expect(r2?._status).toBe('warning');
      expect(r3?._status).toBe('invalid');
      expect(result.stats.validCount).toBe(1);
      expect(result.stats.warningCount).toBe(1);
      expect(result.stats.invalidCount).toBe(1);
    });
  });

  // 9. Original records are never mutated
  describe('Immutability of original records', () => {
    it('never mutates input records during processing', () => {
      const originalRows: RowData[] = [
        {
          _id: 'r1',
          full_name: '  Prity   Shaw  ',
          email: 'PRITY@EXAMPLE.COM',
          phone: '9876543210',
          city: '  Surat  '
        }
      ];

      const deepCopySnapshot = JSON.parse(JSON.stringify(originalRows));
      runCleaningPipeline(originalRows, DEFAULT_CLEANING_OPTIONS);

      expect(originalRows).toEqual(deepCopySnapshot);
    });
  });

  // 10. CSV export escaping: commas, quotes, and newlines
  describe('CSV export escaping and round-tripping', () => {
    it('round-trips values containing commas, double quotes, and newlines correctly', () => {
      const records = [
        {
          source_row: '1',
          full_name: 'Smith, Jr., John "The Boss"',
          notes: 'Line 1\nLine 2 with "quotes" and, commas',
          city: 'New York, NY'
        }
      ];

      const unparsed = Papa.unparse(records);
      const reparsed = Papa.parse(unparsed, { header: true });

      expect(reparsed.errors).toHaveLength(0);
      expect(reparsed.data[0]).toEqual(records[0]);
    });
  });

  // 12. Step 2 End-to-end flow with sample file
  describe('Step 2: Sample customer dataset verification', () => {
    const csvData = `Customer Name,E-mail,Phone No.,City
"  Prity Shaw  ",PRITY@example.com,9876543210,Surat
Rahul Mehta,rahul@example.com,9876501234,Ahmedabad
Ananya Patel,invalid-email,," Vadodara "
,missingname@example.com,9876501111,Surat
Rahul Mehta,rahul@example.com,9876501234,Ahmedabad
Aarav Shah,,9876502222,Mumbai`;

    it('verifies all expected results on the sample file', () => {
      const parsed = Papa.parse<Record<string, string>>(csvData, { header: true, skipEmptyLines: 'greedy' });
      expect(parsed.data).toHaveLength(6);
      expect(parsed.meta.fields).toEqual(['Customer Name', 'E-mail', 'Phone No.', 'City']);

      // Auto-mapping check
      const mapping: Record<string, string> = {};
      for (const field of parsed.meta.fields!) {
        const match = findMatchingField(field);
        mapping[field] = match ? match.key : field;
      }
      expect(mapping['Customer Name']).toBe('full_name');
      expect(mapping['E-mail']).toBe('email');
      expect(mapping['Phone No.']).toBe('phone');
      expect(mapping['City']).toBe('city');

      // Convert to RowData
      const rows: RowData[] = parsed.data.map((r, idx) => ({
        _id: `row-${idx + 1}`,
        _sourceRow: idx + 2,
        _original: { ...r },
        ...r
      }));

      const result = runCleaningPipeline(rows, DEFAULT_CLEANING_OPTIONS, mapping);

      // Summary counts check: total 6, valid 1, warnings 3, invalid 2, duplicate records 2
      expect(result.stats.initialRows).toBe(6);
      expect(result.stats.validCount).toBe(1);
      expect(result.stats.warningCount).toBe(3);
      expect(result.stats.invalidCount).toBe(2);
      expect(result.stats.duplicateCount).toBe(2);
      expect(result.cleanedRows).toHaveLength(4);
      expect(result.quarantineRows).toHaveLength(2);

      // Row 2 (Prity): name "Prity Shaw", email "prity@example.com", status Valid
      const prity = result.cleanedRows.find((r) => r.email === 'prity@example.com');
      expect(prity).toBeDefined();
      expect(prity?.full_name).toBe('Prity Shaw');
      expect(prity?._status).toBe('valid');

      // Row Ananya: invalid-email ERROR, city trimmed to Vadodara, phone missing warning, status Invalid
      const ananya = result.quarantineRows.find((r) => r.full_name === 'Ananya Patel');
      expect(ananya).toBeDefined();
      expect(ananya?._status).toBe('invalid');
      expect(ananya?.city).toBe('Vadodara');
      expect(ananya?._issues?.['email']?.severity).toBe('error');
      expect(ananya?._issues?.['email']?.type).toBe('invalid_email');
      expect(ananya?._issues?.['phone']?.severity).toBe('warning');

      // Row missing name: empty name ERROR, status Invalid
      const missingNameRow = result.quarantineRows.find((r) => r.email === 'missingname@example.com');
      expect(missingNameRow).toBeDefined();
      expect(missingNameRow?._status).toBe('invalid');
      expect(missingNameRow?._issues?.['full_name']?.severity).toBe('error');

      // Both Rahul rows: duplicate email warning, neither merged nor removed, both in cleanedRows
      const rahulRows = result.cleanedRows.filter((r) => r.email === 'rahul@example.com');
      expect(rahulRows).toHaveLength(2);
      expect(rahulRows[0]._status).toBe('warning');
      expect(rahulRows[1]._status).toBe('warning');
      expect(rahulRows[0]._issues?.['email']?.code).toBe('duplicate_email');
      expect(rahulRows[1]._issues?.['email']?.code).toBe('duplicate_email');

      // Row Aarav: missing email warning, status Warning
      const aarav = result.cleanedRows.find((r) => r.full_name === 'Aarav Shah');
      expect(aarav).toBeDefined();
      expect(aarav?._status).toBe('warning');
      expect(aarav?._issues?.['email']?.severity).toBe('warning');

      // Cleaned rows contain exactly 4 non-invalid rows
      expect(result.cleanedRows.map((r) => r.full_name)).toEqual([
        'Prity Shaw',
        'Rahul Mehta',
        'Rahul Mehta',
        'Aarav Shah'
      ]);
    });
  });

  // 13. Formula injection neutralization
  describe('Formula injection neutralization', () => {
    it('neutralizes cells starting with =, +, -, or @ by prepending single quote', () => {
      expect(neutralizeFormula('=HYPERLINK("http://evil.com")')).toBe('\'=HYPERLINK("http://evil.com")');
      expect(neutralizeFormula('+12345')).toBe('\'+12345');
      expect(neutralizeFormula('-cmd|/C calc')).toBe('\'-cmd|/C calc');
      expect(neutralizeFormula('@SUM(A1:A10)')).toBe('\'@SUM(A1:A10)');
      expect(neutralizeFormula('Regular Text')).toBe('Regular Text');
      expect(neutralizeFormula('')).toBe('');
      expect(neutralizeFormula(null)).toBe('');
    });
  });

  // 14. Step 4 Edge cases and failure modes
  describe('Step 4: Edge Cases and Failure Modes', () => {
    it('handles duplicate headers by disambiguating with suffixes (Email, Email_2)', () => {
      const csv = `Email,Phone,Email\njohn@example.com,9876543210,alt@example.com`;
      const seenHeaders = new Map<string, number>();
      const parsed = Papa.parse<Record<string, string>>(csv, {
        header: true,
        transformHeader: (header: string) => {
          const clean = header.replace(/^\uFEFF/, '').trim();
          const base = clean || 'Unnamed Column';
          const count = seenHeaders.get(base) || 0;
          seenHeaders.set(base, count + 1);
          return count > 0 ? `${base}_${count + 1}` : base;
        }
      });
      expect(parsed.meta.fields).toEqual(['Email', 'Phone', 'Email_2']);
      expect(parsed.data[0]['Email']).toBe('john@example.com');
      expect(parsed.data[0]['Email_2']).toBe('alt@example.com');
    });

    it('handles UTF-8 BOM and preserves non-ASCII Unicode names ("Zoë Müller", "प्रिती")', () => {
      const csvWithBom = `\uFEFFCustomer Name,Email\n"Zoë Müller",zoe@example.com\n"प्रिती",prity@example.com`;
      const parsed = Papa.parse<Record<string, string>>(csvWithBom, {
        header: true,
        transformHeader: (h) => h.replace(/^\uFEFF/, '').trim()
      });
      expect(parsed.meta.fields).toEqual(['Customer Name', 'Email']);
      const rows: RowData[] = parsed.data.map((r, idx) => ({
        _id: `r-${idx + 1}`,
        full_name: r['Customer Name'],
        email: r['Email']
      }));
      const result = runCleaningPipeline(rows, DEFAULT_CLEANING_OPTIONS);
      expect(result.cleanedRows[0].full_name).toBe('Zoë Müller');
      expect(result.cleanedRows[1].full_name).toBe('प्रिती');
    });

    it('processes a large 50,000 rows dataset and measures performance', () => {
      const largeRows: RowData[] = [];
      for (let i = 1; i <= 50000; i++) {
        largeRows.push({
          _id: `row-${i}`,
          _sourceRow: i + 1,
          full_name: `Customer Name ${i}`,
          email: `customer${i}@example.com`,
          phone: '9876543210',
          city: 'Surat'
        });
      }

      const t0 = performance.now();
      const result = runCleaningPipeline(largeRows, DEFAULT_CLEANING_OPTIONS);
      const elapsedMs = performance.now() - t0;

      expect(result.cleanedRows.length).toBe(50000);
      expect(elapsedMs).toBeLessThan(10000); // Must complete within responsive threshold (< 10 seconds for 50k rows)
      console.log(`[Performance Benchmark] 50,000 rows processed in ${elapsedMs.toFixed(1)}ms`);
    });
  });
});
