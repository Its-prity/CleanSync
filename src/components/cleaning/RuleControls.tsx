import React from 'react';
import { CleaningOptions } from '../../types/cleaning';
import { Sparkles, Mail, Phone, Type, Calendar, Copy, ShieldAlert } from 'lucide-react';

interface RuleControlsProps {
  options: CleaningOptions;
  onChangeOptions: (updated: Partial<CleaningOptions>) => void;
  onRunPipeline: () => void;
  isProcessing: boolean;
}

export const RuleControls: React.FC<RuleControlsProps> = ({
  options,
  onChangeOptions,
  onRunPipeline,
  isProcessing
}) => {
  return (
    <div className="rules-control-card">
      <div className="rules-header">
        <div>
          <h3 className="section-title">Automated Cleaning Pipeline Configuration</h3>
          <p className="section-sub">
            Customize which normalization and hygiene heuristics to apply across this dataset.
          </p>
        </div>

        <button
          onClick={onRunPipeline}
          disabled={isProcessing}
          className="btn btn-emerald-lg"
          id="btn-run-pipeline"
        >
          <Sparkles size={18} className="animate-spin-slow" />
          <span>{isProcessing ? 'Sanitizing Records...' : 'Run CleanSync Pipeline'}</span>
        </button>
      </div>

      <div className="rules-grid">
        {/* Email Rule */}
        <label className="rule-tile">
          <div className="rule-tile-top">
            <div className="rule-icon-circle icon-email">
              <Mail size={16} />
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={options.fixEmailTypos && options.normalizeEmailCasing}
                onChange={(e) =>
                  onChangeOptions({
                    fixEmailTypos: e.target.checked,
                    normalizeEmailCasing: e.target.checked
                  })
                }
              />
              <span className="slider"></span>
            </div>
          </div>
          <span className="rule-name">Email Normalization & Typos</span>
          <p className="rule-desc">
            Lowercase, trim spaces, and auto-correct typos like <code className="code-pill">@gmai.com</code> → <code className="code-pill text-emerald">@gmail.com</code>.
          </p>
        </label>

        {/* Phone Rule */}
        <label className="rule-tile">
          <div className="rule-tile-top">
            <div className="rule-icon-circle icon-phone">
              <Phone size={16} />
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={options.standardizePhones}
                onChange={(e) => onChangeOptions({ standardizePhones: e.target.checked })}
              />
              <span className="slider"></span>
            </div>
          </div>
          <span className="rule-name">Phone Standardization</span>
          <p className="rule-desc">
            Extract pure digits and format into standard <code className="code-pill">(XXX) XXX-XXXX</code> or E.164. Flag short strings.
          </p>
        </label>

        {/* Name Title Case Rule */}
        <label className="rule-tile">
          <div className="rule-tile-top">
            <div className="rule-icon-circle icon-name">
              <Type size={16} />
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={options.titleCaseNames}
                onChange={(e) => onChangeOptions({ titleCaseNames: e.target.checked })}
              />
              <span className="slider"></span>
            </div>
          </div>
          <span className="rule-name">Title Case Names</span>
          <p className="rule-desc">
            Convert chaotic all-caps or all-lower names (<code className="code-pill">jOHN dOE</code>) into clean <code className="code-pill text-emerald">John Doe</code>.
          </p>
        </label>

        {/* Deduplication Rule */}
        <div className="rule-tile">
          <div className="rule-tile-top">
            <div className="rule-icon-circle icon-dedupe">
              <Copy size={16} />
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={options.deduplicate}
                onChange={(e) => onChangeOptions({ deduplicate: e.target.checked })}
              />
              <span className="slider"></span>
            </div>
          </div>
          <span className="rule-name">Smart Deduplication</span>
          <p className="rule-desc">
            Detect duplicate customer profiles by primary identifier.
          </p>
          {options.deduplicate && (
            <div className="dedupe-options-wrap">
              <select
                value={options.dedupeStrategy}
                onChange={(e) => onChangeOptions({ dedupeStrategy: e.target.value as any })}
                className="sub-select"
              >
                <option value="keep_first">Keep First Occurrence</option>
                <option value="keep_last">Keep Latest Occurrence</option>
                <option value="quarantine">Send Duplicates to Quarantine</option>
              </select>
            </div>
          )}
        </div>

        {/* Date Normalization Rule */}
        <label className="rule-tile">
          <div className="rule-tile-top">
            <div className="rule-icon-circle icon-date">
              <Calendar size={16} />
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={options.standardizeDates}
                onChange={(e) => onChangeOptions({ standardizeDates: e.target.checked })}
              />
              <span className="slider"></span>
            </div>
          </div>
          <span className="rule-name">ISO Date Normalization</span>
          <p className="rule-desc">
            Parse irregular date strings (<code className="code-pill">12/04/2023</code>, <code className="code-pill">Nov 12, 2022</code>) into standard <code className="code-pill text-emerald">YYYY-MM-DD</code>.
          </p>
        </label>

        {/* Quarantine Isolation Rule */}
        <label className="rule-tile">
          <div className="rule-tile-top">
            <div className="rule-icon-circle icon-quarantine">
              <ShieldAlert size={16} />
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={options.quarantineInvalidRows}
                onChange={(e) => onChangeOptions({ quarantineInvalidRows: e.target.checked })}
              />
              <span className="slider"></span>
            </div>
          </div>
          <span className="rule-name">Isolate Quarantine Stream</span>
          <p className="rule-desc">
            Separate records with unfixable fatal flaws (e.g. invalid email structure) into a standalone download for triage.
          </p>
        </label>
      </div>
    </div>
  );
};
