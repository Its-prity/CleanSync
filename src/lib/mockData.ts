import { RowData } from '../types/dataset';

export const RAW_MESSY_SAMPLE_DATA: RowData[] = [
  {
    _id: 'row-1',
    id: 'CUST-1001',
    fullName: 'jOHN dOE',
    email: '  john.doe@GMAIL.COM  ',
    phone: '123-456-7890',
    company: 'Acme Corp',
    signupDate: '12/04/2023'
  },
  {
    _id: 'row-2',
    id: 'CUST-1002',
    fullName: 'SARAH CONNOR',
    email: 'sarah.connor@gmai.com', // typo in domain
    phone: '(555) 234 5678',
    company: 'Cyberdyne Systems',
    signupDate: '2023-05-18'
  },
  {
    _id: 'row-3',
    id: 'CUST-1003',
    fullName: '   alec baldwin   ',
    email: 'alec.baldwin@hollywood.org',
    phone: '5551234567',
    company: 'Broadway Media',
    signupDate: 'Nov 12, 2022'
  },
  {
    _id: 'row-4',
    id: 'CUST-1004',
    fullName: 'BRUCE WAYNE',
    email: 'bruce@wayne-enterprises.com',
    phone: '+1 (800) 555-0199',
    company: 'Wayne Enterprises',
    signupDate: '2024/01/15'
  },
  {
    _id: 'row-5',
    id: 'CUST-1005',
    fullName: 'diana prince',
    email: 'diana@themyscira.gov',
    phone: '  202-555-0143  ',
    company: 'Gateway Antiquities',
    signupDate: '07-22-2023'
  },
  {
    _id: 'row-6',
    id: 'CUST-1006',
    fullName: 'peter parker',
    email: 'peter@dailybugle.net',
    phone: '2125550188',
    company: 'Daily Bugle',
    signupDate: '2023.08.30'
  },
  {
    _id: 'row-7',
    id: 'CUST-1007',
    fullName: 'Tony Stark',
    email: 'tony@stark.io',
    phone: '800-IRON-MAN', // invalid characters
    company: 'Stark Industries',
    signupDate: '2021-12-01'
  },
  {
    _id: 'row-8',
    id: 'CUST-1008',
    fullName: 'clark   kent',
    email: 'clark@dailyplanet.com',
    phone: '(312) 555-0199',
    company: '', // missing company
    signupDate: 'March 3, 2023'
  },
  {
    _id: 'row-9',
    id: 'CUST-1009',
    fullName: 'John Doe', // DUPLICATE of row-1
    email: 'john.doe@gmail.com',
    phone: '1234567890',
    company: 'Acme Corp',
    signupDate: '2023-12-04'
  },
  {
    _id: 'row-10',
    id: 'CUST-1010',
    fullName: 'wanda maximoff',
    email: 'wanda@hotmial.com', // typo hotmial
    phone: '415-555-2671',
    company: 'Westview Realty',
    signupDate: '10/31/2023'
  },
  {
    _id: 'row-11',
    id: 'CUST-1011',
    fullName: 'STEPHEN STRANGE',
    email: 'stephen@kamar-taj.edu',
    phone: '+1 212 555 0110',
    company: 'Metro General Hospital',
    signupDate: '2022-04-05'
  },
  {
    _id: 'row-12',
    id: 'CUST-1012',
    fullName: 'natasha romanoff',
    email: 'natasha@shield.gov',
    phone: '999', // Too short phone
    company: 'Avengers Initiative',
    signupDate: '2023-09-14'
  },
  {
    _id: 'row-13',
    id: 'CUST-1013',
    fullName: 'barry allen',
    email: 'barry@star-labs.org',
    phone: '(555) 789-1234',
    company: 'Central City Police',
    signupDate: 'invalid-date' // broken date
  },
  {
    _id: 'row-14',
    id: 'CUST-1014',
    fullName: 'HAL JORDAN',
    email: 'hal@ferris-aircraft.com',
    phone: '310-555-0149',
    company: 'Ferris Aircraft',
    signupDate: '2024-02-20'
  },
  {
    _id: 'row-15',
    id: 'CUST-1015',
    fullName: 'arthur curry',
    email: 'arthur@atlantis.org',
    phone: '(207) 555-0177',
    company: 'Amnesty Bay Lighthouse',
    signupDate: '01/05/2024'
  },
  {
    _id: 'row-16',
    id: 'CUST-1016',
    fullName: 'VICTOR STONE',
    email: 'victor@yaho.com', // typo yaho
    phone: '313-555-0164',
    company: 'S.T.A.R. Labs',
    signupDate: '2023-11-28'
  },
  {
    _id: 'row-17',
    id: 'CUST-1017',
    fullName: 'selina kyle',
    email: 'selina@gothampaw.com',
    phone: '555-CAT-CLAW', // Malformed phone
    company: 'Gotham Antiques',
    signupDate: '2023-03-15'
  },
  {
    _id: 'row-18',
    id: 'CUST-1018',
    fullName: 'harleen quinzel',
    email: 'bad-email-format@', // Invalid email format
    phone: '212-555-0133',
    company: 'Arkham Asylum',
    signupDate: '2023-10-12'
  },
  {
    _id: 'row-19',
    id: 'CUST-1019',
    fullName: 'Arthur Curry', // DUPLICATE of row-15
    email: 'arthur@atlantis.org',
    phone: '2075550177',
    company: 'Amnesty Bay Lighthouse',
    signupDate: '2024-01-05'
  },
  {
    _id: 'row-20',
    id: 'CUST-1020',
    fullName: 'luke skywalker',
    email: 'luke@tatooine-moisture.com',
    phone: '555 432 1098',
    company: 'Lars Homestead',
    signupDate: 'May 4, 2023'
  },
  {
    _id: 'row-21',
    id: 'CUST-1021',
    fullName: 'LEIA ORGANA',
    email: 'leia@alderaan-senate.gov',
    phone: '+1-202-555-0182',
    company: 'Galactic Alliance',
    signupDate: '2023-06-20'
  },
  {
    _id: 'row-22',
    id: 'CUST-1022',
    fullName: 'han solo',
    email: 'han@falcon-freight.biz',
    phone: '(555) 987-6543',
    company: 'Falcon Freight',
    signupDate: '2022/10/10'
  },
  {
    _id: 'row-23',
    id: 'CUST-1023',
    fullName: 'obi-wan kenobi',
    email: 'ben.kenobi@outpost.net',
    phone: 'invalid_phone_text',
    company: 'Jedi Council',
    signupDate: '2021-05-25'
  },
  {
    _id: 'row-24',
    id: 'CUST-1024',
    fullName: '  gordon freeman  ',
    email: 'gordon@blackmesa.gov',
    phone: '505-555-0199',
    company: 'Black Mesa Research',
    signupDate: '1998-11-19'
  },
  {
    _id: 'row-25',
    id: 'CUST-1025',
    fullName: 'ELLEN RIPLEY',
    email: 'ripley@weyland-yutani.corp',
    phone: '+1 415 555 0101',
    company: 'USCSS Nostromo',
    signupDate: '2024-03-01'
  }
];
