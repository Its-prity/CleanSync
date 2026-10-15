import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/layout/Header';
import { Stepper, StepId } from './components/layout/Stepper';
import { DropZone } from './components/upload/DropZone';
import { HealthGauge } from './components/preview/HealthGauge';
import { SchemaMapper } from './components/preview/SchemaMapper';
import { DataTable } from './components/preview/DataTable';
import { DiffModal } from './components/preview/DiffModal';
import { RuleControls } from './components/cleaning/RuleControls';
import { ExportPanel } from './components/export/ExportPanel';
import { Dataset, RowData } from './types/dataset';
import { STANDARD_CRM_SCHEMA, ColumnMapping } from './types/schema';
import { CleaningOptions, DEFAULT_CLEANING_OPTIONS, PipelineResult } from './types/cleaning';
import { RAW_MESSY_SAMPLE_DATA } from './lib/mockData';
import { parseFile } from './lib/parser';
import { analyzeDataset } from './lib/detector';
import { runCleaningPipeline } from './cleaning/pipeline';

export const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currentStep, setCurrentStep] = useState<StepId>('upload');
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptions>(DEFAULT_CLEANING_OPTIONS);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [diffModalRow, setDiffModalRow] = useState<RowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-map columns to target schema based on field aliases
  const autoMapColumns = (cols: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    for (const col of cols) {
      const lower = col.toLowerCase().replace(/[\s-_]/g, '');
      const matched = STANDARD_CRM_SCHEMA.find((std) =>
        std.aliases.some((alias) => alias.replace(/[\s-_]/g, '') === lower)
      );
      if (matched) {
        mapping[col] = matched.key;
      } else {
        mapping[col] = col;
      }
    }
    return mapping;
  };

  // Load 1-click messy dataset
  const handleLoadSample = () => {
    setIsLoading(true);
    // Deep clone rows to avoid modifying mock constant
    const rawRows: RowData[] = JSON.parse(JSON.stringify(RAW_MESSY_SAMPLE_DATA));
    const analysis = analyzeDataset(rawRows);
    const cols = analysis.columns.map((c) => c.key);

    setDataset({
      filename: 'sample_messy_crm_contacts.csv',
      columns: analysis.columns,
      rows: rawRows,
      healthScore: analysis.healthScore,
      rawRowCount: rawRows.length
    });

    setColumnMapping(autoMapColumns(cols));
    setPipelineResult(null);
    setCurrentStep('inspect');
    setIsLoading(false);
  };

  // Handle uploaded file
  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    try {
      const parsed = await parseFile(file);
      const analysis = analyzeDataset(parsed.rows, parsed.columns);

      setDataset({
        filename: parsed.filename,
        columns: analysis.columns,
        rows: parsed.rows,
        healthScore: analysis.healthScore,
        rawRowCount: parsed.rows.length
      });

      setColumnMapping(autoMapColumns(parsed.columns));
      setPipelineResult(null);
      setCurrentStep('inspect');
    } catch (err: any) {
      alert(`Error parsing file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Cleaning Pipeline
  const handleRunPipeline = () => {
    if (!dataset) return;
    setIsProcessing(true);

    setTimeout(() => {
      const result = runCleaningPipeline(dataset.rows, cleaningOptions, columnMapping);
      setPipelineResult(result);

      // Re-analyze combined dataset for display
      const displayedRows = [...result.cleanedRows, ...result.quarantineRows];
      const reanalysis = analyzeDataset(displayedRows);

      setDataset((prev) =>
        prev
          ? {
              ...prev,
              rows: displayedRows,
              healthScore: reanalysis.healthScore
            }
          : null
      );

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }

      setIsProcessing(false);
      setCurrentStep('clean');
    }, 300);
  };

  // Reset workspace
  const handleReset = () => {
    setDataset(null);
    setPipelineResult(null);
    setCurrentStep('upload');
    setColumnMapping({});
    setCleaningOptions(DEFAULT_CLEANING_OPTIONS);
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasData={Boolean(dataset)}
      />

      <main className="main-content">
        {/* Stepper Navigation */}
        <Stepper
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
          hasData={Boolean(dataset)}
          isCleaned={Boolean(pipelineResult)}
        />

        {/* STEP 1: UPLOAD */}
        {currentStep === 'upload' && (
          <DropZone
            onFileSelected={handleFileSelected}
            onLoadSample={handleLoadSample}
            isLoading={isLoading}
          />
        )}

        {/* STEP 2: AUDIT & MAPPING */}
        {currentStep === 'inspect' && dataset && (
          <div className="step-content-fade">
            {/* Health Meter & Score */}
            <HealthGauge
              healthScore={dataset.healthScore}
              initialScore={pipelineResult?.stats.initialScore}
            />

            {/* Schema Mapper */}
            <SchemaMapper
              columns={dataset.columns}
              mapping={columnMapping}
              onChangeMapping={(src, tgt) => setColumnMapping((prev) => ({ ...prev, [src]: tgt }))}
              onAutoMap={() => setColumnMapping(autoMapColumns(dataset.columns.map((c) => c.key)))}
            />

            {/* Cleaning Rule Drawer & CTA */}
            <RuleControls
              options={cleaningOptions}
              onChangeOptions={(updated) => setCleaningOptions((prev) => ({ ...prev, ...updated }))}
              onRunPipeline={handleRunPipeline}
              isProcessing={isProcessing}
            />

            {/* Interactive Data Table */}
            <DataTable
              rows={dataset.rows}
              columns={dataset.columns}
              onOpenDiffModal={(row) => setDiffModalRow(row)}
              isCleaned={Boolean(pipelineResult)}
            />
          </div>
        )}

        {/* STEP 3: CLEAN & EXPORT */}
        {currentStep === 'clean' && dataset && pipelineResult && (
          <div className="step-content-fade">
            {/* Health Meter with Comparison */}
            <HealthGauge
              healthScore={dataset.healthScore}
              initialScore={pipelineResult.stats.initialScore}
            />

            {/* Multi-Stream Export Panel */}
            <ExportPanel
              cleanedRows={pipelineResult.cleanedRows}
              quarantineRows={pipelineResult.quarantineRows}
              duplicateRows={pipelineResult.duplicateRows}
              auditLog={pipelineResult.auditLog}
              stats={pipelineResult.stats}
              filename={dataset.filename}
            />

            {/* Live Filterable Results Grid */}
            <DataTable
              rows={dataset.rows}
              columns={dataset.columns}
              onOpenDiffModal={(row) => setDiffModalRow(row)}
              isCleaned={true}
            />
          </div>
        )}
      </main>

      {/* Side-by-Side Diff Modal */}
      {diffModalRow && dataset && (
        <DiffModal
          row={diffModalRow}
          columns={dataset.columns}
          onClose={() => setDiffModalRow(null)}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          CleanSync MVP • Client-Side Customer Data Onboarding & Cleaning Engine
        </p>
      </footer>
    </div>
  );
};

export default App;
