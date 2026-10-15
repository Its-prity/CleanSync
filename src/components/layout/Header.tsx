import { Sparkles, RotateCcw, Database, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample, onReset, hasData }) => {
  return (
    <header className="header-container">
      <div className="header-left">
        <div className="brand-logo">
          <div className="brand-icon">
            <Sparkles className="icon-emerald" size={24} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <span className="brand-title">CleanSync</span>
              <span className="brand-badge">MVP</span>
            </div>
            <p className="brand-subtitle">Customer Data Onboarding & Sanitization</p>
          </div>
        </div>

        <div className="security-pill">
          <ShieldCheck size={14} className="icon-emerald" />
          <span>Zero Data Leakage • 100% In-Browser</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          onClick={onLoadSample}
          className="btn btn-primary"
          id="btn-load-sample"
          title="Load 25 realistic messy customer contact records"
        >
          <Database size={16} />
          <span>Load Messy Sample Data</span>
        </button>

        {hasData && (
          <button
            onClick={onReset}
            className="btn btn-outline"
            id="btn-reset"
            title="Clear and reset workspace"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        )}

        <a
          href="https://github.com/Its-prity/CleanSync"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          title="View GitHub Repository"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          <span className="hide-mobile">GitHub</span>
        </a>
      </div>
    </header>
  );
};
