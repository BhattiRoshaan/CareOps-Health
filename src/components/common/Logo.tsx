import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Calm Medical Cross Symbol */}
      <div className={`relative flex items-center justify-center ${iconSizeClass} rounded-xl bg-teal-800 text-white shadow-xs`}>
        <div className="w-3.5 h-1.5 bg-white/95 rounded-xs" />
        <div className="absolute w-1.5 h-3.5 bg-white/95 rounded-xs" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-semibold tracking-tight text-slate-800 ${textSizeClass}`}>
            CareOps<span className="text-teal-700 font-bold ml-0.5">Health</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-normal text-slate-500 tracking-tight mt-0.5">
            Healthcare Operations Platform
          </span>
        )}
      </div>
    </div>
  );
};
