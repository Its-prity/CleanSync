import React from 'react';

interface SummaryBarProps {
  validCount: number;
  warningCount: number;
  invalidCount: number;
  className?: string;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  validCount,
  warningCount,
  invalidCount,
  className = '',
}) => {
  const total = validCount + warningCount + invalidCount;

  const validPct = total > 0 ? (validCount / total) * 100 : 0;
  const warningPct = total > 0 ? (warningCount / total) * 100 : 0;
  const invalidPct = total > 0 ? (invalidCount / total) * 100 : 0;

  const ariaDescription = `${validCount} valid, ${warningCount} need a look, ${invalidCount} blocked`;

  return (
    <div
      role="meter"
      aria-label={`Quality breakdown: ${ariaDescription}`}
      aria-valuenow={validCount}
      aria-valuemin={0}
      aria-valuemax={total}
      className={`w-full h-[34px] rounded-full border-[1.5px] border-[#17233F] overflow-hidden flex bg-[#DDE3F3] ${className}`}
    >
      {validPct > 0 && (
        <div
          style={{ width: `${validPct}%` }}
          className="h-full bg-[#12A874] transition-[width] duration-300 ease-out"
          title={`${validCount} valid (${Math.round(validPct)}%)`}
        />
      )}
      {warningPct > 0 && (
        <div
          style={{ width: `${warningPct}%` }}
          className="h-full bg-[#B77A00] transition-[width] duration-300 ease-out"
          title={`${warningCount} need a look (${Math.round(warningPct)}%)`}
        />
      )}
      {invalidPct > 0 && (
        <div
          style={{ width: `${invalidPct}%` }}
          className="h-full bg-[#E5385B] transition-[width] duration-300 ease-out"
          title={`${invalidCount} blocked (${Math.round(invalidPct)}%)`}
        />
      )}
    </div>
  );
};
