import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/layout/Header';
import { StepNav, StepId } from './components/layout/StepNav';
import { UploadScreen } from './components/upload/UploadScreen';
import { MatchColumnsScreen } from './components/match/MatchColumnsScreen';
import { ReviewScreen } from './components/review/ReviewScreen';
import { ExportScreen } from './components/export/ExportScreen';
import { Dataset } from './types/dataset';
import { ColumnMapping, findMatchingField } from './types/schema';
import { CleaningOptions, DEFAULT_CLEANING_OPTIONS, PipelineResult } from './types/cleaning';
import { parseFile } from './lib/parser';
import { analyzeDataset } from './lib/detector';
import { runCleaningPipeline } from './cleaning/pipeline';

export const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currentStep, setCurrentStep] = useState<StepId>('upload');
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptions>(DEFAULT_CLEANING_OPTIONS);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-map columns to target schema based on field aliases
  const autoMapColumns = (cols: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    for (const col of cols) {
      const matched = findMatchingField(col);
      if (matched) {
        mapping[col] = matched.key;
      } else {
        mapping[col] = col;
      }
    }
    return mapping;
  };

  // Load sample dataset
  const handleLoadSample = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch('/sample-customers.csv');
      if (!response.ok) {
        throw new Error('Could not load /sample-customers.csv');
      }
      const text = await response.text();
      const file = new File([text], 'sample-customers.csv', { type: 'text/csv' });
      await handleFileSelected(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load sample dataset.');
      setIsLoading(false);
    }
  };

  // Handle uploaded file
  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const parsed = await parseFile(file);
      const analysis = analyzeDataset(parsed.rows, parsed.columns);

      setDataset({
        filename: parsed.filename,
        columns: analysis.columns,
        rows: parsed.rows,
        healthScore: analysis.healthScore,
        rawRowCount: parsed.rows.length,
        rawRows: JSON.parse(JSON.stringify(parsed.rows)),
        rawColumns: analysis.columns,
      });

      setColumnMapping(autoMapColumns(parsed.columns));
      setPipelineResult(null);
      setCurrentStep('match');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not parse the selected file. Check that the file is not corrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run Cleaning Pipeline
  const handleRunPipeline = () => {
    if (!dataset) return;
    setIsProcessing(true);

    setTimeout(() => {
      const sourceRows = dataset.rawRows || dataset.rows;
      const result = runCleaningPipeline(sourceRows, cleaningOptions, columnMapping);
      setPipelineResult(result);

      // Re-analyze combined dataset for display, preserving source row order
      const displayedRows = [...result.cleanedRows, ...result.quarantineRows].sort(
        (a, b) => (a._sourceRow ?? 0) - (b._sourceRow ?? 0)
      );
      const reanalysis = analyzeDataset(displayedRows);

      setDataset((prev) =>
        prev
          ? {
              ...prev,
              rows: displayedRows,
              columns: reanalysis.columns,
              healthScore: reanalysis.healthScore,
            }
          : null
      );

      // Celebratory confetti
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback if confetti not supported
      }

      setIsProcessing(false);
      setCurrentStep('review');
    }, 250);
  };

  // Reset workspace
  const handleReset = () => {
    setDataset(null);
    setPipelineResult(null);
    setCurrentStep('upload');
    setColumnMapping({});
    setCleaningOptions(DEFAULT_CLEANING_OPTIONS);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#17233F] flex flex-col font-body">
      {/* Top Header */}
      <Header />

      {/* 4-Step Horizontal Tab Strip */}
      <StepNav
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        hasFile={Boolean(dataset)}
        hasCleaned={Boolean(pipelineResult)}
      />

      {/* Main Content Area: max-width 1120px, centered, left-aligned text */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6">
        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <UploadScreen
            onFileSelected={handleFileSelected}
            onLoadSample={handleLoadSample}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        )}

        {/* Step 2: Match columns */}
        {currentStep === 'match' && dataset && (
          <MatchColumnsScreen
            filename={dataset.filename}
            recordCount={dataset.rawRowCount}
            columns={dataset.rawColumns || dataset.columns}
            rows={dataset.rawRows || dataset.rows}
            mapping={columnMapping}
            onChangeMapping={(src, tgt) =>
              setColumnMapping((prev) => ({ ...prev, [src]: tgt }))
            }
            onCleanRecords={handleRunPipeline}
            isProcessing={isProcessing}
          />
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && dataset && pipelineResult && (
          <ReviewScreen
            rows={dataset.rows}
            columns={dataset.columns}
            onProceedToExport={() => setCurrentStep('export')}
          />
        )}

        {/* Step 4: Export */}
        {currentStep === 'export' && dataset && pipelineResult && (
          <ExportScreen
            allRows={dataset.rows}
            cleanedRows={pipelineResult.cleanedRows}
            quarantineRows={pipelineResult.quarantineRows}
            duplicateRows={pipelineResult.duplicateRows}
            auditLog={pipelineResult.auditLog}
            stats={pipelineResult.stats}
            filename={dataset.filename}
            healthScore={dataset.healthScore}
            onStartOver={handleReset}
          />
        )}
      </main>
    </div>
  );
};
export default App;
