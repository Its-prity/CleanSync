import React from 'react';

export type StepId = 'upload' | 'match' | 'review' | 'export';

interface StepNavProps {
  currentStep: StepId;
  onSelectStep: (step: StepId) => void;
  hasFile: boolean;
  hasCleaned: boolean;
}

export const StepNav: React.FC<StepNavProps> = ({
  currentStep,
  onSelectStep,
  hasFile,
  hasCleaned,
}) => {
  const steps: { id: StepId; label: string; enabled: boolean }[] = [
    {
      id: 'upload',
      label: 'Upload',
      enabled: true,
    },
    {
      id: 'match',
      label: 'Match columns',
      enabled: hasFile,
    },
    {
      id: 'review',
      label: 'Review',
      enabled: hasFile && hasCleaned,
    },
    {
      id: 'export',
      label: 'Export',
      enabled: hasFile && hasCleaned,
    },
  ];

  return (
    <nav
      className="w-full bg-[#FFFFFF] border-b border-[#DDE3F3]"
      aria-label="Workflow progress"
    >
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        <ul className="flex items-center gap-6 sm:gap-8 overflow-x-auto list-none m-0 p-0">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isClickable = step.enabled;

            return (
              <li key={step.id} className="flex-shrink-0">
                <button
                  type="button"
                  id={`tab-${step.id}`}
                  onClick={() => isClickable && onSelectStep(step.id)}
                  disabled={!isClickable}
                  aria-current={isActive ? 'step' : undefined}
                  className={`py-3.5 px-1 text-sm transition-colors text-left font-medium relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A5BFF] ${
                    isActive
                      ? 'text-[#17233F] font-semibold border-b-[4px] border-[#3A5BFF] -mb-[1px]'
                      : isClickable
                      ? 'text-[#5B6788] hover:text-[#17233F] cursor-pointer'
                      : 'text-[#5B6788]/40 cursor-not-allowed'
                  }`}
                >
                  {step.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
