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
    key: 'id',
    label: 'Customer ID',
    type: 'id',
    required: false,
    aliases: ['id', 'cust_id', 'customer_id', 'client_id', 'record_id', 'uid'],
    description: 'Unique internal or external identifier'
  },
  {
    key: 'fullName',
    label: 'Full Name',
    type: 'name',
    required: true,
    aliases: ['name', 'full_name', 'customer_name', 'client_name', 'contact_name', 'person'],
    description: 'Person or contact primary name'
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    aliases: ['email', 'email_address', 'mail', 'cust_email', 'contact_email', 'e_mail'],
    description: 'Primary customer email'
  },
  {
    key: 'phone',
    label: 'Phone Number',
    type: 'phone',
    required: false,
    aliases: ['phone', 'phone_number', 'telephone', 'tel', 'mobile', 'cell', 'cust_tel'],
    description: 'Standard phone or mobile number'
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
    key: 'signupDate',
    label: 'Signup Date',
    type: 'date',
    required: false,
    aliases: ['date', 'signup_date', 'created_at', 'registered', 'joined', 'onboarding_date'],
    description: 'Registration or transaction date'
  }
];

export interface ColumnMapping {
  [sourceKey: string]: string; // source column -> target standard schema key or 'ignore'
}
