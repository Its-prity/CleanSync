import React from 'react';
import { HealthScore } from '../../types/dataset';
import { Activity, Mail, Phone, Copy, Type, Calendar, AlertCircle } from 'lucide-react';

interface HealthGaugeProps {
  healthScore: HealthScore;
  initialScore?: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ healthScore, initialScore }) => {
  const { score, grade, breakdown, summaryText } = healthScore;

  // Determine stroke color based on score
  let strokeColor = '#10b981'; // emerald
  if (score < 60) strokeColor = '#f43f5e'; // rose
  else if (score < 75) strokeColor = '#f59e0b'; // amber
  else if (score < 90) strokeColor = '#06b6d4'; // cyan

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="health-card">
      <div className="health-card-header">
        <div className="flex-align-gap">
          <Activity size={20} className="icon-emerald" />
          <h3 className="section-title">Data Quality Health Meter</h3>
        </div>
        {initialScore !== undefined && initialScore !== score && (
          <span className="health-boost-badge">
            +{score - initialScore}% Quality Boost
          </span>
        )}
      </div>

      <div className="health-content-grid">
        {/* Radial Dial */}
        <div className="gauge-wrap">
          <svg className="gauge-svg" width="140" height="140" viewBox="0 0 140 140">
            <circle
              className="gauge-bg"
              cx="70"
              cy="70"
              r={radius}
              strokeWidth="12"
            />
            <circle
              className="gauge-fill"
              cx="70"
              cy="70"
              r={radius}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              stroke={strokeColor}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="gauge-text">
            <span className="gauge-score">{score}%</span>
            <span className={`gauge-grade grade-${grade.toLowerCase().replace('+', '-plus')}`}>
              Grade {grade}
            </span>
          </div>
        </div>

        {/* Breakdown chips */}
        <div className="health-breakdown-col">
          <p className="health-summary-desc">{summaryText}</p>

          <div className="breakdown-chips-grid">
            <div className={`issue-chip ${breakdown.invalidEmails > 0 ? 'chip-danger' : 'chip-ok'}`}>
              <Mail size={14} />
              <span>{breakdown.invalidEmails} Bad Emails</span>
            </div>

            <div className={`issue-chip ${breakdown.emailTypos > 0 ? 'chip-info' : 'chip-ok'}`}>
              <Mail size={14} />
              <span>{breakdown.emailTypos} Typo Fixable</span>
            </div>

            <div className={`issue-chip ${breakdown.malformedPhones > 0 ? 'chip-warning' : 'chip-ok'}`}>
              <Phone size={14} />
              <span>{breakdown.malformedPhones} Broken Phones</span>
            </div>

            <div className={`issue-chip ${breakdown.duplicateRows > 0 ? 'chip-purple' : 'chip-ok'}`}>
              <Copy size={14} />
              <span>{breakdown.duplicateRows} Duplicate Rows</span>
            </div>

            <div className={`issue-chip ${breakdown.casingIssues > 0 ? 'chip-amber' : 'chip-ok'}`}>
              <Type size={14} />
              <span>{breakdown.casingIssues} Casing Flaws</span>
            </div>

            <div className={`issue-chip ${breakdown.invalidDates > 0 ? 'chip-danger' : 'chip-ok'}`}>
              <Calendar size={14} />
              <span>{breakdown.invalidDates} Malformed Dates</span>
            </div>

            {breakdown.missingRequired > 0 && (
              <div className="issue-chip chip-danger">
                <AlertCircle size={14} />
                <span>{breakdown.missingRequired} Missing Required</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
