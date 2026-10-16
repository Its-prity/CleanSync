import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#DDE3F3]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Logo mark + wordmark */}
        <div className="flex items-center gap-2.5">
          <svg
            className="w-7 h-7 text-[#3A5BFF] flex-shrink-0"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="3" y="2" width="22" height="24" rx="4" stroke="#17233F" strokeWidth="2" fill="#FAFBFF" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="#17233F" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="13" x2="20" y2="13" stroke="#DDE3F3" strokeWidth="2" strokeLinecap="round" />
            <rect x="7" y="17" width="9" height="4" rx="1.5" fill="#FFE45C" />
            <path d="M18 19L20 21L24 16" stroke="#12A874" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-2xl font-bold tracking-tight text-[#17233F]">
            CleanSync
          </span>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-xs text-[#5B6788]">
          <span className="w-2 h-2 rounded-full bg-[#12A874] flex-shrink-0" aria-hidden="true" />
          <span>Your file is processed in this browser tab and never uploaded.</span>
        </div>
      </div>
    </header>
  );
};
