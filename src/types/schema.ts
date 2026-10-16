import { DataType } from './dataset';

export interface StandardField {
  key: string;
  label: string;
  type: DataType;
  required: boolean;
  aliases: string[];
  description: string;
}

export const STANDARD_CRM_SCHEMA: StandardField[] = [
  {
    key: 'full_name',
    label: 'Full Name',
    type: 'name',
    required: true,
    aliases: ['name', 'full_name', 'fullname', 'customer_name', 'customer name', 'client_name', 'contact_name', 'person'],
    description: 'Person or contact primary name'
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'email',
    required: false,
    aliases: ['email', 'e-mail', 'email_address', 'email address', 'mail', 'cust_email', 'contact_email', 'e_mail'],
    description: 'Primary customer email'
  },
  {
    key: 'phone',
    label: 'Phone Number',
    type: 'phone',
    required: false,
    aliases: ['phone', 'phone_number', 'phone number', 'phone_no', 'phone no', 'phone no.', 'telephone', 'tel', 'mobile', 'cell', 'cust_tel'],
    description: 'Standard phone or mobile number'
  },
  {
    key: 'city',
    label: 'City',
    type: 'text',
    required: false,
    aliases: ['city', 'location', 'town'],
    description: 'Customer city or locality'
  },
  {
    key: 'company',
    label: 'Company / Organization',
    type: 'text',
    required: false,
    aliases: ['company', 'company_name', 'organization', 'org', 'business', 'employer'],
    description: 'Customer company or account name'
  },
  {
    key: 'id',
    label: 'Customer ID',
    type: 'id',
    required: false,
    aliases: ['id', 'cust_id', 'customer_id', 'client_id', 'record_id', 'uid'],
    description: 'Unique internal or external identifier'
  },
  {
    key: 'signup_date',
    label: 'Signup Date',
    type: 'date',
    required: false,
    aliases: ['date', 'signup_date', 'signupdate', 'created_at', 'registered', 'joined', 'onboarding_date'],
    description: 'Registration or transaction date'
  }
];

export interface ColumnMapping {
  [sourceKey: string]: string; // source column -> target standard schema key or 'ignore'
}

export function normalizeAlias(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function findMatchingField(columnHeader: string): StandardField | undefined {
  const normalized = normalizeAlias(columnHeader);
  if (!normalized) return undefined;
  return STANDARD_CRM_SCHEMA.find(
    (field) =>
      normalizeAlias(field.key) === normalized ||
      normalizeAlias(field.label) === normalized ||
      field.aliases.some((alias) => normalizeAlias(alias) === normalized)
  );
}
