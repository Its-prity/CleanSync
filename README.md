# CleanSync ⚡
> **High-Performance Customer Data Onboarding & Sanitization Web App**  
> *Zero Data Leakage • 100% In-Browser Execution • Instant CRM Normalization*

🔗 **Live Production App:** [https://cleansync-cyan.vercel.app](https://cleansync-cyan.vercel.app)

[![Live on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://cleansync-cyan.vercel.app)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-green.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 Overview

Every B2B company and SaaS platform wastes hours manual-cleaning messy customer spreadsheets during onboarding. Dirty data causes CRM sync failures, duplicate outreach, and broken email campaigns.

**CleanSync** automates customer data hygiene right in your browser. It parses CSV and Excel files, analyzes schema, calculates a real-time **Data Quality Health Score (0-100%)**, auto-fixes common domain typos (`@gmai.com` → `@gmail.com`), standardizes phone formats, converts names to Title Case, deduplicates contacts, and isolates unfixable records into a standalone **Quarantine stream**.

---

## 🏗️ Architecture

CleanSync uses a **Client-Side Heavy, Zero-Backend** architecture for maximum speed and enterprise privacy compliance:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CleanSync Architecture                                │
├─────────────────────┬───────────────────────────┬───────────────────────────────┤
│ 1. INGESTION        │ 2. ENGINE (Local Browser) │ 3. PRESENTATION & EXPORTS     │
│                     │                           │                               │
│ ┌─────────────────┐ │ ┌───────────────────────┐ │ ┌───────────────────────────┐ │
│ │ CSV / TSV / XLS │─┼─► Schema & Type Detector│─┼─► Data Quality Health Meter │ │
│ │ Drag & Drop     │ │ └───────────┬───────────┘ │ │ (Real-time 0-100% Score)  │ │
│ └─────────────────┘ │             ▼             │ ├───────────────────────────┤ │
│ ┌─────────────────┐ │ ┌───────────────────────┐ │ │ Interactive Data Grid     │ │
│ │ 1-Click Messy   │─┤ │ Column Mapping Engine │─┼─► • Color-coded dirty cells │ │
│ │ Sample Loader   │ │ └───────────┬───────────┘ │ │ • Filtering (All / Errors)│ │
│ └─────────────────┘ │             ▼             │ ├───────────────────────────┤ │
│                     │ ┌───────────────────────┐ │ │ Before / After Diff Modal │ │
│                     │ │ Cleaning Pipeline     │─┼─► Side-by-side cell diff    │ │
│                     │ │ • Email Syntax & Typos│ │ ├───────────────────────────┤ │
│                     │ │ • Phone Standardizer  │ │ │ Multi-Stream Exporters    │ │
│                     │ │ • Title Casing Names  │ │ │ • Cleaned CSV / XLSX      │ │
│                     │ │ • Deduplication Key   │─┼─► • Quarantine CSV (Errors) │ │
│                     │ │ • Date Normalization  │ │ │ • Audit Changelog (JSON)  │ │
│                     │ └───────────────────────┘ │ └───────────────────────────┘ │
└─────────────────────┴───────────────────────────┴───────────────────────────────┘
```

### Why CleanSync Wins:
- **100% Client-Side Privacy (Zero PII Leakage)**: Customer emails, phones, and addresses never touch an external server.
- **Sub-150ms Processing**: Instantaneous parsing and validation of thousands of rows via Web Data Engines (`PapaParse` & `SheetJS`).
- **Quarantine Isolation**: Incomplete or structurally broken rows are segregated for human review instead of corrupting CRM databases.

---

## 🚀 Key Features

| Stage | Feature | Description |
|---|---|---|
| **Ingestion** | Drag & Drop Upload | Supports `.csv`, `.tsv`, `.xlsx`, `.xls`, `.json` |
| **Ingestion** | 1-Click Demo Data | Instantly loads 25 realistic messy customer records with real-world issues |
| **Audit** | Quality Health Score | 0–100% quality meter with issue counts (bad emails, malformed phones, duplicate rows) |
| **Audit** | Column Mapping | Auto-maps uploaded messy column headers to standard target CRM schema |
| **Cleaning** | Email Typos & Casing | Auto-fixes `@gmai.com`, `@hotmial.com`, `@yaho.com`, validates RFC regex |
| **Cleaning** | Phone Standardization | Standardizes numbers into `(XXX) XXX-XXXX` or `+1 (XXX) XXX-XXXX` |
| **Cleaning** | Name Title Case | Converts `jOHN dOE` / `SARAH CONNOR` to `John Doe` / `Sarah Connor` |
| **Cleaning** | Deduplication | Detects duplicate contacts by primary key (Keep First, Keep Last, Quarantine) |
| **Cleaning** | Date Normalization | Converts varied dates (`12/04/2023`, `Nov 12, 2022`) to ISO `YYYY-MM-DD` |
| **Review** | Side-by-Side Diff Modal | Cell-by-cell inspection comparing raw input vs sanitized CleanSync output |
| **Export** | Production Clean Data | Download clean `.csv` or `.xlsx` |
| **Export** | Quarantine Stream | Standalone `.csv` download of rows needing human attention |
| **Export** | Audit Changelog | Detailed `.json` report documenting each change, before/after values, and applied rules |

---

## 📁 Project Structure

```
CleanSync/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Main state orchestrator & wizard views
│   ├── index.css                   # Custom dark design system (Obsidian slate & emerald)
│   ├── types/
│   │   ├── dataset.ts              # RowData, Dataset, HealthScore, CellIssue
│   │   ├── schema.ts               # Standard CRM schema & column mapping
│   │   └── cleaning.ts             # Rule options, audit log, pipeline results
│   ├── lib/
│   │   ├── parser.ts               # Universal CSV, TSV, XLSX, JSON parser
│   │   ├── detector.ts             # Semantic type detector & health scoring engine
│   │   ├── exporter.ts             # Multi-stream exporter (.csv, .xlsx, .json)
│   │   └── mockData.ts             # 25-row messy demo dataset
│   ├── cleaning/
│   │   ├── pipeline.ts             # Master pipeline runner
│   │   └── rules/
│   │       ├── emailRules.ts       # Domain typo fixer & regex validator
│   │       ├── phoneRules.ts       # Format normalizer & digit validator
│   │       ├── nameRules.ts        # Title Case converter & space stripper
│   │       ├── dateRules.ts        # Universal ISO date normalizer
│   │       └── dedupeRules.ts      # Multi-strategy duplicate detector
│   └── components/
│       ├── layout/
│       │   ├── Header.tsx          # Brand, demo button, reset, GitHub link
│       │   └── Stepper.tsx         # 3-step wizard navigation
│       ├── upload/
│       │   └── DropZone.tsx        # Drag & drop area + messy demo card
│       ├── preview/
│       │   ├── HealthGauge.tsx     # Circular score & issue breakdown
│       │   ├── SchemaMapper.tsx    # Source to target column mapper
│       │   ├── DataTable.tsx       # Filterable data grid with error badges
│       │   └── DiffModal.tsx       # Side-by-side comparison modal
│       ├── cleaning/
│       │   └── RuleControls.tsx    # Cleaning rule switches & pipeline CTA
│       └── export/
│           └── ExportPanel.tsx     # Clean data, quarantine, and audit downloaders
```

---

## 💻 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Its-prity/CleanSync.git
cd CleanSync

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

### Running Tests

```bash
npm test
```

---

## 📄 License

MIT © [Prity Shaw](https://github.com/Its-prity)
