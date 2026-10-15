import React from 'react';
import { UploadCloud, CheckCircle2, SlidersHorizontal, Download } from 'lucide-react';

export type StepId = 'upload' | 'inspect' | 'clean';

interface StepperProps {
  currentStep: StepId;
  onSelectStep: (step: StepId) => void;
  hasData: boolean;
  isCleaned: boolean;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, onSelectStep, hasData, isCleaned }) => {
  const steps: { id: StepId; label: string; sub: string; icon: any; enabled: boolean }[] = [
    {
      id: 'upload',
      label: '1. Ingestion',
      sub: 'Upload CSV or Messy Demo',
      icon: UploadCloud,
      enabled: true
    },
    {
      id: 'inspect',
      label: '2. Audit & Mapping',
      sub: 'Data Health & Schema',
      icon: SlidersHorizontal,
      enabled: hasData
    },
    {
      id: 'clean',
      label: '3. Clean & Export',
      sub: isCleaned ? 'Ready for Download' : 'Configure Rules & Clean',
      icon: isCleaned ? Download : CheckCircle2,
      enabled: hasData
    }
  ];

  return (
    <nav className="stepper-container" aria-label="Workflow Navigation">
      <div className="stepper-grid">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = (step.id === 'upload' && hasData) || (step.id === 'inspect' && isCleaned);

          return (
            <button
              key={step.id}
              onClick={() => step.enabled && onSelectStep(step.id)}
              disabled={!step.enabled}
              className={`step-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${!step.enabled ? 'disabled' : ''}`}
              id={`step-${step.id}`}
            >
              <div className="step-icon-wrap">
                <Icon size={18} />
              </div>
              <div className="step-info">
                <span className="step-label">{step.label}</span>
                <span className="step-sub">{step.sub}</span>
              </div>
              {idx < steps.length - 1 && <div className="step-connector" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
