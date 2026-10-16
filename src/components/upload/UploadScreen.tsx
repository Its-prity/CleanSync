import React, { useState, useRef } from 'react';
import { ProofCell } from '../common/ProofCell';

interface UploadScreenProps {
  onFileSelected: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onFileSelected,
  onLoadSample,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayError = errorMessage || localError;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const validateAndPass = (file: File) => {
    setLocalError(null);
    if (onClearError) onClearError();

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls', 'tsv', 'json'].includes(ext)) {
      setLocalError(`The file "${file.name}" has an unsupported format. Please upload a CSV, XLSX, TSV, or JSON file.`);
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      e.target.value = '';
      validateAndPass(file);
    }
  };

  return (
    <div className="w-full py-8 sm:py-12">
      {/* 2-column layout on desktop, stacks below 820px */}
      <div className="upload-grid-layout">
        {/* Left Column */}
        <div className="flex flex-col gap-5 text-left">
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17233F] leading-[1.05]">
              Messy customer files, proofread.
            </h1>
            <p className="text-[#5B6788] text-base leading-relaxed">
              CleanSync catches dirty records, normalizes emails and phone numbers, and flags issues directly in your browser tab.
            </p>
          </div>

          {/* Dashed 2.5px blue drop zone */}
          <div
            id="dropzone-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full p-8 rounded-[22px_22px_6px_22px] border-[2.5px] border-dashed border-[#3A5BFF] transition-dropzone flex flex-col items-center justify-center text-center gap-4 ${
              isDragOver ? 'bg-[#EBF0FF] border-[#2540D6]' : 'bg-[#FFFFFF]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".csv,.xlsx,.xls,.tsv,.json"
              className="hidden"
              id="file-input"
            />

            <div className="space-y-1">
              <p className="text-base font-semibold text-[#17233F]">
                Drag and drop your spreadsheet here
              </p>
              <p className="text-xs text-[#5B6788]">
                Supports CSV, XLSX, TSV, or JSON up to 50MB
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                id="btn-choose-file"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-[8px] bg-[#3A5BFF] hover:bg-[#2540D6] text-white font-medium text-sm border-[1.5px] border-[#17233F] shadow-sm transition-colors cursor-pointer"
              >
                {isLoading ? 'Reading file...' : 'Choose file'}
              </button>

              <button
                type="button"
                id="btn-try-sample"
                onClick={onLoadSample}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-[8px] bg-[#FFFFFF] hover:bg-[#FAFBFF] text-[#17233F] font-medium text-sm border-[1.5px] border-[#17233F] transition-colors cursor-pointer"
              >
                Try the sample
              </button>
            </div>
          </div>

          {/* Inline Error Area */}
          {displayError && (
            <div
              role="alert"
              className="w-full p-4 rounded-[12px] bg-[#FFE1E7] border-[1.5px] border-[#E5385B] text-[#B81D3E] text-sm flex items-start gap-2.5"
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#E5385B]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Unable to process file</p>
                <p className="mt-0.5">{displayError}</p>
              </div>
            </div>
          )}

          {/* Loading state note */}
          {isLoading && (
            <div className="w-full p-3.5 rounded-[12px] bg-[#FAFBFF] border border-[#DDE3F3] text-sm text-[#5B6788] flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-[#3A5BFF] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing spreadsheet and verifying records...</span>
            </div>
          )}
        </div>

        {/* Right Column: Offset-shadow panel "What a correction looks like" */}
        <div className="w-full bg-[#FFFFFF] border-[1.5px] border-[#17233F] panel-corner-bl shadow-hard-highlight p-6 sm:p-7">
          <div className="pb-4 border-b border-[#DDE3F3]">
            <h2 className="font-display text-2xl font-bold text-[#17233F]">
              What a correction looks like
            </h2>
            <p className="text-xs text-[#5B6788] mt-1">
              Every tidy-up is marked inline. Strikethrough shows original values, yellow marks the clean result.
            </p>
          </div>

          <div className="divide-y divide-[#DDE3F3] mt-2">
            {/* Example 1: Full name */}
            <div className="py-3.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#5B6788]">
                <span className="font-medium text-[#17233F]">Full name</span>
                <span>Title casing and trimmed whitespace</span>
              </div>
              <div className="text-sm pt-1">
                <ProofCell original="  jOHN dOE  " clean="John Doe" />
              </div>
            </div>

            {/* Example 2: Email typo */}
            <div className="py-3.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#5B6788]">
                <span className="font-medium text-[#17233F]">Email address</span>
                <span>Domain typo repaired</span>
              </div>
              <div className="text-sm pt-1">
                <ProofCell original="sarah.c@gmai.com" clean="sarah.c@gmail.com" />
              </div>
            </div>

            {/* Example 3: Phone standardization */}
            <div className="py-3.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#5B6788]">
                <span className="font-medium text-[#17233F]">Phone number</span>
                <span>Standardized to E.164</span>
              </div>
              <div className="text-sm pt-1">
                <ProofCell original="(555) 234 5678" clean="+1 555-234-5678" />
              </div>
            </div>

            {/* Example 4: Missing field */}
            <div className="py-3.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#5B6788]">
                <span className="font-medium text-[#17233F]">Customer ID</span>
                <span>Required identifier</span>
              </div>
              <div className="text-sm pt-1">
                <ProofCell
                  original=""
                  clean=""
                  issue={{
                    severity: 'error',
                    type: 'missing_required',
                    message: 'Missing required identifier',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
