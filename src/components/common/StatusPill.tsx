import React from 'react';

export type StatusType = 'valid' | 'warning' | 'need_look' | 'invalid' | 'blocked' | 'quarantined' | 'duplicate' | 'missing' | 'empty';

interface StatusPillProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label, className = '' }) => {
  let displayLabel = label;
  let colorClasses = '';

  switch (status) {
    case 'valid':
      displayLabel = displayLabel || 'Valid';
      colorClasses = 'bg-[#DDF6EA] text-[#0F7F57] border-[#12A874]/30';
      break;
    case 'warning':
    case 'need_look':
      displayLabel = displayLabel || 'Need a look';
      colorClasses = 'bg-[#FFF1C2] text-[#8A5C00] border-[#B77A00]/30';
      break;
    case 'duplicate':
      displayLabel = displayLabel || 'Duplicate';
      colorClasses = 'bg-[#FFF1C2] text-[#8A5C00] border-[#B77A00]/30';
      break;
    case 'invalid':
    case 'blocked':
    case 'quarantined':
      displayLabel = displayLabel || 'Blocked';
      colorClasses = 'bg-[#FFE1E7] text-[#B81D3E] border-[#E5385B]/30';
      break;
    case 'missing':
      displayLabel = displayLabel || 'missing';
      colorClasses = 'bg-[#FFE1E7] text-[#B81D3E] border-[#E5385B]/30';
      break;
    case 'empty':
      displayLabel = displayLabel || 'empty';
      colorClasses = 'bg-[#FFE1E7] text-[#B81D3E] border-[#E5385B]/20';
      break;
    default:
      displayLabel = displayLabel || 'Valid';
      colorClasses = 'bg-[#DDF6EA] text-[#0F7F57] border-[#12A874]/30';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${colorClasses} ${className}`}
    >
      {displayLabel}
    </span>
  );
};
